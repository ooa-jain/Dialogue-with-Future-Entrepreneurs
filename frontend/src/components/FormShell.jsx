import { Link } from 'react-router-dom'
import BandArt from './BandArt'
import Logo from './Logo'
import { TopBrand } from './ui'
import { wordCount } from '../lib/hooks'

export function TopBar({ savedAt, subtitle }) {
  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <span className="top-brand-row">
          <Logo size="sm" />
          <span className="top-brand-rule" aria-hidden="true" />
          <TopBrand subtitle={subtitle} />
        </span>
        <div className="save-status">
          {savedAt
            ? `Draft saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Saved automatically as you write'}
        </div>
      </div>
    </div>
  )
}

export function ProgressTrack({ steps, current, furthest, onJump }) {
  const pct = ((current - 1) / (steps.length - 1)) * 100
  return (
    <nav className="progress-track" aria-label="Form progress">
      <div className="fill-line" style={{ width: `${pct}%` }} />
      {steps.map((label, i) => {
        const index = i + 1
        const done = index < current
        const active = index === current
        const clickable = index <= furthest && !active
        return (
          <button
            key={label}
            type="button"
            className={`p-step${done ? ' done' : ''}${active ? ' active' : ''}`}
            data-num={String(index).padStart(2, '0')}
            data-clickable={clickable}
            disabled={!clickable}
            onClick={() => clickable && onJump(index)}
            aria-current={active ? 'step' : undefined}
          >
            <span className="p-dot" />
            <span className="p-label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

/** Opening band of a form page — replaces the separate welcome screen. */
export function SheetHero({ tag, title, highlight, tail, children }) {
  return (
    <header className="sheet-hero">
      <span className="tag-mono">{tag}</span>
      <h1>
        {title} <mark>{highlight}</mark>
        {tail ? ` ${tail}` : null}
      </h1>
      {children ? <p>{children}</p> : null}
    </header>
  )
}

export function StepHead({ kicker, heading, note }) {
  return (
    <>
      <div className="step-kicker">{kicker}</div>
      <h2 className="step-heading">{heading}</h2>
      {note ? <div className="research-note">{note}</div> : null}
    </>
  )
}

/** Illustrated band above a step — drawn inline, never fetched. */
export function VisualFrame({ scene, caption, small }) {
  return (
    <div className={`visual-frame${small ? ' small' : ''}`}>
      <div className="art">
        <BandArt scene={scene} />
      </div>
      {caption ? <div className="visual-text">{caption}</div> : null}
    </div>
  )
}

/** Closing rule at the foot of a form page. */
export function SheetFooter() {
  return (
    <footer className="sheet-footer">
      <Logo size="sm" className="sheet-footer-logo" />
      <span>
        JAIN (Deemed-to-be University) · Office of Academics
        <b>Dialogue with Future Entrepreneurs</b>
      </span>
    </footer>
  )
}

export function Reflection({ id, value, onChange, placeholder, error, prompts = [], target = 60 }) {
  const words = wordCount(value)
  const pct = Math.min(100, (words / target) * 100)
  const guidance =
    words === 0
      ? 'Your vision is just beginning…'
      : words < 15
        ? 'Keep going — give your idea a little more shape.'
        : words < 35
          ? 'Your thinking is taking form — keep exploring.'
          : 'Strong reflection — you are painting a clear picture of the future.'

  return (
    <>
      {prompts.length ? (
        <div className="vision-tools">
          {prompts.map((p) => (
            <button
              key={p.label}
              type="button"
              className="prompt-chip"
              onClick={() => onChange(value.trim() ? `${value.trim()} ${p.text}` : p.text)}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="reflection-wrap" data-invalid={error ? 'true' : 'false'}>
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-guide`}
        />
        <div className="reflection-footer">
          <span>{words} {words === 1 ? 'word' : 'words'}</span>
          <span>Saved automatically as you write</span>
        </div>
        <div className="vision-meter" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="vision-meter-label" id={`${id}-guide`}>{guidance}</div>
      </div>
    </>
  )
}

export function ReviewGrid({ rows, onEdit }) {
  return (
    <div className="review-grid">
      {rows.map(({ key, value, step, long }) => (
        <div className={`review-row${long ? ' is-long' : ''}`} key={key}>
          <div className="review-key">{key}</div>
          <div className="review-val">{value || '—'}</div>
          <button type="button" className="review-edit" onClick={() => onEdit(step)}>
            Edit Responses
          </button>
        </div>
      ))}
    </div>
  )
}
