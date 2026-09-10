/**
 * Wide illustrated panel for the two welcome covers.
 * Inline SVG for the same reason as the step bands: it always renders.
 */

const GOLD = '#F0C769'
const WHITE = 'rgba(255,255,255,0.78)'
const FAINT = 'rgba(255,255,255,0.45)'

function Figure({ x, y, scale = 1, stroke = WHITE, width = 2.2 }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} stroke={stroke} strokeWidth={width}>
      <circle cx="0" cy="0" r="13" />
      <path d="M-22 46c0-13 10-20 22-20s22 7 22 20" />
    </g>
  )
}

const SCENES = {
  /* students working together */
  students: (
    <>
      {/* table */}
      <g stroke={FAINT} strokeWidth="2">
        <path d="M250 218h400" />
        <path d="M300 218v34M600 218v34" />
      </g>
      {/* shared work surface */}
      <g stroke={GOLD} strokeWidth="2.2">
        <rect x="386" y="176" width="128" height="42" rx="5" />
        <path d="M410 190h80M410 202h54" />
      </g>
      <Figure x={330} y={132} scale={1.15} stroke={GOLD} width="2.4" />
      <Figure x={450} y={118} scale={1.3} />
      <Figure x={572} y={132} scale={1.15} />
      {/* connecting arc — the dialogue itself */}
      <g stroke={GOLD} strokeWidth="1.6" opacity="0.75" strokeDasharray="7 8">
        <path d="M330 96C380 52 522 52 572 96" fill="none" />
      </g>
      <g fill={GOLD} opacity="0.9">
        <circle cx="330" cy="96" r="3.5" />
        <circle cx="451" cy="66" r="4.5" />
        <circle cx="572" cy="96" r="3.5" />
      </g>
      {/* shelf of books, left */}
      <g stroke={FAINT} strokeWidth="2">
        <path d="M96 246h96" />
        <path d="M106 246v-52M124 246v-64M142 246v-44M160 246v-58M178 246v-38" />
      </g>
      {/* rising idea, right */}
      <g stroke={WHITE} strokeWidth="2.2">
        <path d="M706 232l30-26 24 12 34-46" />
        <circle cx="706" cy="232" r="3.5" />
        <circle cx="736" cy="206" r="3.5" />
        <circle cx="760" cy="218" r="3.5" />
      </g>
      <g stroke={GOLD} strokeWidth="2.2">
        <path d="M794 156l4.6 12.8L811 174l-12.4 5.2L794 192l-4.6-12.8L777 174l12.4-5.2z" />
      </g>
    </>
  ),

  /* faculty: the discipline, the learners, the reach */
  faculty: (
    <>
      {/* lectern + board */}
      <g stroke={FAINT} strokeWidth="2">
        <rect x="130" y="112" width="176" height="112" rx="5" />
        <path d="M156 148h124M156 172h92M156 196h108" />
      </g>
      {/* open book, centre */}
      <g stroke={GOLD} strokeWidth="2.4">
        <path d="M366 128h56c11 0 18 6 18 18v92c0-9-7-15-18-15h-56z" />
        <path d="M514 128h-56c-11 0-18 6-18 18v92c0-9 7-15 18-15h56z" />
      </g>
      {/* mortarboard above */}
      <g stroke={WHITE} strokeWidth="2.2">
        <path d="M386 88l54-24 54 24-54 24z" />
      </g>
      {/* network of collaboration, right */}
      <g stroke={WHITE} strokeWidth="2">
        <path d="M596 118l92-16M596 118l44 66M688 102l-48 82M640 184l72 18M712 202l60-52" />
      </g>
      <g fill="none" stroke={GOLD} strokeWidth="2.4">
        <circle cx="596" cy="118" r="9" />
        <circle cx="688" cy="102" r="9" />
        <circle cx="640" cy="184" r="9" />
        <circle cx="712" cy="202" r="9" />
        <circle cx="772" cy="150" r="9" />
      </g>
      <g stroke={FAINT} strokeWidth="2">
        <path d="M96 250h704" />
      </g>
    </>
  ),
}

export default function CoverArt({ scene = 'students' }) {
  const uid = `cover-${scene}`
  return (
    <svg
      className="cover-panel"
      viewBox="0 0 900 300"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0E2449" />
          <stop offset="60%" stopColor="#163461" />
          <stop offset="100%" stopColor="#1E4585" />
        </linearGradient>
        <pattern id={`${uid}-dots`} width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="rgba(255,255,255,0.14)" />
        </pattern>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="18%" r="70%">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.18" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <rect width="900" height="300" rx="22" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${uid}-clip)`}>
        <rect width="900" height="300" fill={`url(#${uid}-bg)`} />
        <rect width="900" height="300" fill={`url(#${uid}-dots)`} />
        <rect width="900" height="300" fill={`url(#${uid}-glow)`} />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {SCENES[scene] || SCENES.students}
        </g>
      </g>
      <rect
        width="900"
        height="300"
        rx="22"
        fill="none"
        stroke="rgba(240,199,105,0.42)"
        strokeWidth="2"
      />
    </svg>
  )
}
