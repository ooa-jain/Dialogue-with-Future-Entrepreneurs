/**
 * Illustrated bands for the form steps.
 *
 * Drawn inline as SVG rather than loaded as photographs: they always render
 * (no external host, no slow first paint, nothing to break behind a campus
 * firewall), they stay on the navy/gold palette, and they scale without
 * artefacts. Geometric line work only — no emoji, no stock imagery.
 */

const GOLD = '#F0C769'
const WHITE = 'rgba(255,255,255,0.72)'

/* ---------------------------------------------------------------- icons */
/* Each icon is drawn inside a 64 × 64 box, stroked, never filled. */

const Icons = {
  person: (
    <>
      <circle cx="32" cy="23" r="11" />
      <path d="M12 53c0-11 9-17 20-17s20 6 20 17" />
    </>
  ),
  card: (
    <>
      <rect x="7" y="15" width="50" height="34" rx="4" />
      <circle cx="22" cy="28" r="6" />
      <path d="M13 42c0-5 4-8 9-8s9 3 9 8" />
      <path d="M38 26h13M38 34h13M38 42h9" />
    </>
  ),
  compass: (
    <>
      <circle cx="32" cy="32" r="22" />
      <path d="M42 22l-7 13-13 7 7-13z" />
      <circle cx="32" cy="32" r="2.5" />
    </>
  ),
  cap: (
    <>
      <path d="M5 24L32 12l27 12-27 12z" />
      <path d="M16 30v12c0 5 7 9 16 9s16-4 16-9V30" />
      <path d="M55 26v13" />
    </>
  ),
  book: (
    <>
      <path d="M9 14h17c4 0 6 2 6 6v31c0-3-2-5-6-5H9z" />
      <path d="M55 14H38c-4 0-6 2-6 6v31c0-3 2-5 6-5h17z" />
    </>
  ),
  grid: (
    <>
      <rect x="9" y="13" width="46" height="38" rx="3" />
      <path d="M9 26h46" />
      <path d="M24 26v25M40 26v25" />
    </>
  ),
  path: (
    <>
      <path d="M8 50h13V36h14V22h16" />
      <circle cx="8" cy="50" r="3.5" />
      <circle cx="21" cy="36" r="3.5" />
      <circle cx="35" cy="22" r="3.5" />
      <circle cx="53" cy="22" r="3.5" />
    </>
  ),
  steps: (
    <>
      <path d="M7 53h13V40h13V27h13V14h11" />
      <path d="M7 53h47" />
    </>
  ),
  flag: (
    <>
      <path d="M18 9v46" />
      <path d="M18 13h27l-7 9 7 9H18z" />
    </>
  ),
  rise: (
    <>
      <path d="M8 47L22 36l12 5 12-16" />
      <circle cx="8" cy="47" r="3" />
      <circle cx="22" cy="36" r="3" />
      <circle cx="34" cy="41" r="3" />
      <circle cx="46" cy="25" r="3" />
      <path d="M52 9l2.4 6.6L61 18l-6.6 2.4L52 27l-2.4-6.6L43 18l6.6-2.4z" />
    </>
  ),
  target: (
    <>
      <circle cx="32" cy="32" r="22" />
      <circle cx="32" cy="32" r="13" />
      <circle cx="32" cy="32" r="4.5" />
    </>
  ),
  spark: (
    <>
      <path d="M32 8v13M32 43v13M8 32h13M43 32h13" />
      <path d="M16 16l9 9M39 39l9 9M48 16l-9 9M25 39l-9 9" />
      <circle cx="32" cy="32" r="7" />
    </>
  ),
  skyline: (
    <>
      <path d="M6 52h10V29h11v23h8V19h11v33h8V33h10v19" />
      <path d="M4 52h56" />
      <path d="M20 35h3M20 43h3M39 27h3M39 37h3" />
    </>
  ),
  arch: (
    <>
      <path d="M15 53V28a17 17 0 0 1 34 0v25" />
      <path d="M7 53h50" />
      <path d="M24 53V37M40 53V37" />
    </>
  ),
  network: (
    <>
      <path d="M17 20L47 15M17 20l14 21M47 15l-16 26M31 41l19 6" />
      <circle cx="17" cy="20" r="4.5" />
      <circle cx="47" cy="15" r="4.5" />
      <circle cx="31" cy="41" r="4.5" />
      <circle cx="52" cy="48" r="4.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M14 50C14 26 34 12 52 12c0 20-12 38-38 38z" />
      <path d="M14 50c8-12 18-21 30-26" />
    </>
  ),
  scale: (
    <>
      <path d="M32 12v40M18 52h28" />
      <path d="M12 24h40" />
      <path d="M12 24l-6 13h12zM52 24l-6 13h12z" />
    </>
  ),
}

/* --------------------------------------------------------------- scenes */

const SCENES = {
  identity: { icons: ['person', 'card', 'compass'] },
  teaching: { icons: ['cap', 'book', 'grid'] },
  journey: { icons: ['path', 'steps', 'flag'] },
  horizon: { icons: ['rise', 'target', 'spark'] },
  nation: { icons: ['skyline', 'arch', 'network'] },
  research: { icons: ['book', 'network', 'target'] },
  impact: { icons: ['leaf', 'scale', 'network'] },
}

export default function BandArt({ scene = 'identity' }) {
  const spec = SCENES[scene] || SCENES.identity
  const uid = `band-${scene}`

  return (
    <svg
      viewBox="0 0 840 240"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B1F45" />
          <stop offset="55%" stopColor="#132C5C" />
          <stop offset="100%" stopColor="#1B3E7A" />
        </linearGradient>
        <pattern id={`${uid}-dots`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="rgba(255,255,255,0.16)" />
        </pattern>
        <radialGradient id={`${uid}-glow`} cx="78%" cy="30%" r="60%">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.22" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="840" height="240" fill={`url(#${uid}-bg)`} />
      <rect width="840" height="240" fill={`url(#${uid}-dots)`} />
      <rect width="840" height="240" fill={`url(#${uid}-glow)`} />

      {/* drafting frame */}
      <g stroke="rgba(255,255,255,0.14)" strokeWidth="1">
        <path d="M0 34h840M0 206h840" />
      </g>
      <g stroke={GOLD} strokeWidth="2.5" opacity="0.7" fill="none" strokeLinecap="square">
        <path d="M34 62V34h28" />
        <path d="M806 178v28h-28" />
      </g>

      {/* three chips — wide screens */}
      <g
        className="band-row"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(452, 62)"
      >
        {spec.icons.map((name, i) => (
          <g key={name + i} transform={`translate(${i * 116}, 0)`}>
            <rect
              width="100"
              height="116"
              rx="6"
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(240,199,105,0.34)"
              strokeWidth="1.5"
            />
            <g
              transform="translate(18, 26)"
              stroke={i === 0 ? GOLD : WHITE}
              strokeWidth={i === 0 ? 2.4 : 2}
            >
              {Icons[name]}
            </g>
          </g>
        ))}
      </g>

      {/* one larger chip — narrow screens, where the row would crowd the caption */}
      <g
        className="band-solo"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(546, 46)"
      >
        <rect
          width="148"
          height="148"
          rx="8"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(240,199,105,0.34)"
          strokeWidth="1.5"
        />
        <g transform="translate(26, 26) scale(1.5)" stroke={GOLD} strokeWidth="1.9">
          {Icons[spec.icons[0]]}
        </g>
      </g>
    </svg>
  )
}
