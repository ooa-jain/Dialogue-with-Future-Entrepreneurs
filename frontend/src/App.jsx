import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { api, getToken } from './lib/api'
import Landing from './pages/Landing'
import StudentForm from './pages/StudentForm'
import FacultyForm from './pages/FacultyForm'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { Spinner } from './components/ui'
import { Cover } from './components/Cover'
import { LogoLockup } from './components/Logo'

function AdminGate() {
  const [state, setState] = useState('checking') // checking | out | in
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (!getToken()) {
      setState('out')
      return
    }
    api
      .session()
      .then((s) => {
        setUsername(s.username)
        setState('in')
      })
      .catch(() => setState('out'))
  }, [])

  if (state === 'checking') {
    return (
      <div className="page-loading">
        <Spinner label="Checking your session" /> Checking your session…
      </div>
    )
  }
  if (state === 'out') {
    return (
      <AdminLogin
        onAuthed={(name) => {
          setUsername(name)
          setState('in')
        }}
      />
    )
  }
  return <AdminDashboard username={username} onSignOut={() => setState('out')} />
}

function NotFound() {
  return (
    <Cover variant="back">
      <LogoLockup subtitle="Office of Academics" variant="light" />
      <h2 className="confirm-title">Page not found</h2>
      <p className="confirm-sub">The link you followed does not exist on this site.</p>
      <div className="cover-links">
        <Link className="btn-outline" to="/">Home</Link>
        <Link className="btn-outline" to="/student">Student dialogue</Link>
        <Link className="btn-outline" to="/faculty">Faculty dialogue</Link>
      </div>
    </Cover>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/student" element={<StudentForm />} />
      <Route path="/faculty" element={<FacultyForm />} />
      <Route path="/admin" element={<AdminGate />} />
      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
