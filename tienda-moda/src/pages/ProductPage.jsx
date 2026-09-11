import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Badge, { AvailabilityBadge } from '../components/ui/Badge'
import { currency } from '../lib/format'
import { availableSizes, isSoldOut, sizeStock, totalStock } from '../lib/inventory'
import { useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProduct } = useCatalog()
  const { addItem } = useCart()
  const product = getProduct(id)

  const firstSize =
    product?.availability === 'stock' ? availableSizes(product)[0] : product?.sizes?.[0]
  const [size, setSize] = useState(firstSize || 'Unico')

  if (!product) {
    return (
      <div className="page container">
        <h1>Producto no encontrado</h1>
        <p className="text-soft" style={{ marginBlock: 'var(--space-4)' }}>
          Puede que ya no este disponible.
        </p>
        <Button to="/catalogo">Volver al catalogo</Button>
      </div>
    )
  }

  const soldOut = isSoldOut(product)
  const isStock = product.availability === 'stock'
  const selectedUnits = sizeStock(product, size)
  const canReserve = !soldOut && selectedUnits > 0

  return (
    <div className="page">
      <div className="container">
        <p className="text-muted" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-5)' }}>
          <Link to="/catalogo">Catalogo</Link> / {product.category} / {product.name}
        </p>

        <div className="pdp">
          <div className="pdp__media">
            <img src={product.image} alt={product.name} />
          </div>

          <div>
            <span className="product-card__brand">{product.brand}</span>
            <h1 style={{ fontSize: 'var(--fs-3xl)', marginBlock: 'var(--space-2)' }}>{product.name}</h1>
            {soldOut ? <Badge variant="order">Agotado</Badge> : <AvailabilityBadge availability={product.availability} />}

            <div className="pdp__price">{currency(product.price)}</div>
            <p className="text-soft">{product.description}</p>

            <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
              Elegi tu talle
              {isStock && !soldOut && (
                <span className="text-muted" style={{ fontWeight: 400 }}>
                  {' '}· {totalStock(product)} unidades disponibles
                </span>
              )}
            </div>

            <div className="pdp__sizes">
              {product.sizes?.map((s) => {
                const units = sizeStock(product, s)
                const disabled = isStock && units <= 0
                return (
                  <button
                    key={s}
                    className={`chip ${size === s ? 'is-active' : ''}`}
                    disabled={disabled}
                    title={isStock ? (disabled ? 'Sin stock' : `${units} disponibles`) : 'A pedido'}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                )
              })}
            </div>

            {isStock && !soldOut && canReserve && selectedUnits <= 3 && (
              <p className="text-soft" style={{ fontSize: 'var(--fs-sm)' }}>
                Quedan {selectedUnits} en talle {size}.
              </p>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
              <Button size="lg" disabled={!canReserve} onClick={() => addItem(product, size)}>
                {canReserve ? 'Agregar a la reserva' : 'Sin stock'}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                disabled={!canReserve}
                onClick={() => {
                  addItem(product, size)
                  navigate('/checkout')
                }}
              >
                Reservar ahora
              </Button>
            </div>

            <p className="pdp__note">
              {product.availability === 'stock'
                ? '✔ Disponible para retiro hoy o envio en 24-72 h.'
                : '⏳ Producto a pedido: se encarga al confirmar la reserva y llega en ~5 dias habiles.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
