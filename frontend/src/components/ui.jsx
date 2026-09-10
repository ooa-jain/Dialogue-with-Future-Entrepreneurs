import { useEffect, useId, useMemo, useRef, useState } from 'react'

/* ----------------------------------------------------------------- brand */
export function BrandLockup({ subtitle = 'Office of Academics' }) {
  return (
    <div className="brand-lockup">
      <div className="university-name">JAIN (Deemed-to-be University)</div>
      <div className="brand-eyebrow">{subtitle}</div>
    </div>
  )
}

export function TopBrand({ subtitle = 'Office of Academics' }) {
  return (
    <span className="top-brand">
      <b>JAIN (Deemed-to-be University)</b>
      <span>{subtitle}</span>
    </span>
  )
}

/* ------------------------------------------------------------- feedback */
export function Alert({ kind = 'info', title, children }) {
  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{kind === 'error' ? '⚠' : 'ℹ'}</span>
      <div>
        {title ? <b>{title} </b> : null}
        {children}
      </div>
    </div>
  )
}

export function Toast({ message }) {
  return (
    <div className={`toast${message ? ' is-visible' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}

export function Empty({ children }) {
  return <div className="empty-state">{children}</div>
}

export function Spinner({ label = 'Loading' }) {
  return (
    <>
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </>
  )
}

export function FieldError({ id, children }) {
  if (!children) return null
  return (
    <div className="field-error" id={id}>
      <span aria-hidden="true">⚠</span>
      <span>{children}</span>
    </div>
  )
}

/* --------------------------------------------------------------- fields */
export function Field({ label, optional, hint, error, htmlFor, children }) {
  return (
    <div className="field-group" data-field={htmlFor}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {optional ? <span className="field-optional">optional</span> : null}
      </label>
      {children}
      {hint && !error ? <div className="field-hint">{hint}</div> : null}
      <FieldError id={`${htmlFor}-error`}>{error}</FieldError>
    </div>
  )
}

export function TextInput({ id, error, ...props }) {
  return (
    <input
      id={id}
      className="input"
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  )
}

export function TextArea({ id, error, ...props }) {
  return (
    <textarea
      id={id}
      className="input"
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  )
}

export function Select({ id, error, children, ...props }) {
  return (
    <div className="select-wrap">
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

/* ------------------------------------------------------------- combobox */
export function Combobox({ id, options, value, onChange, placeholder, error, otherLabel }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [isOther, setIsOther] = useState(
    Boolean(value) && !options.includes(value) && Boolean(otherLabel),
  )
  const wrapRef = useRef(null)
  const listId = useId()

  useEffect(() => {
    if (!value) {
      setQuery('')
      setIsOther(false)
    } else if (options.includes(value)) {
      setQuery(value)
      setIsOther(false)
    }
  }, [value, options])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || (options.includes(query) && !isOther)) return options
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [query, options, isOther])

  useEffect(() => {
    function onDocPointer(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDocPointer)
    return () => document.removeEventListener('pointerdown', onDocPointer)
  }, [])

  function pick(option) {
    if (otherLabel && option === otherLabel) {
      setIsOther(true)
      setQuery(option)
      onChange('')
    } else {
      setIsOther(false)
      setQuery(option)
      onChange(option)
    }
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setActive(0)
        return
      }
      const next = e.key === 'ArrowDown' ? active + 1 : active - 1
      setActive(((next % filtered.length) + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      if (open && active >= 0 && filtered[active]) {
        e.preventDefault()
        pick(filtered[active])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div className="combo" ref={wrapRef}>
      <input
        id={id}
        className="input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `${listId}-opt-${active}` : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActive(-1)
          setIsOther(false)
          onChange('')
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <div className="combo-panel" id={listId} role="listbox" aria-label="Departments">
          {filtered.length === 0 ? (
            <div className="combo-empty">
              No matching department found. {otherLabel ? `Choose “${otherLabel}” to type your own.` : ''}
            </div>
          ) : (
            filtered.map((option, i) => (
              <button
                key={option}
                type="button"
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={option === value}
                className={`combo-option${i === active ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(option)}
              >
                {option}
              </button>
            ))
          )}
        </div>
      ) : null}
      {isOther ? (
        <input
          className="input"
          style={{ marginTop: 10 }}
          placeholder="Enter your department name"
          aria-label="Your department name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------- choice cards */
export function ChoiceGrid({ options, value, onChange, name }) {
  return (
    <div className="choice-grid" role="group" aria-label={name}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="choice"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          <strong>{o.label}</strong>
          {o.hint ? <small>{o.hint}</small> : null}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- charts */
/** Long institutional names crowd the chart — drop the shared prefix. */
function shortLabel(label) {
  return String(label).replace(/^Departmn?ent of\s+/i, '')
}

export function BarChart({ entries, max: maxProp, limit, suffix = '' }) {
  if (!entries?.length) return <Empty>No data yet.</Empty>
  const shown = limit ? entries.slice(0, limit) : entries
  const max = maxProp || Math.max(...shown.map((e) => e[1]), 1)
  return (
    <div>
      {shown.map(([label, count]) => (
        <div className="bar-row" key={label}>
          <div className="bar-label" title={label}>{shortLabel(label)}</div>
          <div className="bar-track" role="img" aria-label={`${label}: ${count}${suffix}`}>
            <div className="bar-fill" style={{ width: `${Math.min((count / max) * 100, 100)}%` }} />
          </div>
          <div className="bar-val">{count}{suffix}</div>
        </div>
      ))}
      {limit && entries.length > limit ? (
        <div className="bar-more">+ {entries.length - limit} more</div>
      ) : null}
    </div>
  )
}

/**
 * Categorical slots, assigned in this fixed order and never cycled — a ninth
 * series is folded into “Other” by the API instead of inventing a hue.
 * Checked for the OKLCH lightness band, the chroma floor and colour-vision
 * separation (worst adjacent pair ΔE 15.3 deutan) against a white card.
 */
export const PIE_PALETTE = [
  '#2e69b2', '#d9a514', '#298646', '#994caa',
  '#d16022', '#2bb3b9', '#9a3936', '#899d41',
]

/** Single-hue ramp for ordered bands (light → dark, monotone lightness). */
export const SEQUENTIAL_BLUE = ['#79b0e8', '#5593d6', '#3876be', '#215aa2']

/** Conic-gradient donut, as used on the original dashboards. */
export function Pie({ entries, centerLabel = 'responses', palette = PIE_PALETTE }) {
  if (!entries?.length) return <Empty>No data yet.</Empty>
  const total = entries.reduce((sum, e) => sum + e[1], 0)
  // A hairline of the card surface between slices, in place of a stroke.
  const gap = entries.length > 1 ? 0.45 : 0
  let cursor = 0
  const stops = entries.flatMap(([, count], i) => {
    const start = (cursor / total) * 100
    cursor += count
    const end = (cursor / total) * 100
    const cut = Math.max(start, end - gap)
    const slice = `${palette[i % palette.length]} ${start.toFixed(2)}% ${cut.toFixed(2)}%`
    return gap ? [slice, `#fff ${cut.toFixed(2)}% ${end.toFixed(2)}%`] : [slice]
  })

  return (
    <div className="theme-pie-wrap">
      <div
        className="theme-pie"
        style={{ background: `conic-gradient(${stops.join(',')})` }}
        role="img"
        aria-label={`${total} ${centerLabel}`}
      >
        <div className="theme-pie-center">
          {total}
          <small>{centerLabel}</small>
        </div>
      </div>
      <div className="theme-pie-legend">
        {entries.map(([label, count], i) => (
          <div className="theme-pie-item" key={label}>
            <span className="theme-pie-dot" style={{ background: palette[i % palette.length] }} />
            <span className="theme-pie-label">{label}</span>
            <span className="theme-pie-value">
              {count} · {((count / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ThemeList({ entries, total, limit = 12 }) {
  if (!entries?.length) return <Empty>No responses to analyse yet.</Empty>
  const shown = entries.slice(0, limit)
  const max = Math.max(...shown.map((e) => e[1]), 1)
  return (
    <div className="theme-list">
      {shown.map(([name, count]) => (
        <div className="theme-item" key={name}>
          <div className="theme-head">
            <span className="theme-name">{name}</span>
            <span>
              <span className="theme-count">{count}</span>
              {total ? <span className="theme-percent">{Math.round((count / total) * 100)}%</span> : null}
            </span>
          </div>
          <div className="theme-track">
            <div className="theme-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </div>
      ))}
      {entries.length > limit ? (
        <div className="theme-more">+ {entries.length - limit} more themes detected</div>
      ) : null}
    </div>
  )
}

/** Compact five-theme block used inside department / level cards. */
export function MindsetBlock({ label, entries, total }) {
  if (!entries?.length) {
    return (
      <div className="mindset-block">
        <div className="mindset-label">{label}</div>
        <div className="department-empty">No analysable response.</div>
      </div>
    )
  }
  const max = Math.max(...entries.map((e) => e[1]), 1)
  return (
    <div className="mindset-block">
      <div className="mindset-label">{label}</div>
      {entries.map(([theme, count]) => (
        <div key={theme}>
          <div className="mindset-theme">
            <span className="mindset-theme-name" title={theme}>{theme}</span>
            <span className="mindset-theme-count">
              {count} <small>({total ? Math.round((count / total) * 100) : 0}%)</small>
            </span>
          </div>
          <div className="mindset-track">
            <div className="mindset-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </div>
      ))}
      <div className="mindset-note">
        Leading theme: <strong>{entries[0][0]}</strong>
      </div>
    </div>
  )
}

export function ChartCard({ title, note, children }) {
  return (
    <section className="chart-card">
      {title ? <h3 className="chart-title">{title}</h3> : null}
      {note ? <div className="chart-note">{note}</div> : null}
      {children}
    </section>
  )
}

export function SectionKicker({ num, children }) {
  return (
    <>
      <div className="section-kicker">
        <span className="num">{num}</span>
        <span className="line" />
      </div>
      {children}
    </>
  )
}

/* ------------------------------------------------- participation over time */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function shortDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS[m - 1]}`
}

function longDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/**
 * Monotone cubic (Fritsch–Carlson) through the points. A plain Catmull-Rom
 * overshoots on spiky daily counts and dips the curve below zero, which would
 * draw days that never happened.
 */
function smoothPath(pts) {
  if (pts.length < 2) return ''
  const n = pts.length
  const dx = []
  const slope = []
  for (let i = 0; i < n - 1; i += 1) {
    dx.push(pts[i + 1][0] - pts[i][0])
    slope.push((pts[i + 1][1] - pts[i][1]) / (pts[i + 1][0] - pts[i][0]))
  }

  const m = [slope[0]]
  for (let i = 1; i < n - 1; i += 1) {
    if (slope[i - 1] * slope[i] <= 0) {
      m.push(0) // a turning point stays a turning point — no overshoot
    } else {
      const w1 = 2 * dx[i] + dx[i - 1]
      const w2 = dx[i] + 2 * dx[i - 1]
      m.push((w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]))
    }
  }
  m.push(slope[n - 2])

  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i] / 3
    d += ` C ${(pts[i][0] + h).toFixed(2)} ${(pts[i][1] + m[i] * h).toFixed(2)},`
    d += ` ${(pts[i + 1][0] - h).toFixed(2)} ${(pts[i + 1][1] - m[i + 1] * h).toFixed(2)},`
    d += ` ${pts[i + 1][0].toFixed(2)} ${pts[i + 1][1].toFixed(2)}`
  }
  return d
}

const W = 760
const H = 214
const PAD = { top: 22, right: 18, bottom: 30, left: 34 }

/**
 * One series over time — a wave. Single series, so no legend: the card title
 * names it. Hover (and keyboard focus) reads out any single day, and the
 * table underneath carries every value for anyone the colour fails.
 */
export function WaveChart({ points, label = 'responses', peak }) {
  const [active, setActive] = useState(-1)
  const id = useId()
  if (!points?.length) return <Empty>No dated responses yet.</Empty>

  const counts = points.map((p) => p[1])
  const max = Math.max(...counts, 1)
  const niceMax = max <= 4 ? max : Math.ceil(max / 4) * 4
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (i) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v) => PAD.top + innerH - (v / niceMax) * innerH

  const coords = points.map((p, i) => [x(i), y(p[1])])
  const line = smoothPath(coords)
  const area = `${line} L ${x(points.length - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`
  // Integer ticks only — a gridline labelled 2 must not sit at 1.5.
  const ticks = niceMax <= 4
    ? Array.from({ length: niceMax + 1 }, (_, i) => i)
    : [0, niceMax / 2, niceMax]
  const peakIndex = counts.indexOf(Math.max(...counts))
  const shown = active >= 0 ? active : -1
  const total = counts.reduce((a, b) => a + b, 0)

  return (
    <div className="wave-wrap">
      <div
        className="wave-plot"
        onMouseLeave={() => setActive(-1)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="wave-svg"
          role="img"
          aria-label={`${total} ${label} across ${points.length} days, peaking at ${max} on ${longDate(points[peakIndex][0])}`}
        >
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e69b2" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#2e69b2" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line
                className="wave-grid"
                x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)}
              />
              <text className="wave-tick" x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
                {Math.round(t)}
              </text>
            </g>
          ))}

          <path d={area} fill={`url(#${id}-fill)`} />
          <path d={line} className="wave-line" />

          {peak && counts[peakIndex] > 0 ? (
            <>
              <circle className="wave-peak-dot" cx={x(peakIndex)} cy={y(counts[peakIndex])} r="4.5" />
              <text
                className="wave-peak-label"
                x={Math.min(Math.max(x(peakIndex), PAD.left + 26), W - PAD.right - 26)}
                y={Math.max(y(counts[peakIndex]) - 13, 14)}
                textAnchor="middle"
              >
                {counts[peakIndex]} on {shortDate(points[peakIndex][0])}
              </text>
            </>
          ) : null}

          {shown >= 0 ? (
            <>
              <line
                className="wave-crosshair"
                x1={x(shown)} x2={x(shown)} y1={PAD.top} y2={PAD.top + innerH}
              />
              <circle className="wave-dot" cx={x(shown)} cy={y(counts[shown])} r="5" />
            </>
          ) : null}

          <text className="wave-tick" x={PAD.left} y={H - 8}>{shortDate(points[0][0])}</text>
          <text className="wave-tick" x={W - PAD.right} y={H - 8} textAnchor="end">
            {shortDate(points[points.length - 1][0])}
          </text>

          {points.map((p, i) => (
            <rect
              key={p[0]}
              className="wave-hit"
              x={x(i) - innerW / points.length / 2}
              y={PAD.top}
              width={innerW / points.length}
              height={innerH}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(-1)}
              tabIndex={0}
              role="img"
              aria-label={`${longDate(p[0])}: ${p[1]} ${label}`}
            />
          ))}
        </svg>

        {shown >= 0 ? (
          <div
            className="wave-tip"
            style={{ left: `${(x(shown) / W) * 100}%` }}
            role="status"
          >
            <b>{counts[shown]}</b> {counts[shown] === 1 ? label.replace(/s$/, '') : label}
            <span>{longDate(points[shown][0])}</span>
          </div>
        ) : null}
      </div>

      <details className="chart-table">
        <summary>Show the daily figures</summary>
        <table>
          <thead>
            <tr><th scope="col">Date</th><th scope="col">Responses</th></tr>
          </thead>
          <tbody>
            {points.filter((p) => p[1] > 0).map((p) => (
              <tr key={p[0]}>
                <td>{longDate(p[0])}</td>
                <td>{p[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

/* ------------------------------------------------------------- column bars */
/**
 * Vertical bar graph for a handful of ordered bands. One hue, stepped
 * light → dark with the band order — never darker-because-bigger.
 */
export function ColumnChart({ entries, palette = SEQUENTIAL_BLUE, unit = '' }) {
  if (!entries?.length) return <Empty>No data yet.</Empty>
  const max = Math.max(...entries.map((e) => e[1]), 1)
  const total = entries.reduce((sum, e) => sum + e[1], 0)
  return (
    <div className="column-chart">
      <div className="column-row">
        {entries.map(([label, count], i) => (
          <div
            className="column-slot"
            key={label}
            title={`${label}: ${count}${unit}`}
          >
            <div className="column-value">{count}</div>
            <div className="column-track">
              <div
                className="column-fill"
                style={{
                  height: `${(count / max) * 100}%`,
                  minHeight: count ? 3 : 0,
                  background: palette[i % palette.length],
                }}
              />
            </div>
            <div className="column-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="column-foot">
        {total} response{total === 1 ? '' : 's'} placed across {entries.length} bands
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- tiles */
export function StatTile({ label, value, note }) {
  return (
    <div className="stat-tile">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {note ? <div className="stat-note">{note}</div> : null}
    </div>
  )
}

/** Decorative wave rule under the dashboard masthead. */
export function WaveRule() {
  return (
    <svg className="wave-rule" viewBox="0 0 1200 46" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 30 C 150 4, 250 44, 400 26 S 650 2, 800 24 S 1050 46, 1200 18"
        fill="none" stroke="#2e69b2" strokeOpacity="0.5" strokeWidth="2"
      />
      <path
        d="M0 38 C 170 16, 260 50, 420 34 S 660 12, 820 32 S 1060 52, 1200 28"
        fill="none" stroke="#d89a1f" strokeOpacity="0.55" strokeWidth="2"
      />
    </svg>
  )
}
