import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDraft, useUnloadGuard } from './hooks'

/**
 * Shared multi-step form engine.
 *
 * Fixes carried over from the original standalone forms:
 *  - errors clear the moment a field changes, and never block a Back step
 *  - the first invalid field is focused and scrolled into view
 *  - drafts are debounced (no toast on every keystroke) and restorable
 *  - a failed submit surfaces the real reason instead of a false confirmation
 *  - the submit button cannot be double-fired
 */
export function useWizard({ draftKey, initial, validators, submit, stepCount }) {
  const draft = useDraft(draftKey)
  const [data, setData] = useState(initial)
  const [step, setStep] = useState(1)
  const [furthest, setFurthest] = useState(1)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | saving | done
  const [formError, setFormError] = useState('')
  const [restored, setRestored] = useState(false)
  const [result, setResult] = useState(null)
  const firstLoad = useRef(true)

  useEffect(() => {
    const saved = draft.read()
    if (saved?.data) {
      setData((d) => ({ ...d, ...saved.data }))
      setStep(Math.min(saved.step || 1, stepCount))
      setFurthest(Math.min(saved.furthest || saved.step || 1, stepCount))
      setRestored(true)
    }
    firstLoad.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dirty = useMemo(
    () => status !== 'done' && JSON.stringify(data) !== JSON.stringify(initial),
    [data, initial, status],
  )

  // Only write a draft once the person has actually entered something, so the
  // header never claims to have saved an empty form.
  useEffect(() => {
    if (firstLoad.current || status === 'done' || !dirty) return
    draft.save({ data, step, furthest })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, step, furthest, status, dirty])

  useUnloadGuard(dirty)

  const set = useCallback((patch) => {
    setData((d) => ({ ...d, ...patch }))
    setErrors((e) => {
      const next = { ...e }
      Object.keys(patch).forEach((k) => delete next[k])
      return next
    })
    setFormError('')
  }, [])

  const focusFirstError = useCallback((found) => {
    const key = Object.keys(found)[0]
    if (!key) return
    requestAnimationFrame(() => {
      const el =
        document.getElementById(`f-${key}`) ||
        document.querySelector(`[data-field="${key}"]`)
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        if (typeof el.focus === 'function') el.focus({ preventScroll: true })
      }
    })
  }, [])

  const next = useCallback(() => {
    const found = validators[step] ? validators[step](data) : {}
    if (Object.keys(found).length) {
      setErrors(found)
      focusFirstError(found)
      return
    }
    setErrors({})
    const target = Math.min(step + 1, stepCount)
    setStep(target)
    setFurthest((f) => Math.max(f, target))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [data, step, stepCount, validators, focusFirstError])

  const back = useCallback(() => {
    setErrors({})
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const jump = useCallback((target) => {
    setErrors({})
    setStep(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const send = useCallback(async () => {
    if (status === 'saving') return
    // Re-run every validator so nothing invalid slips through the review step.
    for (let s = 1; s < stepCount; s += 1) {
      const found = validators[s] ? validators[s](data) : {}
      if (Object.keys(found).length) {
        setStep(s)
        setErrors(found)
        setFormError('Some answers still need attention. We have taken you back to them.')
        focusFirstError(found)
        return
      }
    }
    setStatus('saving')
    setFormError('')
    try {
      const res = await submit(data)
      draft.clear()
      setResult(res)
      setStatus('done')
      window.scrollTo({ top: 0, behavior: 'auto' })
    } catch (err) {
      setStatus('idle')
      if (err.fields) setErrors(err.fields)
      setFormError(err.message || 'We could not save your response. Please try again.')
    }
  }, [data, status, stepCount, submit, validators, draft, focusFirstError])

  const reset = useCallback(() => {
    draft.clear()
    setData(initial)
    setStep(1)
    setFurthest(1)
    setErrors({})
    setFormError('')
    setResult(null)
    setStatus('idle')
    setRestored(false)
  }, [draft, initial])

  const discardDraft = useCallback(() => {
    draft.clear()
    setData(initial)
    setStep(1)
    setFurthest(1)
    setRestored(false)
  }, [draft, initial])

  return {
    data, set, step, furthest, errors, status, formError, restored, result,
    next, back, jump, send, reset, discardDraft, savedAt: draft.savedAt,
  }
}

export const required = (value) => !String(value || '').trim()

export function emailLooksWrong(value) {
  const v = String(value || '').trim()
  if (!v) return false
  return !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
}
