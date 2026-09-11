import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/ui/EmptyState'
import { currency, formatDate } from '../../lib/format'
import { statusMeta, statusLabel } from '../../lib/orders'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export default function OrdersPage() {
  const { user } = useAuth()
  const { ordersForUser, loadOrders, ordersLoading } = useCart()
  const orders = ordersForUser(user.id)

  useEffect(() => { loadOrders(user.id) }, [loadOrders, user.id])

  if (ordersLoading && orders.length === 0) {
    return <p className="text-muted">Cargando tus pedidos…</p>
  }

  if (orders.length === 0) {
    return (
      <EmptyState icon="📦" title="Todavia no hiciste pedidos">
        <Link to="/catalogo">Explora el catalogo</Link> y reserva tu primer producto.
      </EmptyState>
    )
  }

  return (
    <div>
      {orders.map((o) => (
        <article className="card order-row" key={o.id}>
          <div className="order-row__head">
            <div>
              <strong>{o.id}</strong>
              <span className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}> · {formatDate(o.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <span className="badge badge--brand">{o.fulfillment === 'pickup' ? 'Retiro en local' : 'Envio'}</span>
              <span className={`badge badge--${statusMeta(o.status).tone}`}>{statusLabel(o)}</span>
            </div>
          </div>

          <div className="stack" style={{ gap: 'var(--space-2)' }}>
            {o.items.map((i, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
                <span>{i.qty}× {i.name} <span className="text-muted">(talle {i.size})</span></span>
                <span>{currency(i.price * i.qty)}</span>
              </div>
            ))}
          </div>

          <div className="order-row__head" style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
            <span className="text-soft" style={{ fontSize: 'var(--fs-sm)' }}>
              Disponible aprox.: <strong>{formatDate(o.estimatedReadyAt)}</strong>
            </span>
            <strong>{currency(o.subtotal)}</strong>
          </div>
        </article>
      ))}
    </div>
  )
}
