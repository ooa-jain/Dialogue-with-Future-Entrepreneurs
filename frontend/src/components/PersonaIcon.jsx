/** Line icons for the confirmation persona card — drawn, never emoji. */
const PATHS = {
  venture: (
    <>
      <path d="M32 6c9 7 14 17 14 28 0 6-1 11-3 16H21c-2-5-3-10-3-16 0-11 5-21 14-28z" />
      <circle cx="32" cy="27" r="7" />
      <path d="M18 40l-7 12 12-4M46 40l7 12-12-4" />
      <path d="M27 56c2 4 3 6 5 8 2-2 3-4 5-8" />
    </>
  ),
  leaf: (
    <>
      <path d="M13 52C13 27 34 12 53 12c0 21-13 40-40 40z" />
      <path d="M13 52c9-13 19-22 31-27" />
    </>
  ),
  research: (
    <>
      <circle cx="28" cy="28" r="17" />
      <path d="M40 40l14 14" />
      <path d="M22 28h12M28 22v12" />
    </>
  ),
  spark: (
    <>
      <path d="M32 6v12M32 46v12M6 32h12M46 32h12" />
      <path d="M14 14l8 8M42 42l8 8M50 14l-8 8M22 42l-8 8" />
      <circle cx="32" cy="32" r="8" />
    </>
  ),
  lead: (
    <>
      <path d="M16 8v48" />
      <path d="M16 12h30l-8 10 8 10H16z" />
      <circle cx="16" cy="58" r="3" />
    </>
  ),
  people: (
    <>
      <circle cx="22" cy="22" r="8" />
      <circle cx="44" cy="26" r="7" />
      <path d="M8 50c0-9 6-14 14-14s14 5 14 14" />
      <path d="M36 44c1-6 4-9 8-9 7 0 12 5 12 13" />
    </>
  ),
  globe: (
    <>
      <circle cx="32" cy="32" r="23" />
      <path d="M9 32h46" />
      <path d="M32 9c8 8 8 38 0 46-8-8-8-38 0-46z" />
    </>
  ),
  learn: (
    <>
      <path d="M5 24l27-12 27 12-27 12z" />
      <path d="M16 30v12c0 5 7 9 16 9s16-4 16-9V30" />
      <path d="M55 26v14" />
    </>
  ),
  compass: (
    <>
      <circle cx="32" cy="32" r="23" />
      <path d="M43 21l-7 15-15 7 7-15z" />
      <circle cx="32" cy="32" r="2.5" />
    </>
  ),
}

export default function PersonaIcon({ name = 'compass' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] || PATHS.compass}
    </svg>
  )
}
