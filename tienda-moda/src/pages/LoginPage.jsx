import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form)
      navigate(location.state?.from || '/cuenta')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page container auth-wrap">
      <div className="card auth-card">
        <div className="section-head" style={{ marginBottom: 'var(--space-5)' }}>
          <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Ingresar</h1>
          <p className="text-soft" style={{ fontSize: 'var(--fs-sm)' }}>Accede a tus reservas y tu perfil.</p>
        </div>

        <form onSubmit={submit}>
          <Field label="Email" type="email" name="email" value={form.email} onChange={set('email')} required autoComplete="email" />
          <Field label="Contrasena" type="password" name="password" value={form.password} onChange={set('password')} required autoComplete="current-password" />
          {error && <p className="badge badge--order" style={{ marginBottom: 'var(--space-3)' }}>{error}</p>}
          <Button type="submit" block disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</Button>
        </form>

        <p className="auth-switch">
          No tenes cuenta? <Link to="/registro" state={location.state}>Crear una</Link>
        </p>
        <p className="text-muted" style={{ fontSize: 'var(--fs-xs)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
          Demo admin: admin@adstore.com / admin123
        </p>
      </div>
    </div>
  )
}
