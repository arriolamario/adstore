import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { currency } from '../../lib/format'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, items, setQty, removeItem, subtotal, hasOrderItems } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  if (!drawerOpen) return null

  const goCheckout = () => {
    closeDrawer()
    navigate('/checkout')
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && closeDrawer()}>
      <aside className="drawer" role="dialog" aria-label="Carrito de reservas">
        <div className="drawer__head">
          <strong>Tu reserva ({items.length})</strong>
          <button className="icon-btn" onClick={closeDrawer} aria-label="Cerrar">✕</button>
        </div>

        <div className="drawer__body">
          {items.length === 0 ? (
            <EmptyState icon="🛍️" title="Todavia no reservaste nada">
              Agrega productos desde el catalogo.
            </EmptyState>
          ) : (
            items.map((i) => (
              <div className="cart-line" key={i.key}>
                <img src={i.image} alt={i.name} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{i.name}</div>
                  <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
                    Talle {i.size} · {i.availability === 'order' ? 'A pedido' : 'En stock'}
                  </div>
                  <div className="qty" style={{ marginTop: 'var(--space-2)' }}>
                    <button onClick={() => setQty(i.key, i.qty - 1)} aria-label="Menos">−</button>
                    <span>{i.qty}</span>
                    <button
                      onClick={() => setQty(i.key, i.qty + 1)}
                      disabled={i.max ? i.qty >= i.max : false}
                      aria-label="Mas"
                    >
                      +
                    </button>
                  </div>
                  {i.max && i.qty >= i.max && (
                    <div className="text-muted" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--space-1)' }}>
                      Maximo disponible: {i.max}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{currency(i.price * i.qty)}</div>
                  <button className="icon-btn" onClick={() => removeItem(i.key)} aria-label="Quitar">🗑</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer__foot stack">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Subtotal</span>
              <span>{currency(subtotal)}</span>
            </div>
            {hasOrderItems && (
              <p className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
                Incluye productos a pedido: demora estimada ~5 dias habiles.
              </p>
            )}
            <Button block onClick={goCheckout}>
              {isAuthenticated ? 'Continuar reserva' : 'Registrarme y reservar'}
            </Button>
            {!isAuthenticated && (
              <p className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
                Necesitas una cuenta para confirmar. Tu reserva se mantiene mientras te registras.
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
