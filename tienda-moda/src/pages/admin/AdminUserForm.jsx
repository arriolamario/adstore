import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import { sanitizePhone } from '../../lib/validation'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const BLANK = { name: '', email: '', password: '', role: 'customer', phone: '', address: '' }

export default function AdminUserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const isNew = !id

  const [form, setForm] = useState(BLANK)
  const [loading, setLoading] = useState(!isNew)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    api.users.get(id)
      .then((u) => setForm({ ...u, password: '' }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isNew])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setPhone = (e) => setForm((f) => ({ ...f, phone: sanitizePhone(e.target.value) }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (isNew && form.password.length < 4) {
      setError('La contrasena debe tener al menos 4 caracteres.')
      return
    }
    setBusy(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password // no tocar la contrasena si se dejo en blanco
      if (isNew) {
        await api.users.create(payload)
      } else {
        await api.users.update(id, payload)
      }
      navigate('/admin/usuarios')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (loading) return <p className="text-muted">Cargando usuario…</p>

  const editingSelf = !isNew && id === currentUser.id

  return (
    <form className="card card--pad" onSubmit={submit}>
      <h3 style={{ marginBottom: 'var(--space-5)' }}>{isNew ? 'Nuevo usuario' : 'Editar usuario'}</h3>

      <div className="form-row">
        <Field label="Nombre y apellido" name="name" value={form.name} onChange={set('name')} required />
        <Field label="Email" type="email" name="email" value={form.email} onChange={set('email')} required />
      </div>

      <div className="form-row">
        <Field
          label={isNew ? 'Contrasena' : 'Nueva contrasena'}
          type="password"
          name="password"
          value={form.password}
          onChange={set('password')}
          placeholder={isNew ? '' : 'Dejar en blanco para no cambiarla'}
          hint={isNew ? 'Minimo 4 caracteres.' : undefined}
          required={isNew}
        />
        <Field as="select" label="Rol" name="role" value={form.role} onChange={set('role')} disabled={editingSelf}>
          <option value="customer">Comprador</option>
          <option value="admin">Admin</option>
        </Field>
      </div>
      {editingSelf && (
        <p className="hint" style={{ marginTop: '-0.75rem', marginBottom: 'var(--space-4)' }}>
          No podes cambiar tu propio rol.
        </p>
      )}

      <div className="form-row">
        <Field
          label="Telefono"
          name="phone"
          type="tel"
          inputMode="numeric"
          pattern="\d*"
          maxLength={15}
          value={form.phone}
          onChange={setPhone}
          placeholder="Solo numeros"
        />
        <Field label="Direccion" name="address" value={form.address} onChange={set('address')} placeholder="Calle, numero, ciudad" />
      </div>

      {error && <p className="badge badge--order" style={{ marginBottom: 'var(--space-3)' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Button type="submit" disabled={busy}>
          {busy ? 'Guardando…' : isNew ? 'Crear usuario' : 'Guardar cambios'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate('/admin/usuarios')}>Cancelar</Button>
      </div>
    </form>
  )
}
