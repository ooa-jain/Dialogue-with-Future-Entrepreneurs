import { useCallback, useEffect, useState } from 'react'
import { api, setToken } from '../lib/api'
import { useToast } from '../lib/hooks'
import {
  Alert, BarChart, ChartCard, Empty, MindsetBlock, Pie, SectionKicker,
  Spinner, StatTile, ThemeList, Toast, TopBrand, WaveChart, WaveRule,
} from '../components/ui'
import ResponseExplorer from '../components/ResponseExplorer'
import Logo from '../components/Logo'

const VIEWS = [
  { key: 'faculty', label: 'Faculty' },
  { key: 'student', label: 'Student' },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function prettyDate(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number)
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : '—'
}

export default function AdminDashboard({ username, onSignOut }) {
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem('dfe_admin_view') || 'faculty'
    } catch {
      return 'faculty'
    }
  })
  const [counts, setCounts] = useState({ faculty: 0, student: 0 })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const toast = useToast()

  useEffect(() => {
    try {
      localStorage.setItem('dfe_admin_view', view)
    } catch {
      /* ignore */
    }
  }, [view])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [overview, analytics] = await Promise.all([api.overview(), api.analytics(view)])
      setCounts(overview)
      setData(analytics)
    } catch (err) {
      if (err.status === 401) onSignOut()
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [view, onSignOut])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  async function download() {
    if (exporting) return
    setExporting(true)
    try {
      const { blob, filename } = await api.exportFile(view)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.show('Excel workbook downloaded')
    } catch (err) {
      toast.show(err.message)
    } finally {
      setExporting(false)
    }
  }

  const label = view === 'faculty' ? 'Faculty' : 'Student'

  // Section numbers are derived, so a hidden section never leaves a gap.
  const order = ['OVERVIEW', 'PARTICIPATION', 'WHO RESPONDED', 'VOCABULARY']
  if (view === 'faculty' && data?.research) order.push('RESEARCH')
  order.push('THEMES', 'BY DEPARTMENT')
  if (view === 'student' && data?.level_themes) order.push('BY LEVEL')
  order.push('RESPONSES', 'SUMMARY')
  const num = (name) => `${String(order.indexOf(name) + 1).padStart(2, '0')} · ${name}`

  return (
    <div className="sheet dash-sheet">
      <a className="skip-link" href="#dash-main">Skip to the dashboard</a>

      <header className="dash-bar">
        <div className="dash-bar-inner">
          <span className="top-brand-row">
            <Logo size="sm" />
            <span className="top-brand-rule" aria-hidden="true" />
            <TopBrand subtitle="Office of Academics · Response Insights" />
          </span>

          <div className="segmented" role="group" aria-label="Choose respondent view">
            {VIEWS.map((v) => (
              <button key={v.key} type="button" aria-pressed={view === v.key} onClick={() => setView(v.key)}>
                {v.label}
                <span className="count">{counts[v.key] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="head-actions">
            <button className="btn-line" onClick={() => setRefreshKey((k) => k + 1)}>Refresh</button>
            <button className="btn-line" onClick={download} disabled={exporting || !data?.total}>
              {exporting ? 'Preparing…' : 'Download Excel'}
            </button>
            <button
              className="btn-line" title={`Signed in as ${username}`}
              onClick={() => { setToken(''); onSignOut() }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="wrap" id="dash-main">
        <div className="dash-head">
          <div>
            <span className="tag-label">Dialogue with Future Entrepreneurs</span>
            <h1>
              {label} <mark>Response</mark> Insights
            </h1>
            <div className="dash-sub">
              {data
                ? `${data.total} ${label.toLowerCase()} response${data.total === 1 ? '' : 's'} recorded · analysed against a 165-theme taxonomy`
                : 'Loading…'}
            </div>
          </div>
        </div>
        <WaveRule />

        {error ? <Alert kind="error" title="Could not load the dashboard.">{error}</Alert> : null}

        {loading && !data ? (
          <div className="page-loading"><Spinner label="Loading insights" /> Loading insights…</div>
        ) : null}

        {data && data.total === 0 ? (
          <Empty>
            No {label.toLowerCase()} responses recorded yet. Insights appear here automatically once the
            first response is submitted at /{view}.
          </Empty>
        ) : null}

        {data && data.total > 0 ? (
          <>
            <section className="dash-section">
              <SectionKicker num={num('OVERVIEW')}>
                <h2 className="sec-title">{label} overview</h2>
                <div className="section-note">
                  Every figure below reflects the responses currently recorded.
                </div>
              </SectionKicker>
              <div className="cards">
                {data.cards.map(([lbl, n]) => (
                  <div className="card" key={lbl}>
                    <div className="num">{n}</div>
                    <div className="lbl">{lbl}</div>
                  </div>
                ))}
              </div>
            </section>

            {data.timeline ? (
              <section className="dash-section">
                <SectionKicker num={num('PARTICIPATION')}>
                  <h2 className="sec-title">Participation Over Time</h2>
                  <div className="section-note">
                    Responses received on each of the last {data.timeline.days} days. Hover the wave — or
                    tab through it — to read a single day.
                  </div>
                </SectionKicker>

                <ChartCard title={`Daily ${label.toLowerCase()} responses — last ${data.timeline.days} days`}>
                  <WaveChart points={data.timeline.points} label="responses" peak />
                </ChartCard>

                <div className="stat-row">
                  <StatTile
                    label="Received in the last 7 days"
                    value={data.timeline.last_seven}
                    note={`${data.timeline.in_window} in the last ${data.timeline.days} days`}
                  />
                  <StatTile
                    label="Busiest day"
                    value={data.timeline.peak[1]}
                    note={prettyDate(data.timeline.peak[0])}
                  />
                  <StatTile
                    label="Average words per reflection"
                    value={data.depth?.avg_total ?? '—'}
                    note={`${(data.depth?.words_written ?? 0).toLocaleString()} words written in total`}
                  />
                  <StatTile
                    label="Distinct themes detected"
                    value={data.insights.themes_detected ?? '—'}
                    note="Across both vision questions"
                  />
                </div>
              </section>
            ) : null}

            <section className="dash-section">
              <SectionKicker num={num('WHO RESPONDED')}>
                <h2 className="sec-title">Response Analytics</h2>
                <div className="section-note">Who has responded, and from where.</div>
              </SectionKicker>

              <div className="two-col" style={{ marginBottom: 20 }}>
                {view === 'student' ? (
                  <ChartCard title="Level of Study">
                    <Pie entries={data.charts.level} centerLabel="students" />
                  </ChartCard>
                ) : null}
                <ChartCard title="Location Distribution">
                  <Pie entries={data.charts.location} centerLabel="responses" />
                </ChartCard>
                {view === 'faculty' ? (
                  <ChartCard title="Department-wise Responses">
                    <BarChart entries={data.charts.department} limit={14} />
                  </ChartCard>
                ) : null}
              </div>

              <div className="two-col" style={{ marginBottom: 20 }}>
                {view === 'student' ? (
                  <ChartCard title="Department-wise Responses">
                    <BarChart entries={data.charts.department} limit={14} />
                  </ChartCard>
                ) : null}
                <ChartCard
                  title="Programme-wise Responses"
                  note={view === 'faculty' ? 'Counted per academic engagement.' : undefined}
                >
                  <BarChart entries={data.charts.programme} limit={14} />
                </ChartCard>
                {view === 'faculty' ? (
                  <ChartCard title="Semester-wise Responses" note="Counted per academic engagement.">
                    <BarChart entries={data.charts.semester} limit={14} />
                  </ChartCard>
                ) : (
                  <ChartCard title="Year / Semester Responses">
                    <BarChart entries={data.charts.year} limit={14} />
                  </ChartCard>
                )}
              </div>
            </section>

            {data.voice?.length ? (
              <section className="dash-section">
                <SectionKicker num={num('VOCABULARY')}>
                  <h2 className="sec-title">Shared Vocabulary</h2>
                  <div className="section-note">
                    The words the cohort reaches for, across both vision answers. A word is counted
                    once per response, so one long answer cannot carry the list.
                  </div>
                </SectionKicker>

                <ChartCard
                  title="Most Used Words"
                  note="Counted once per response, common words removed."
                >
                  <BarChart entries={data.voice} limit={12} />
                </ChartCard>
              </section>
            ) : null}

            {view === 'faculty' && data.research ? (
              <section className="dash-section">
                <SectionKicker num={num('RESEARCH')}>
                  <h2 className="sec-title">Research Areas &amp; Category Analysis</h2>
                  <div className="section-note">
                    Categories are detected from the four research questions. A profile may appear in more
                    than one category.
                  </div>
                </SectionKicker>

                <div className="two-col" style={{ marginBottom: 20 }}>
                  <ChartCard title="Research Categories — Share of Classifications">
                    <Pie entries={data.research.pie} centerLabel="classifications" />
                  </ChartCard>
                  <ChartCard title="Research Categories — Percentage of Profiles">
                    {data.research.percent.length ? (
                      <>
                        {data.research.percent.map(([name, pct]) => (
                          <div className="research-percent-row" key={name}>
                            <div className="research-percent-label" title={name}>{name}</div>
                            <div className="research-percent-track">
                              <div className="research-percent-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <div className="research-percent-value">{pct.toFixed(1)}%</div>
                          </div>
                        ))}
                        <div className="research-chart-note">
                          Percentages are based on faculty profiles with research information; profiles may
                          appear in multiple categories.
                        </div>
                      </>
                    ) : (
                      <Empty>No research categories identified yet.</Empty>
                    )}
                  </ChartCard>
                </div>

                <div className="stat-row" style={{ marginBottom: 20 }}>
                  <StatTile label="Faculty with research profile" value={data.research.insights.with_profile} />
                  <StatTile label="Profiles categorised" value={data.research.insights.categorised} />
                  <StatTile label="Average domains / profile" value={data.research.insights.avg_domains} />
                </div>

                <div className="research-category-grid">
                  {data.research.categories.map((c) => (
                    <div className="research-category-card" key={c.name}>
                      <div className="research-category-head">
                        <div className="research-category-name">{c.name}</div>
                        <div className="research-category-count">{c.count}</div>
                      </div>
                      <div className="research-category-note">{c.note}</div>
                      <div className="research-track">
                        <div className="research-fill" style={{ width: `${Math.min(c.pct, 100)}%` }} />
                      </div>
                      <div className="research-evidence">
                        <strong>{c.pct}%</strong> of faculty with a research profile are represented here.
                        {c.people.length ? (
                          <div className="research-chip-row">
                            {c.people.map((p, i) => (
                              <span className="research-chip" key={`${p}-${i}`}>{p}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="dash-section">
              <SectionKicker num={num('THEMES')}>
                <h2 className="sec-title">Vision Thematic Analysis</h2>
                <div className="section-note">
                  The pies count each response once, under its strongest theme. The lists below keep every
                  theme a response touched.
                </div>
              </SectionKicker>

              <div className="two-col" style={{ marginBottom: 20 }}>
                <ChartCard title="Overall Thematic Analysis — My Vision for My Future">
                  <Pie entries={data.theme_pies.self} centerLabel="responses" />
                </ChartCard>
                <ChartCard title="Overall Thematic Analysis — My Vision for India's Future">
                  <Pie entries={data.theme_pies.india} centerLabel="responses" />
                </ChartCard>
              </div>

              <div className="two-col">
                <ChartCard title="My Vision for My Future — all themes">
                  <ThemeList entries={data.themes.self} total={data.total} />
                </ChartCard>
                <ChartCard title="My Vision for India's Future — all themes">
                  <ThemeList entries={data.themes.india} total={data.total} />
                </ChartCard>
              </div>

              <div className="stat-row">
                <StatTile
                  label="Leading future theme"
                  value={data.insights.leading_self[0]}
                  note={`${data.insights.leading_self[1]} responses`}
                />
                <StatTile
                  label="Leading India theme"
                  value={data.insights.leading_india[0]}
                  note={`${data.insights.leading_india[1]} responses`}
                />
                <StatTile
                  label="Responses analysed"
                  value={data.insights.analysed}
                  note={`${label.toLowerCase()} reflections`}
                />
              </div>
            </section>

            <GroupSection
              num={num('BY DEPARTMENT')}
              title="Department-wise Theme Insights"
              note="The five strongest themes for each department, for both questions."
              groups={data.group_themes}
            />

            {view === 'student' && data.level_themes ? (
              <GroupSection
                num={num('BY LEVEL')}
                title="Level-wise Theme Insights"
                note="How aspirations differ across UG, PG and research students."
                groups={data.level_themes}
              />
            ) : null}

            <ResponseExplorer
              num={num('RESPONSES')}
              view={view}
              onToast={toast.show}
              onChanged={() => setRefreshKey((k) => k + 1)}
            />

            <section className="dash-section">
              <SectionKicker num={num('SUMMARY')}>
                <h2 className="sec-title">Executive Summary</h2>
              </SectionKicker>
              <ExecSummary summary={data.summary} />
            </section>
          </>
        ) : null}
      </main>

      <Toast message={toast.message} />
    </div>
  )
}

function GroupSection({ num, title, note, groups }) {
  if (!groups?.length) return null
  return (
    <section className="dash-section">
      <SectionKicker num={num}>
        <h2 className="sec-title">{title}</h2>
        <div className="section-note">{note}</div>
      </SectionKicker>
      <div className="department-theme-grid">
        {groups.map((g) => (
          <div className="department-card" key={g.name}>
            <div className="department-card-head">
              <div className="department-name">{g.name}</div>
              <div className="department-total">
                {g.total} response{g.total === 1 ? '' : 's'}
              </div>
            </div>
            <MindsetBlock label="My Vision for My Future" entries={g.self} total={g.total} />
            <MindsetBlock label="My Vision for India's Future" entries={g.india} total={g.total} />
          </div>
        ))}
      </div>
    </section>
  )
}

function ExecSummary({ summary }) {
  const k = (t) => <span className="k">{t}</span>
  return (
    <div className="summary-card">
      <p>
        {k(summary.total)} {summary.audience} reflections have been recorded across{' '}
        {k(summary.department_count)} departments, with the highest representation from{' '}
        {k(summary.top_department)}.
      </p>
      <p>The highest represented location is {k(summary.top_location)}.</p>
      {summary.top_level ? <p>The most represented level of study is {k(summary.top_level)}.</p> : null}
      <p>For {k('My Vision for My Future')}, the leading theme is {k(summary.top_self_theme)}.</p>
      <p>
        For {k("My Vision for India's Future")}, the leading theme is {k(summary.top_india_theme)}.
      </p>
      <p className="summary-foot">
        This summary reflects the responses currently recorded and is recalculated each time the
        dashboard loads.
      </p>
    </div>
  )
}
