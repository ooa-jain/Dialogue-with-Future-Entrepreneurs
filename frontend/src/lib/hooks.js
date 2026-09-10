import { useCallback, useEffect, useRef, useState } from 'react'

/** Debounced localStorage draft. Never throws — storage may be unavailable. */
export function useDraft(key) {
  const timer = useRef(null)
  const [savedAt, setSavedAt] = useState(null)

  const read = useCallback(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [key])

  const save = useCallback(
    (value) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify(value))
          setSavedAt(new Date())
        } catch {
          /* ignore */
        }
      }, 600)
    },
    [key],
  )

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    setSavedAt(null)
  }, [key])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { read, save, clear, savedAt }
}

/** Warn before closing the tab while an unsent draft has content. */
export function useUnloadGuard(active) {
  useEffect(() => {
    if (!active) return undefined
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [active])
}

export function useToast() {
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  const show = useCallback((text) => {
    setMessage(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), 2600)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])
  return { message, show }
}

export function wordCount(text) {
  const t = String(text || '').trim()
  return t ? t.split(/\s+/).length : 0
}
