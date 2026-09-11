import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge, { AvailabilityBadge } from '../ui/Badge'
import { currency } from '../../lib/format'
import { availableSizes, isSoldOut, sizeStock } from '../../lib/inventory'
import { useCart } from '../../context/CartContext'

/** Vista rapida: elegir talle y reservar sin salir del catalogo. */
export default function QuickReserveModal({ product, open, onClose }) {
  const { addItem } = useCart()
  const isStock = product.availability === 'stock'
  const [size, setSize] = useState(() =>
    isStock ? availableSizes(product)[0] : product.sizes?.[0],
  )

  const soldOut = isSoldOut(product)
  const selectedUnits = size ? sizeStock(product, size) : 0
  const canReserve = !soldOut && !!size && selectedUnits > 0

  const confirm = () => {
    addItem(product, size) // abre el drawer del carrito
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Reservar producto">
      <div className="quick-reserve">
        <img src={product.image} alt={product.name} />
        <div>
          <span className="product-card__brand">{product.brand}</span>
          <h4 style={{ fontSize: 'var(--fs-lg)', margin: 'var(--space-1) 0 var(--space-2)' }}>
            {product.name}
          </h4>
          {soldOut ? <Badge variant="order">Agotado</Badge> : <AvailabilityBadge availability={product.availability} />}
          <div style={{ fontWeight: 800, fontSize: 'var(--fs-xl)', marginTop: 'var(--space-2)' }}>
            {currency(product.price)}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, marginTop: 'var(--space-4)' }}>
        Elegi tu talle
      </div>
      <div className="pdp__sizes" style={{ marginBlock: 'var(--space-3)' }}>
        {product.sizes?.map((s) => {
          const units = sizeStock(product, s)
          const disabled = isStock && units <= 0
          return (
            <button
              key={s}
              type="button"
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

      {isStock && canReserve && selectedUnits <= 3 && (
        <p className="text-soft" style={{ fontSize: 'var(--fs-sm)' }}>
          Quedan {selectedUnits} en talle {size}.
        </p>
      )}
      {product.availability === 'order' && (
        <p className="text-soft" style={{ fontSize: 'var(--fs-sm)' }}>
          Producto a pedido: llega en ~5 dias habiles luego de confirmar.
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
        <Button onClick={confirm} disabled={!canReserve}>
          {canReserve ? 'Agregar a la reserva' : soldOut ? 'Agotado' : 'Elegi un talle'}
        </Button>
        <Button to={`/producto/${product.id}`} variant="ghost" onClick={onClose}>
          Ver detalle
        </Button>
      </div>
    </Modal>
  )
}
