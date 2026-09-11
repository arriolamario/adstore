import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { formatDate } from '../../lib/format'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setUsers(await api.users.list())
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const removeUser = async (u) => {
    if (u.id === currentUser.id) return // no te podes eliminar a vos mismo
    if (!confirm(`Eliminar la cuenta de "${u.name}"?`)) return
    try {
      await api.users.remove(u.id)
      setUsers((prev) => prev.filter((x) => x.id !== u.id))
    } catch (err) {
      setMsg(err.message)
    }
  }

  const list = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <input
          className="input"
          placeholder="Buscar por nombre o email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <Button to="/admin/usuario/nuevo">+ Nuevo usuario</Button>
      </div>

      {msg && <p className="badge badge--order" style={{ marginBottom: 'var(--space-4)' }}>{msg}</p>}
      {loading && <p className="text-muted">Cargando usuarios…</p>}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Contacto</th>
              <th>Rol</th>
              <th>Alta</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {u.name}
                    {u.id === currentUser.id && <span className="text-muted"> (vos)</span>}
                  </div>
                  <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{u.email}</div>
                </td>
                <td>
                  <div style={{ fontSize: 'var(--fs-sm)' }}>{u.phone || '—'}</div>
                  <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{u.address || 'Sin direccion'}</div>
                </td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge--brand' : 'badge--stock'}`}>
                    {u.role === 'admin' ? 'Admin' : 'Comprador'}
                  </span>
                </td>
                <td>{u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/admin/usuario/${u.id}`)}>Editar</button>
                  <button
                    className="btn btn--ghost btn--sm"
                    disabled={u.id === currentUser.id}
                    title={u.id === currentUser.id ? 'No podes eliminar tu propia cuenta' : undefined}
                    onClick={() => removeUser(u)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
