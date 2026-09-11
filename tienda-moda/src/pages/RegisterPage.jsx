import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(form)
      navigate(from || '/cuenta')
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
          <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Crear cuenta</h1>
          <p className="text-soft" style={{ fontSize: 'var(--fs-sm)' }}>
            {from === '/checkout'
              ? 'Necesitas una cuenta para confirmar tu reserva. Es rapido.'
              : 'Segui tus pedidos y reserva mas rapido.'}
          </p>
        </div>

        <form onSubmit={submit}>
          <Field label="Nombre y apellido" name="name" value={form.name} onChange={set('name')} required />
          <Field label="Email" type="email" name="email" value={form.email} onChange={set('email')} required autoComplete="email" />
          <Field label="Contrasena" type="password" name="password" value={form.password} onChange={set('password')} required minLength={4} autoComplete="new-password" />
          {error && <p className="badge badge--order" style={{ marginBottom: 'var(--space-3)' }}>{error}</p>}
          <Button type="submit" block disabled={busy}>{busy ? 'Creando…' : 'Crear cuenta'}</Button>
        </form>

        <p className="auth-switch">
          Ya tenes cuenta? <Link to="/ingresar" state={location.state}>Ingresar</Link>
        </p>
      </div>
    </div>
  )
}
