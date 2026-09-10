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

export const PIE_PALETTE = [
  '#D89A1F', '#16305F', '#2C6B36', '#7A4EAB', '#C05A2B',
  '#2F7F8F', '#8A6A3D', '#5C6472', '#A14C72',
]

/** Conic-gradient donut, as used on the original dashboards. */
export function Pie({ entries, centerLabel = 'responses', palette = PIE_PALETTE }) {
  if (!entries?.length) return <Empty>No data yet.</Empty>
  const total = entries.reduce((sum, e) => sum + e[1], 0)
  let cursor = 0
  const stops = entries.map(([, count], i) => {
    const start = (cursor / total) * 100
    cursor += count
    const end = (cursor / total) * 100
    return `${palette[i % palette.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`
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
