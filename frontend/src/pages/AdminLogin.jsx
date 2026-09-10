import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, setToken } from '../lib/api'
import { ArrowRight, Cover } from '../components/Cover'
import { LogoLockup } from '../components/Logo'
import { Spinner } from '../components/ui'

export default function AdminLogin({ onAuthed }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await api.login(username, password)
      setToken(res.token)
      onAuthed(res.username)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Cover variant="front">
      <LogoLockup subtitle="Office of Academics · Response Insights" variant="light" />

      <form className="login-card" onSubmit={submit}>
        <h1>Dashboard sign in</h1>
        <p className="sub">
          Insights from the Dialogue with Future Entrepreneurs initiative, for the Office of Academics.
        </p>

        <label className="gate-label" htmlFor="username">Username</label>
        <input
          id="username" className="login-input" autoComplete="username" required
          value={username} onChange={(e) => setUsername(e.target.value)}
        />

        <label className="gate-label" htmlFor="password">Password</label>
        <input
          id="password" className="login-input" type="password" autoComplete="current-password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
        />

        {error ? (
          <div className="gate-error" role="alert">
            <span aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        ) : null}

        <div className="gate-actions">
          <button className="btn-begin" disabled={busy}>
            {busy ? <><Spinner label="Signing in" /> Signing in…</> : <>Sign in <ArrowRight /></>}
          </button>
        </div>
      </form>

      <div className="cover-links">
        <Link className="btn-outline" to="/student">Student dialogue</Link>
        <Link className="btn-outline" to="/faculty">Faculty dialogue</Link>
      </div>
    </Cover>
  )
}
