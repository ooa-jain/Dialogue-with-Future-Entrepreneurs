import { useMemo } from 'react'
import { BrandLockup } from './ui'

/** Floating gold specks on the student cover. */
export function Particles({ count = 18 }) {
  const specks = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${-Math.random() * 8}s`,
        animationDuration: `${6 + Math.random() * 6}s`,
      })),
    [count],
  )
  return (
    <div id="particles" aria-hidden="true">
      {specks.map((style, i) => (
        <i className="particle" key={i} style={style} />
      ))}
    </div>
  )
}

export function Cover({ variant = 'front', audience, particles, children, rings }) {
  const student = audience === 'student'
  return (
    <section
      className={`cover cover-${variant}${student ? ' is-student' : ''}${rings ? ' confirm-rings' : ''}`}
    >
      {particles ? <Particles /> : null}
      <div className="cover-inner">{children}</div>
    </section>
  )
}

export { BrandLockup }

export const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M2 8H14M14 8L9 3M14 8L9 13"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/** The line-and-node motif from the faculty cover. */
export const HeroArt = () => (
  <div className="hero-art" aria-hidden="true">
    <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cover-glow" cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#F0C769" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F0C769" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="90" cy="70" r="90" fill="url(#cover-glow)" />
      <g stroke="rgba(255,255,255,0.5)" strokeWidth="1">
        <path d="M20,150 Q140,40 260,110 T410,60" fill="none" />
        <path d="M10,110 Q160,170 300,90 T400,140" fill="none" stroke="rgba(240,199,105,0.55)" />
      </g>
      <g fill="#F0C769">
        <circle cx="20" cy="150" r="3.5" />
        <circle cx="140" cy="70" r="2.5" />
        <circle cx="260" cy="110" r="3" />
        <circle cx="410" cy="60" r="4" />
      </g>
      <g fill="rgba(255,255,255,0.7)">
        <circle cx="300" cy="90" r="2.5" />
        <circle cx="400" cy="140" r="3" />
        <circle cx="160" cy="170" r="2.5" />
      </g>
    </svg>
  </div>
)

/** Animated tick used on the faculty confirmation. */
export const ConfirmMark = () => (
  <svg className="confirm-mark" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="35" cy="35" r="34" stroke="#F0C769" strokeWidth="1.4" />
    <path
      d="M20 36L30 46L50 24"
      stroke="#F0C769"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="60"
      strokeDashoffset="60"
      style={{ animation: 'drawCheck .7s .5s ease forwards' }}
    />
    <style>{'@keyframes drawCheck{to{stroke-dashoffset:0}}'}</style>
  </svg>
)
