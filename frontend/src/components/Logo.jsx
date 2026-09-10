/**
 * JAIN (Deemed-to-be University) lockup.
 *
 * Two artwork files ship with the app: the supplied original for light
 * backgrounds, and a recoloured version for the navy covers. Both live in
 * /public so they are served as plain assets.
 */
export default function Logo({ variant = 'dark', size = 'md', className = '' }) {
  const src = variant === 'light' ? '/jain-logo-light.png' : '/jain-logo.png'
  return (
    <img
      src={src}
      alt="JAIN (Deemed-to-be University)"
      className={`jain-logo jain-logo-${size} ${className}`.trim()}
      width="1103"
      height="319"
      draggable="false"
    />
  )
}

/** Logo plus the office line beneath it — used on covers and sign-in. */
export function LogoLockup({ subtitle = 'Office of Academics', variant = 'light', size = 'lg' }) {
  return (
    <div className={`logo-lockup logo-lockup-${variant}`}>
      <Logo variant={variant} size={size} />
      {subtitle ? <div className="logo-lockup-sub">{subtitle}</div> : null}
    </div>
  )
}
