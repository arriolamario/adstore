import Modal from '../ui/Modal'
import { AvailabilityBadge } from '../ui/Badge'
import { currency, formatDate } from '../../lib/format'
import { statusMeta } from '../../lib/orders'

/** Detalle completo de una reserva: items, cliente y entrega. Reutilizable desde admin y reportes. */
export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null

  return (
    <Modal open={!!order} onClose={onClose} title={`Reserva ${order.id}`}>
      <div className="stack" style={{ gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <span className={`badge badge--${statusMeta(order.status).tone}`}>{statusMeta(order.status).label}</span>
          <span className="badge badge--brand">{order.fulfillment === 'pickup' ? 'Retiro en local' : 'Envio a domicilio'}</span>
          <span className="text-muted" style={{ fontSize: 'var(--fs-sm)', alignSelf: 'center' }}>
            {formatDate(order.createdAt)}
          </span>
        </div>

        <div className="card card--pad" style={{ background: 'var(--bg-subtle)' }}>
          <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Cliente</div>
          <div style={{ fontSize: 'var(--fs-sm)' }} className="stack" >
            <span>{order.customer?.name || '—'}</span>
            <span className="text-soft">{order.customer?.email}</span>
            <span className="text-soft">{order.customer?.phone}</span>
            {order.fulfillment === 'shipping' && (
              <span className="text-soft">{order.customer?.address || 'Sin direccion cargada'}</span>
            )}
            {order.customer?.notes && <span className="text-soft">Notas: {order.customer.notes}</span>}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Productos</div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th></th>
                  <th>Producto</th>
                  <th>Talle</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i, idx) => (
                  <tr key={idx}>
                    <td><img src={i.image} alt="" /></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{i.name}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{i.brand}</div>
                      <AvailabilityBadge availability={i.availability} />
                    </td>
                    <td>{i.size}</td>
                    <td>{i.qty}</td>
                    <td>{currency(i.price)}</td>
                    <td>{currency(i.price * i.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 'var(--fs-lg)' }}>
          <span>Subtotal</span>
          <span>{currency(order.subtotal)}</span>
        </div>

        <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>
          Disponible aprox.: <strong>{formatDate(order.estimatedReadyAt)}</strong>
        </p>
      </div>
    </Modal>
  )
}
