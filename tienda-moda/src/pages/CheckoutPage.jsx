import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import EmptyState from '../components/ui/EmptyState'
import { currency, formatDate } from '../lib/format'
import { sanitizePhone, isValidPhone } from '../lib/validation'
import { whatsappLinkWithMessage, orderWhatsAppMessage } from '../lib/contact'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { useAuth } from '../context/AuthContext'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, hasOrderItems, createOrder } = useCart()
  const { refresh } = useCatalog()
  const { user, updateProfile } = useAuth()

  const [fulfillment, setFulfillment] = useState('pickup')
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: '',
  })
  const [done, setDone] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setPhone = (e) => setForm((f) => ({ ...f, phone: sanitizePhone(e.target.value) }))

  if (done) {
    return (
      <div className="page container container--narrow">
        <div className="card card--pad stack" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>✅</div>
          <h1 className="section-title">Reserva confirmada</h1>
          <p className="text-soft">
            Codigo <strong>{done.id}</strong>. Te contactamos para coordinar
            {done.fulfillment === 'pickup' ? ' el retiro por el local.' : ' el envio.'}
          </p>
          <p className="text-soft">
            Fecha estimada disponible: <strong>{formatDate(done.estimatedReadyAt)}</strong>
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              href={whatsappLinkWithMessage(orderWhatsAppMessage(done))}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              Avisanos por WhatsApp
            </Button>
            <Button to="/cuenta/pedidos">Ver mis pedidos</Button>
            <Button to="/catalogo" variant="ghost">Seguir explorando</Button>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page container container--narrow">
        <EmptyState icon="🛒" title="Tu reserva esta vacia">
          <Link to="/catalogo">Ir al catalogo</Link>
        </EmptyState>
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!isValidPhone(form.phone)) {
      setError('Ingresa un telefono valido (solo numeros, entre 8 y 15 digitos).')
      return
    }
    setSubmitting(true)
    try {
      // El servidor descuenta el stock por talle en una transaccion.
      const order = await createOrder({
        userId: user.id,
        fulfillment,
        customer: { ...form, email: user.email },
      })
      await refresh() // refresca el catalogo con el stock actualizado

      // Guarda telefono/direccion en el perfil para no volver a pedirlos en la proxima reserva.
      if (form.phone !== (user.phone || '') || (fulfillment === 'shipping' && form.address !== (user.address || ''))) {
        updateProfile({ phone: form.phone, address: form.address || user.address }).catch(() => {})
      }

      setDone(order)
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container checkout-grid">
        <form className="stack" onSubmit={submit}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Checkout</span>
            <h1 className="section-title">Confirma tu reserva</h1>
          </div>

          <div className="card card--pad">
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Entrega</h3>
            <div className="filters" style={{ marginBottom: 0 }}>
              <button type="button" className={`chip ${fulfillment === 'pickup' ? 'is-active' : ''}`} onClick={() => setFulfillment('pickup')}>
                🏬 Retiro en local
              </button>
              <button type="button" className={`chip ${fulfillment === 'shipping' ? 'is-active' : ''}`} onClick={() => setFulfillment('shipping')}>
                🚚 Envio a domicilio
              </button>
            </div>
          </div>

          <div className="card card--pad">
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Tus datos</h3>
            <div className="form-row">
              <Field label="Nombre y apellido" name="name" value={form.name} onChange={set('name')} required />
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
                hint="Sin espacios ni guiones, solo digitos."
                required
              />
            </div>
            {fulfillment === 'shipping' && (
              <Field label="Direccion de envio" name="address" value={form.address} onChange={set('address')} required />
            )}
            <Field as="textarea" label="Notas (opcional)" name="notes" value={form.notes} onChange={set('notes')} placeholder="Talle alternativo, horario preferido…" />
          </div>

          {error && <p className="badge badge--order" style={{ alignSelf: 'flex-start' }}>{error}</p>}
          <Button type="submit" size="lg" block disabled={submitting}>
            {submitting ? 'Confirmando…' : 'Confirmar reserva'}
          </Button>
          <p className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
            No se cobra nada online. El pago se realiza al retirar o recibir el producto.
          </p>
        </form>

        <aside className="card card--pad stack" style={{ position: 'sticky', top: 'calc(var(--header-h) + 16px)' }}>
          <h3>Resumen</h3>
          {items.map((i) => (
            <div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
              <span>{i.qty}× {i.name} <span className="text-muted">({i.size})</span></span>
              <span>{currency(i.price * i.qty)}</span>
            </div>
          ))}
          <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Subtotal</span>
            <span>{currency(subtotal)}</span>
          </div>
          {hasOrderItems && (
            <p className="badge badge--order" style={{ alignSelf: 'flex-start' }}>
              Incluye productos a pedido · ~5 dias habiles
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
