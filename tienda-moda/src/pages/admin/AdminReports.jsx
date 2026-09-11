import { useEffect, useMemo } from 'react'
import EmptyState from '../../components/ui/EmptyState'
import { currency, formatDate } from '../../lib/format'
import { statusMeta } from '../../lib/orders'
import { useCart } from '../../context/CartContext'

export default function AdminReports() {
  const { orders, loadOrders, ordersLoading } = useCart()

  useEffect(() => { loadOrders() }, [loadOrders])

  const report = useMemo(() => {
    // Las reservas canceladas no cuentan como venta.
    const active = orders.filter((o) => o.status !== 'cancelado')
    const canceled = orders.length - active.length
    const units = active.reduce((n, o) => n + o.items.reduce((s, i) => s + i.qty, 0), 0)
    const revenue = active.reduce((n, o) => n + o.subtotal, 0)
    const byProduct = {}
    const byFulfillment = { pickup: 0, shipping: 0 }

    active.forEach((o) => {
      byFulfillment[o.fulfillment] = (byFulfillment[o.fulfillment] || 0) + 1
      o.items.forEach((i) => {
        byProduct[i.name] = byProduct[i.name] || { qty: 0, total: 0 }
        byProduct[i.name].qty += i.qty
        byProduct[i.name].total += i.qty * i.price
      })
    })

    const top = Object.entries(byProduct).sort((a, b) => b[1].qty - a[1].qty)
    return { units, revenue, byFulfillment, top, count: active.length, canceled }
  }, [orders])

  if (ordersLoading && orders.length === 0) {
    return <p className="text-muted">Cargando reporte…</p>
  }

  if (orders.length === 0) {
    return <EmptyState icon="📊" title="Sin ventas todavia">Los pedidos confirmados apareceran aca.</EmptyState>
  }

  return (
    <div>
      <div className="stat-grid">
        <div className="card stat">
          <div className="stat__label">Reservas</div>
          <div className="stat__value">{report.count}</div>
        </div>
        <div className="card stat">
          <div className="stat__label">Unidades</div>
          <div className="stat__value">{report.units}</div>
        </div>
        <div className="card stat">
          <div className="stat__label">Ingresos estimados</div>
          <div className="stat__value">{currency(report.revenue)}</div>
        </div>
        <div className="card stat">
          <div className="stat__label">Retiro / Envio</div>
          <div className="stat__value">{report.byFulfillment.pickup} / {report.byFulfillment.shipping}</div>
        </div>
        <div className="card stat">
          <div className="stat__label">Canceladas</div>
          <div className="stat__value">{report.canceled}</div>
        </div>
      </div>

      <h3 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Productos mas reservados</h3>
      <div className="table-wrap" style={{ marginBottom: 'var(--space-6)' }}>
        <table className="data">
          <thead>
            <tr><th>Producto</th><th>Unidades</th><th>Total</th></tr>
          </thead>
          <tbody>
            {report.top.map(([name, d]) => (
              <tr key={name}><td>{name}</td><td>{d.qty}</td><td>{currency(d.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ margin: '0 0 var(--space-3)' }}>Detalle de reservas</h3>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr><th>Codigo</th><th>Fecha</th><th>Cliente</th><th>Entrega</th><th>Estado</th><th>Total</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{o.customer?.name || '—'}</td>
                <td>{o.fulfillment === 'pickup' ? 'Retiro' : 'Envio'}</td>
                <td><span className={`badge badge--${statusMeta(o.status).tone}`}>{statusMeta(o.status).label}</span></td>
                <td>{currency(o.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
