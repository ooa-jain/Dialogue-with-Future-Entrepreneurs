import CoverArt from './CoverArt'
import { Cover, ArrowRight, Particles } from './Cover'
import { LogoLockup } from './Logo'

/**
 * Front cover for a form. Student and faculty get their own copy, kicker and
 * illustration; the shell is shared so both stay visually consistent.
 */
export default function Welcome({ audience, subtitle, scene, quote, cta, footnote, onBegin }) {
  return (
    <Cover variant="front" audience={audience} particles={audience === 'student'}>
      <LogoLockup subtitle={subtitle} variant="light" />

      <div className="cover-visual">
        <CoverArt scene={scene} />
      </div>

      <h1 className="cover-title">
        Dialogue with<br />
        <em>Future Entrepreneurs</em>
      </h1>

      <p className="cover-quote">{quote}</p>

      <button className="btn-begin" type="button" onClick={onBegin}>
        {cta} <ArrowRight />
      </button>

      <div className="cover-footnote">{footnote}</div>
    </Cover>
  )
}
