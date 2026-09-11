import { useState } from 'react'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import { useAuth } from '../../context/AuthContext'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
  })
  const [saved, setSaved] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setSaved(false)
  }

  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await updateProfile(form)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="card card--pad" onSubmit={submit}>
      <h3 style={{ marginBottom: 'var(--space-5)' }}>Datos personales</h3>
      <div className="form-row">
        <Field label="Nombre y apellido" name="name" value={form.name} onChange={set('name')} required />
        <Field label="Email" type="email" name="email" value={form.email} onChange={set('email')} required />
      </div>
      <div className="form-row">
        <Field label="Telefono" name="phone" value={form.phone} onChange={set('phone')} placeholder="+54 11 5555 5555" />
        <Field label="Direccion" name="address" value={form.address} onChange={set('address')} placeholder="Calle, numero, ciudad" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Button type="submit">Guardar cambios</Button>
        {saved && <span className="badge badge--stock">Perfil actualizado</span>}
        {error && <span className="badge badge--order">{error}</span>}
      </div>
    </form>
  )
}
