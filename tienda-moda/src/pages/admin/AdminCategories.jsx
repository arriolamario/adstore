import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import { api } from '../../lib/api'
import { useCatalog } from '../../context/CatalogContext'

export default function AdminCategories() {
  const { products, refresh } = useCatalog()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setCategories(await api.categories.list())
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const countFor = (name) => products.filter((p) => p.category === name).length

  const create = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setMsg('')
    setBusy(true)
    try {
      await api.categories.create({ name })
      setNewName('')
      await load()
      await refresh() // asi Filters / el select del admin de productos ven la categoria nueva
    } catch (err) {
      setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (c) => {
    setMsg('')
    setEditingId(c.id)
    setEditValue(c.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveEdit = async (id) => {
    const name = editValue.trim()
    if (!name) return
    setMsg('')
    try {
      await api.categories.update(id, { name })
      setEditingId(null)
      await load()
      await refresh()
    } catch (err) {
      setMsg(err.message)
    }
  }

  const remove = async (c) => {
    if (!confirm(`Eliminar la categoria "${c.name}"?`)) return
    setMsg('')
    try {
      await api.categories.remove(c.id)
      await load()
      await refresh()
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div>
      <form onSubmit={create} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <input
          className="input"
          placeholder="Nueva categoria…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <Button type="submit" disabled={busy}>+ Agregar categoria</Button>
      </form>

      {msg && <p className="badge badge--order" style={{ marginBottom: 'var(--space-4)' }}>{msg}</p>}
      {loading && <p className="text-muted">Cargando categorias…</p>}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Productos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>
                  {editingId === c.id ? (
                    <input
                      className="input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ maxWidth: 240 }}
                      autoFocus
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td>{countFor(c.name)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {editingId === c.id ? (
                    <>
                      <button className="btn btn--ghost btn--sm" onClick={() => saveEdit(c.id)}>Guardar</button>
                      <button className="btn btn--ghost btn--sm" onClick={cancelEdit}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn--ghost btn--sm" onClick={() => startEdit(c)}>Editar</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => remove(c)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
