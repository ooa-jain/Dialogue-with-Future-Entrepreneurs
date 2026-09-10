import Logo from '../components/Logo'
import { TopBrand } from '../components/ui'

/**
 * The two forms are shared as direct links (/student, /faculty), so this page
 * carries no navigation — just the initiative it belongs to.
 */
export default function Landing() {
  return (
    <div className="sheet">
      <div className="top-bar">
        <div className="top-bar-inner">
          <span className="top-brand-row">
            <Logo size="sm" />
            <span className="top-brand-rule" aria-hidden="true" />
            <TopBrand subtitle="Office of Academics" />
          </span>
        </div>
      </div>

      <div className="form-shell">
        <header className="sheet-hero">
          <span className="tag-mono">A reflection initiative</span>
          <h1>
            Dialogue with <mark>Future</mark> Entrepreneurs
          </h1>
          <p>
            A short, thoughtful conversation about the future you envision — for yourself, for your
            learners, and for India.
          </p>
        </header>
      </div>
    </div>
  )
}
