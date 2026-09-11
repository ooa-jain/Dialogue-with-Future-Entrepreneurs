/**
 * Illustrated bands for the form steps.
 *
 * Drawn inline as SVG rather than loaded as photographs: they always render
 * (no external host, no slow first paint, nothing to break behind a campus
 * firewall), they stay on the navy/gold palette, and they scale without
 * artefacts. Line work only — no emoji, no stock imagery.
 *
 * Each scene is a small composition drawn in its own 360 × 180 box, so the
 * same drawing can be placed once for wide screens and again, smaller, for
 * narrow ones without any of it being cropped away.
 */

const GOLD = '#F0C769'
const GOLD_DIM = 'rgba(240,199,105,0.55)'
const LINE = 'rgba(255,255,255,0.66)'
const FAINT = 'rgba(255,255,255,0.28)'
const GLASS = 'rgba(255,255,255,0.05)'

/** A four-point sparkle — used sparingly, as punctuation. */
function Sparkle({ x, y, r = 7, opacity = 0.9 }) {
  return (
    <path
      d={`M${x} ${y - r}Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y}Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r}Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y}Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z`}
      fill={GOLD}
      opacity={opacity}
      stroke="none"
    />
  )
}

/* --------------------------------------------------------------- scenes */

/** 01 · About you — a portrait medallion, an identity card, a compass. */
const Identity = (
  <>
    <circle cx="196" cy="88" r="78" stroke={FAINT} strokeDasharray="3 10" />
    <circle cx="196" cy="88" r="62" fill={GLASS} stroke={GOLD_DIM} strokeWidth="1.5" />
    <circle cx="196" cy="72" r="21" stroke={GOLD} strokeWidth="2.4" />
    <path d="M160 124c0-20 16-31 36-31s36 11 36 31" stroke={GOLD} strokeWidth="2.4" />

    <g transform="translate(36 96)">
      <rect width="104" height="66" rx="7" fill="rgba(11,31,69,0.72)" stroke={LINE} strokeWidth="1.8" />
      <circle cx="28" cy="26" r="11" stroke={LINE} strokeWidth="1.8" />
      <path d="M15 48c0-8 6-13 13-13s13 5 13 13" stroke={LINE} strokeWidth="1.8" />
      <path d="M52 20h36M52 32h36M52 44h24" stroke={FAINT} strokeWidth="1.8" />
    </g>

    <g transform="translate(272 8)">
      <circle cx="30" cy="30" r="29" fill="rgba(11,31,69,0.6)" stroke={LINE} strokeWidth="1.8" />
      <path d="M43 17l-9 17-17 9 9-17z" stroke={GOLD} strokeWidth="2" />
      <circle cx="30" cy="30" r="2.5" fill={GOLD} stroke="none" />
    </g>

    <Sparkle x={64} y={44} r={8} />
    <Sparkle x={306} y={140} r={6} opacity={0.7} />
  </>
)

/** 02 · Academic journey — a rising flight of steps, a milestone, a cap. */
const Journey = (
  <>
    <path
      d="M14 170h74v-36h74V98h74V62h74"
      stroke={LINE}
      strokeWidth="2.2"
    />
    <path d="M14 170h296" stroke={FAINT} strokeWidth="1.6" />
    <path d="M88 170v-36M162 170V98M236 170V62" stroke="rgba(255,255,255,0.14)" strokeWidth="1.4" />

    <path
      d="M26 150C92 140 150 112 236 46"
      stroke={GOLD_DIM}
      strokeWidth="2"
      strokeDasharray="2 9"
    />

    {/* someone partway up */}
    <g transform="translate(112 56)">
      <circle cx="14" cy="12" r="11" stroke={GOLD} strokeWidth="2.2" />
      <path d="M0 42c0-10 6-16 14-16s14 6 14 16" stroke={GOLD} strokeWidth="2.2" />
    </g>

    {/* the milestone at the top */}
    <g transform="translate(236 6)">
      <path d="M0 56V0" stroke={GOLD} strokeWidth="2.4" />
      <path d="M0 5h38l-9 11 9 11H0z" fill="rgba(240,199,105,0.16)" stroke={GOLD} strokeWidth="2.2" />
    </g>

    {/* a cap, floating */}
    <g transform="translate(22 22)">
      <path d="M0 18L34 4l34 14-34 14z" fill="rgba(11,31,69,0.7)" stroke={LINE} strokeWidth="1.9" />
      <path d="M13 25v13c0 5 9 9 21 9s21-4 21-9V25" stroke={LINE} strokeWidth="1.9" />
      <path d="M66 20v15" stroke={GOLD} strokeWidth="1.9" />
    </g>

    <Sparkle x={300} y={120} r={7} opacity={0.75} />
  </>
)

/** 03 · The future — a sun over a ridge, with a climbing line and a star. */
const Horizon = (
  <>
    <circle cx="196" cy="104" r="62" fill="rgba(240,199,105,0.07)" stroke={GOLD_DIM} strokeWidth="1.5" />
    <g stroke={GOLD_DIM} strokeWidth="2" strokeLinecap="round">
      <path d="M124 104h-14M282 104h14M196 30v-14" />
      <path d="M145 53l-10-10M247 155l10 10M247 53l10-10M145 155l-10 10" />
    </g>

    <path
      d="M14 156l62-64 34 34 40-42 58 60 62-42 52 54z"
      fill="rgba(11,31,69,0.78)"
      stroke={LINE}
      strokeWidth="2"
    />
    <path d="M14 156h308" stroke={FAINT} strokeWidth="1.6" />
    <path d="M76 92l18 19M150 84l16 17" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4" />

    {/* the climb */}
    <path d="M46 140l54-30 40 16 56-44 62-28" stroke={GOLD} strokeWidth="2.4" />
    {[
      [46, 140],
      [100, 110],
      [140, 126],
      [196, 82],
    ].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#0B1F45" stroke={GOLD} strokeWidth="2.2" />
    ))}

    <Sparkle x={258} y={54} r={10} />
    <Sparkle x={300} y={26} r={6} opacity={0.7} />
    <Sparkle x={36} y={40} r={5} opacity={0.55} />
  </>
)

/** 04 · India — a skyline with a domed monument, under a connected sky. */
const Nation = (
  <>
    <circle cx="176" cy="96" r="66" fill="rgba(240,199,105,0.06)" stroke={GOLD_DIM} strokeWidth="1.4" />

    {/* connections overhead */}
    <g stroke={FAINT} strokeWidth="1.5">
      <path d="M42 44l68-22 74 30 76-26 58 34" />
      <path d="M110 22l74 52M184 52l76 44" />
    </g>
    {[
      [42, 44],
      [110, 22],
      [184, 52],
      [260, 26],
      [318, 60],
    ].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill={GOLD} stroke="none" opacity="0.85" />
    ))}

    {/* left towers */}
    <g stroke={LINE} strokeWidth="1.9" fill="rgba(11,31,69,0.72)">
      <rect x="18" y="112" width="36" height="58" />
      <rect x="60" y="90" width="30" height="80" />
    </g>
    <path d="M28 124h16M28 138h16M28 152h16M68 102h14M68 118h14M68 134h14" stroke={FAINT} strokeWidth="1.5" />

    {/* the monument */}
    <g stroke={GOLD} strokeWidth="2.2" fill="rgba(11,31,69,0.8)">
      <path d="M140 116a36 36 0 0 1 72 0z" />
      <path d="M176 80v-14" fill="none" />
      <rect x="134" y="116" width="84" height="54" />
      <path d="M160 170v-30a16 16 0 0 1 32 0v30" fill="none" />
    </g>
    <g stroke={GOLD_DIM} strokeWidth="1.8" fill="rgba(11,31,69,0.8)">
      <rect x="118" y="128" width="12" height="42" />
      <rect x="222" y="128" width="12" height="42" />
      <path d="M118 128a6 6 0 0 1 12 0M222 128a6 6 0 0 1 12 0" />
    </g>

    {/* right towers */}
    <g stroke={LINE} strokeWidth="1.9" fill="rgba(11,31,69,0.72)">
      <rect x="248" y="98" width="30" height="72" />
      <rect x="284" y="118" width="38" height="52" />
    </g>
    <path d="M256 110h14M256 126h14M256 142h14M294 130h20M294 146h20" stroke={FAINT} strokeWidth="1.5" />

    <path d="M8 170h330" stroke={FAINT} strokeWidth="1.8" />
  </>
)

/** Faculty · research — a flask, an orbit and an open book. */
const Research = (
  <>
    <circle cx="186" cy="86" r="74" stroke={FAINT} strokeDasharray="3 10" />

    {/* orbits */}
    <g stroke={GOLD_DIM} strokeWidth="1.8">
      <ellipse cx="186" cy="82" rx="66" ry="26" />
      <ellipse cx="186" cy="82" rx="66" ry="26" transform="rotate(60 186 82)" />
      <ellipse cx="186" cy="82" rx="66" ry="26" transform="rotate(-60 186 82)" />
    </g>
    <circle cx="186" cy="82" r="7" fill={GOLD} stroke="none" />

    {/* flask */}
    <g transform="translate(28 52)" stroke={LINE} strokeWidth="2">
      <path d="M26 4v34L6 92a10 10 0 0 0 9 15h46a10 10 0 0 0 9-15L50 38V4" fill="rgba(11,31,69,0.72)" />
      <path d="M18 4h40" />
      <path d="M14 76h48a10 10 0 0 1 3 16 10 10 0 0 1-9 15H15a10 10 0 0 1-9-15z" fill="rgba(240,199,105,0.16)" stroke={GOLD} />
      <circle cx="30" cy="90" r="3.5" fill={GOLD} stroke="none" />
      <circle cx="46" cy="96" r="2.5" fill={GOLD} stroke="none" />
    </g>

    {/* open book */}
    <g transform="translate(238 104)" stroke={LINE} strokeWidth="2" fill="rgba(11,31,69,0.72)">
      <path d="M0 8h38c8 0 12 4 12 11v45c0-5-4-8-12-8H0z" />
      <path d="M100 8H62c-8 0-12 4-12 11v45c0-5 4-8 12-8h38z" />
      <path d="M10 24h26M10 36h26M64 24h26M64 36h26" stroke={FAINT} strokeWidth="1.6" fill="none" />
    </g>

    <Sparkle x={306} y={30} r={8} />
    <Sparkle x={20} y={22} r={5} opacity={0.6} />
  </>
)

/** Faculty · teaching — a board, a lectern and the room in front of it. */
const Teaching = (
  <>
    <g transform="translate(74 10)">
      <rect width="212" height="108" rx="6" fill="rgba(11,31,69,0.78)" stroke={LINE} strokeWidth="2" />
      <path d="M20 28h108M20 46h140M20 64h86" stroke={FAINT} strokeWidth="2" />
      <path d="M138 84l16-18 18 22 22-30" stroke={GOLD} strokeWidth="2.2" />
      <circle cx="138" cy="84" r="3.5" fill={GOLD} stroke="none" />
      <circle cx="194" cy="58" r="3.5" fill={GOLD} stroke="none" />
    </g>
    <path d="M180 118v14" stroke={FAINT} strokeWidth="1.8" />

    {/* the teacher */}
    <g transform="translate(26 66)">
      <circle cx="24" cy="14" r="13" stroke={GOLD} strokeWidth="2.2" />
      <path d="M6 50c0-11 8-18 18-18s18 7 18 18" stroke={GOLD} strokeWidth="2.2" />
      <path d="M2 50h44v10H2z" fill="rgba(240,199,105,0.14)" stroke={GOLD} strokeWidth="2" />
      <path d="M24 60v34" stroke={GOLD_DIM} strokeWidth="2" />
    </g>

    {/* seats */}
    <g stroke={LINE} strokeWidth="1.9" fill="rgba(11,31,69,0.72)">
      {[112, 178, 244].map((x) => (
        <g key={x} transform={`translate(${x} 134)`}>
          <circle cx="18" cy="8" r="8" />
          <path d="M4 34c0-8 6-13 14-13s14 5 14 13" fill="none" />
        </g>
      ))}
    </g>
    <path d="M14 170h312" stroke={FAINT} strokeWidth="1.8" />

    <Sparkle x={310} y={36} r={7} opacity={0.75} />
  </>
)

const SCENES = {
  identity: Identity,
  journey: Journey,
  horizon: Horizon,
  nation: Nation,
  research: Research,
  teaching: Teaching,
}

export default function BandArt({ scene = 'identity' }) {
  const drawing = SCENES[scene] || SCENES.identity
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
        <radialGradient id={`${uid}-glow`} cx="72%" cy="34%" r="62%">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.26" />
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

      {/* the scene — placed once for wide screens, once smaller for narrow
          ones, where the frame is cropped to its middle 480 units */}
      <g className="band-row" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(452 30)">
        {drawing}
      </g>
      <g
        className="band-solo"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(452 66) scale(0.56)"
      >
        {drawing}
      </g>
    </svg>
  )
}
