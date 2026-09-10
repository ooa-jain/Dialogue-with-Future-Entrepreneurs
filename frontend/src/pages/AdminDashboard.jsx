import { useCallback, useEffect, useState } from 'react'
import { api, setToken } from '../lib/api'
import { useToast } from '../lib/hooks'
import {
  Alert, BarChart, ChartCard, Empty, MindsetBlock, Pie, PIE_PALETTE, SectionKicker,
  Spinner, ThemeList, Toast, TopBrand,
} from '../components/ui'
import ResponseExplorer from '../components/ResponseExplorer'
import Logo from '../components/Logo'

const VIEWS = [
  { key: 'faculty', label: 'Faculty' },
  { key: 'student', label: 'Student' },
]

const RESEARCH_PALETTE = [
  '#16305F', '#D89A1F', '#2C6B36', '#7A4EAB', '#C05A2B',
  '#2F7F8F', '#8A6A3D', '#5C6472', '#A14C72',
]

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

  return (
    <div>
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
            <div className="eyebrow">Dialogue with Future Entrepreneurs</div>
            <h1>{label} Response Insights</h1>
            <div className="dash-sub">
              {data
                ? `${data.total} ${label.toLowerCase()} response${data.total === 1 ? '' : 's'} recorded · analysed against a 165-theme taxonomy`
                : 'Loading…'}
            </div>
          </div>
        </div>

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
              <SectionKicker num="01 · OVERVIEW">
                <h2 className="sec-title">{label} overview</h2>
                <div className="section-note">
                  Every figure below reflects the responses currently recorded.
                </div>
              </SectionKicker>
              <div className="cards">
                {data.cards.map(([lbl, num]) => (
                  <div className="card" key={lbl}>
                    <div className="num">{num}</div>
                    <div className="lbl">{lbl}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="dash-section">
              <SectionKicker num="02 · WHO RESPONDED">
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

            {view === 'faculty' && data.research ? (
              <section className="dash-section">
                <SectionKicker num="03 · RESEARCH">
                  <h2 className="sec-title">Research Areas &amp; Category Analysis</h2>
                  <div className="section-note">
                    Categories are detected from the four research questions. A profile may appear in more
                    than one category.
                  </div>
                </SectionKicker>

                <div className="two-col" style={{ marginBottom: 20 }}>
                  <ChartCard title="Research Categories — Pie Chart">
                    <Pie
                      entries={data.research.pie}
                      centerLabel="category classifications"
                      palette={RESEARCH_PALETTE}
                    />
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

                <div className="insight-grid" style={{ marginTop: 0, marginBottom: 20 }}>
                  <div className="insight">
                    <div className="insight-label">Faculty with research profile</div>
                    <div className="insight-value">{data.research.insights.with_profile}</div>
                  </div>
                  <div className="insight">
                    <div className="insight-label">Profiles categorised</div>
                    <div className="insight-value">{data.research.insights.categorised}</div>
                  </div>
                  <div className="insight">
                    <div className="insight-label">Average domains / profile</div>
                    <div className="insight-value">{data.research.insights.avg_domains}</div>
                  </div>
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
              <SectionKicker num={view === 'faculty' ? '04 · THEMES' : '03 · THEMES'}>
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

              <div className="insight-grid">
                <div className="insight">
                  <div className="insight-label">Leading future theme</div>
                  <div className="insight-value">
                    {data.insights.leading_self[0]} · {data.insights.leading_self[1]}
                  </div>
                </div>
                <div className="insight">
                  <div className="insight-label">Leading India theme</div>
                  <div className="insight-value">
                    {data.insights.leading_india[0]} · {data.insights.leading_india[1]}
                  </div>
                </div>
                <div className="insight">
                  <div className="insight-label">Responses analysed</div>
                  <div className="insight-value">
                    {data.insights.analysed} {label.toLowerCase()} reflections
                  </div>
                </div>
              </div>
            </section>

            <GroupSection
              num={view === 'faculty' ? '05 · BY DEPARTMENT' : '04 · BY DEPARTMENT'}
              title="Department-wise Theme Insights"
              note="The five strongest themes for each department, for both questions."
              groups={data.group_themes}
            />

            {view === 'student' && data.level_themes ? (
              <GroupSection
                num="05 · BY LEVEL"
                title="Level-wise Theme Insights"
                note="How aspirations differ across UG, PG and research students."
                groups={data.level_themes}
              />
            ) : null}

            <section className="dash-section">
              <SectionKicker num="06 · SUMMARY">
                <h2 className="sec-title">Executive Summary</h2>
              </SectionKicker>
              <ExecSummary summary={data.summary} />
            </section>

            <ResponseExplorer
              view={view}
              onToast={toast.show}
              onChanged={() => setRefreshKey((k) => k + 1)}
            />
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
      <p style={{ fontSize: '13.5px', opacity: 0.75 }}>
        This summary reflects the responses currently recorded and is recalculated each time the
        dashboard loads.
      </p>
    </div>
  )
}
