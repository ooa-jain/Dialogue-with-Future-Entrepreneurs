import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { Alert, Empty, SectionKicker, Spinner } from './ui'

const SCOPES = [
  { value: '', label: 'All responses' },
  { value: 'self', label: 'Has a future vision' },
  { value: 'india', label: 'Has an India vision' },
]

export default function ResponseExplorer({ view, num = '07 · RESPONSES', onToast, onChanged }) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [scope, setScope] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const timer = useRef(null)
  const confirmRef = useRef(null)

  // Clicking Delete replaces that button with two new ones, which drops focus
  // onto the body. Put it on the confirm button instead.
  useEffect(() => {
    if (confirmId && confirmRef.current) confirmRef.current.focus()
  }, [confirmId])

  const scopes = view === 'faculty'
    ? [...SCOPES, { value: 'research', label: 'Has a research profile' }]
    : SCOPES

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setDebounced(query)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer.current)
  }, [query])

  useEffect(() => {
    setQuery('')
    setDebounced('')
    setScope('')
    setPage(1)
    setConfirmId(null)
  }, [view])

  useEffect(() => {
    setConfirmId(null)
  }, [page, scope, debounced])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await api.responses({
        respondent_type: view, q: debounced, scope, page, page_size: 10,
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [view, debounced, scope, page])

  useEffect(() => {
    load()
  }, [load])

  async function remove(id) {
    if (deletingId) return
    setDeletingId(id)
    try {
      await api.deleteResponse(id)
      setConfirmId(null)
      onToast?.('Response deleted')
      await load()
      onChanged?.()
    } catch (err) {
      onToast?.(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.filtered / data.page_size)) : 1

  return (
    <section className="dash-section">
      <SectionKicker num={num}>
        <h2 className="sec-title">
          {view === 'faculty' ? 'Faculty Responses' : 'Student Vision Responses'} — Full View
        </h2>
        <div className="section-note">
          Search across every field, including the written reflections.
        </div>
      </SectionKicker>

      <div className="response-toolbar">
        <input
          className="search-box" type="search"
          placeholder="Search name, department, course, research or reflection…"
          aria-label="Search responses"
          value={query} onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="filter-select" aria-label="Filter responses" value={scope}
          onChange={(e) => { setScope(e.target.value); setPage(1) }}
        >
          {scopes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <div className="response-count">
          {data ? `Showing ${data.items.length} of ${data.filtered} responses (${data.total} total)` : null}
          {loading ? <span style={{ marginLeft: 10 }}><Spinner label="Loading" /></span> : null}
        </div>
      </div>

      {error ? <Alert kind="error">{error}</Alert> : null}

      <div className="sr-only" role="status" aria-live="polite">
        {loading
          ? 'Loading responses'
          : data
            ? `${data.filtered} response${data.filtered === 1 ? '' : 's'} match`
            : ''}
      </div>

      {!data && loading ? (
        <div className="response-list" aria-hidden="true">
          {[0, 1, 2].map((i) => <div className="response-skeleton" key={i} />)}
        </div>
      ) : null}

      {data && data.items.length === 0 && !loading ? (
        <Empty>
          No responses match this search or filter.
          {query || scope ? ' Clear them to see every response.' : ''}
        </Empty>
      ) : null}

      <div className="response-list">
        {data?.items.map((r, i) => {
          const meta = [
            r.department ? `Department: ${r.department}` : '',
            r.location ? `Location: ${r.location}` : '',
            r.level ? `Level: ${r.level}` : '',
            r.programme ? `Programme: ${r.programme}` : '',
            r.year ? `Year: ${r.year}` : '',
            r.meeting_date ? `Meeting: ${r.meeting_date}` : '',
            r.email ? `Email: ${r.email}` : '',
          ].filter(Boolean)

          const research = [
            ['Research Expertise / Area of Specialisation', r.research_expertise],
            ['Current Research Interests', r.research_interests],
            ['Your Research in Focus', r.research_focus],
            ['From Research to Impact', r.research_impact],
          ].filter(([, v]) => String(v || '').trim())

          return (
            <article className="response-card" key={r.id}>
              <div className="response-top">
                <div>
                  <div className="person-name">
                    {r.name || (view === 'faculty' ? 'Faculty Response' : 'Student Response')}
                  </div>
                  <div className="meta">
                    {meta.length
                      ? meta.map((m) => <span key={m}>{m}</span>)
                      : <span>{view === 'faculty' ? 'Faculty response' : 'Student response'}</span>}
                  </div>
                </div>
                <div className="head-actions">
                  <span className="meta">Response {(data.page - 1) * data.page_size + i + 1}</span>
                  {confirmId === r.id ? (
                    <>
                      <button
                        type="button" ref={confirmRef} className="btn-line btn-line-danger"
                        disabled={deletingId === r.id}
                        onClick={() => remove(r.id)}
                      >
                        {deletingId === r.id ? 'Deleting…' : 'Confirm delete'}
                      </button>
                      <button
                        type="button" className="btn-line" disabled={deletingId === r.id}
                        onClick={() => setConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button" className="btn-line"
                      onClick={() => setConfirmId(r.id)}
                      aria-label={`Delete the response from ${r.name || 'this respondent'}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {research.length ? (
                <div className="answer-grid" style={{ marginBottom: 14 }}>
                  {research.map(([label, value]) => (
                    <div className="answer-box research" key={label}>
                      <div className="answer-label">{label}</div>
                      <div className="answer-text">{value}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {r.engagements?.length ? (
                <div className="answer-grid" style={{ marginBottom: 14 }}>
                  {r.engagements.map((e, j) => (
                    <div className="answer-box engagement" key={j}>
                      <div className="answer-label">
                        Academic Engagement {String(j + 1).padStart(2, '0')}
                      </div>
                      <div className="answer-text">
                        {e.programme || '—'} · {e.semester || '—'}
                        {'\n'}
                        {e.course_name || 'Course not specified'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="answer-grid">
                <div className="answer-box self">
                  <div className="answer-label">My Vision for My Future</div>
                  <div className="answer-text">{r.vision_self || 'No response provided.'}</div>
                </div>
                <div className="answer-box india">
                  <div className="answer-label">My Vision for India&rsquo;s Future</div>
                  <div className="answer-text">{r.vision_india || 'No response provided.'}</div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {pages > 1 ? (
        <div className="pager">
          <button
            type="button" className="btn-line" disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>
          <span aria-live="polite">Page {page} of {pages}</span>
          <button
            type="button" className="btn-line" disabled={page >= pages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      ) : null}
    </section>
  )
}
