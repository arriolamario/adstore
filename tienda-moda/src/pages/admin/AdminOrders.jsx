import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/ui/EmptyState'
import OrderDetailModal from '../../components/orders/OrderDetailModal'
import { currency, formatDate } from '../../lib/format'
import { ORDER_STATUSES, statusMeta } from '../../lib/orders'
import { useCart } from '../../context/CartContext'
import { useCatalog } from '../../context/CatalogContext'

export default function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder, loadOrders, ordersLoading } = useCart()
  const { refresh } = useCatalog()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadOrders() }, [loadOrders])

  const visible = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  )

  const changeStatus = async (order, next) => {
    if (next === order.status) return
    // El servidor repone / descuenta stock segun corresponda (cancelar / reactivar).
    await updateOrderStatus(order.id, next)
    await refresh()
  }

  const remove = async (order) => {
    if (!confirm(`Eliminar la reserva ${order.id}? Esta accion no se puede deshacer.`)) return
    setMsg('')
    try {
      await deleteOrder(order.id)
      await refresh() // el stock puede haberse repuesto
    } catch (err) {
      setMsg(err.message)
    }
  }

  if (ordersLoading && orders.length === 0) {
    return <p className="text-muted">Cargando reservas…</p>
  }

  if (orders.length === 0) {
    return <EmptyState icon="📋" title="Sin reservas todavia">Las reservas confirmadas apareceran aca.</EmptyState>
  }

  return (
    <div>
      <div className="filters">
        <button className={`chip ${filter === 'all' ? 'is-active' : ''}`} onClick={() => setFilter('all')}>
          Todas ({orders.length})
        </button>
        {ORDER_STATUSES.map((s) => {
          const n = orders.filter((o) => o.status === s.value).length
          return (
            <button
              key={s.value}
              className={`chip ${filter === s.value ? 'is-active' : ''}`}
              onClick={() => setFilter(s.value)}
            >
              {s.label} ({n})
            </button>
          )
        })}
      </div>

      {msg && <p className="badge badge--order" style={{ marginBottom: 'var(--space-4)' }}>{msg}</p>}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Entrega</th>
              <th>Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.id}</div>
                  <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{o.customer?.email}</div>
                </td>
                <td>{formatDate(o.createdAt)}</td>
                <td>
                  <div>{o.customer?.name || '—'}</div>
                  <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{o.customer?.phone}</div>
                </td>
                <td>
                  <button className="btn btn--ghost btn--sm" onClick={() => setSelected(o)}>
                    {o.items.reduce((n, i) => n + i.qty, 0)} u. · Ver detalle
                  </button>
                </td>
                <td>{o.fulfillment === 'pickup' ? 'Retiro' : 'Envio'}</td>
                <td>{currency(o.subtotal)}</td>
                <td>
                  <span
                    className={`badge badge--${statusMeta(o.status).tone}`}
                    style={{ marginBottom: 'var(--space-2)', display: 'inline-flex' }}
                  >
                    {statusMeta(o.status).label}
                  </span>
                  <select
                    className="select"
                    value={o.status}
                    onChange={(e) => changeStatus(o, e.target.value)}
                    style={{ padding: '0.35rem 0.5rem', fontSize: 'var(--fs-xs)' }}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button className="btn btn--ghost btn--sm" onClick={() => remove(o)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
