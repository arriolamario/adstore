import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { currency } from '../../lib/format'
import { totalStock } from '../../lib/inventory'
import { useCatalog } from '../../context/CatalogContext'

export default function AdminProducts() {
  const { products, loading, saveProduct, deleteProduct, resetCatalog } = useCatalog()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')

  const run = (fn) => async () => {
    try { await fn() } catch (err) { setMsg(err.message) }
  }

  const list = products.filter((p) =>
    `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <input
          className="input"
          placeholder="Buscar producto…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <Button to="/admin/producto/nuevo">+ Nuevo producto</Button>
        <Button
          variant="ghost"
          onClick={() => { if (confirm('Restaurar el catalogo semilla? Se pierden los cambios.')) run(resetCatalog)() }}
        >
          Restaurar catalogo
        </Button>
      </div>

      {msg && <p className="badge badge--order" style={{ marginBottom: 'var(--space-4)' }}>{msg}</p>}
      {loading && <p className="text-muted">Cargando catalogo…</p>}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Disponibilidad</th>
              <th>Stock</th>
              <th>Visibilidad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <img src={p.image} alt="" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{p.brand}</div>
                    </div>
                  </div>
                </td>
                <td>{p.category}</td>
                <td>{currency(p.price)}</td>
                <td>
                  <span className={`badge ${p.availability === 'stock' ? 'badge--stock' : 'badge--order'}`}>
                    {p.availability === 'stock' ? 'En stock' : 'A pedido'}
                  </span>
                </td>
                <td title={p.availability === 'stock' ? Object.entries(p.stock || {}).map(([k, v]) => `${k}: ${v}`).join('  ') : ''}>
                  {p.availability === 'stock' ? totalStock(p) : '—'}
                  {p.colors?.length > 0 && <span className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}> ({p.colors.length} colores)</span>}
                </td>
                <td>
                  <span className={`badge ${p.hidden ? 'badge--order' : 'badge--stock'}`}>
                    {p.hidden ? 'Oculto' : 'Visible'}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn btn--ghost btn--sm" onClick={() => navigate(`/admin/producto/${p.id}`)}>Editar</button>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => run(() => saveProduct({ ...p, hidden: !p.hidden }))()}
                  >
                    {p.hidden ? 'Mostrar' : 'Ocultar'}
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => { if (confirm(`Eliminar "${p.name}"?`)) run(() => deleteProduct(p.id))() }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
