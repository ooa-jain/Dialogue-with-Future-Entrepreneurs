import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { Alert, Empty, SectionKicker, Spinner } from './ui'

const SCOPES = [
  { value: '', label: 'All responses' },
  { value: 'self', label: 'Has a future vision' },
  { value: 'india', label: 'Has an India vision' },
]

export default function ResponseExplorer({ view, onToast, onChanged }) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [scope, setScope] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const timer = useRef(null)

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
  }, [view])

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
    try {
      await api.deleteResponse(id)
      setConfirmId(null)
      onToast?.('Response deleted')
      await load()
      onChanged?.()
    } catch (err) {
      onToast?.(err.message)
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.filtered / data.page_size)) : 1

  return (
    <section className="dash-section">
      <SectionKicker num="07 · RESPONSES">
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

      {data && data.items.length === 0 && !loading ? (
        <Empty>No responses match the selected search/filter.</Empty>
      ) : null}

      <div className="response-list">
        {data?.items.map((r, i) => {
          const meta = [
            r.department ? `Department: ${r.department}` : '',
            r.location ? `Location: ${r.location}` : '',
            r.level ? `Level: ${r.level}` : '',
            r.programme ? `Programme: ${r.programme}` : '',
            r.year ? `Year: ${r.year}` : '',
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
                        className="btn-line"
                        style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                        onClick={() => remove(r.id)}
                      >
                        Confirm delete
                      </button>
                      <button className="btn-line" onClick={() => setConfirmId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="btn-line" onClick={() => setConfirmId(r.id)}>Delete</button>
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
          <button className="btn-line" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span>Page {page} of {pages}</span>
          <button className="btn-line" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      ) : null}
    </section>
  )
}
