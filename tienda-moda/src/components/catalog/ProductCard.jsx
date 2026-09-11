import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { AvailabilityBadge } from '../ui/Badge'
import Button from '../ui/Button'
import QuickReserveModal from './QuickReserveModal'
import { currency } from '../../lib/format'
import { isSoldOut } from '../../lib/inventory'

export default function ProductCard({ product }) {
  const [open, setOpen] = useState(false)
  const soldOut = isSoldOut(product)

  return (
    <article className="product-card">
      <Link to={`/producto/${product.id}`} className="product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-card__tag">
          {soldOut ? <Badge variant="order">Agotado</Badge> : <AvailabilityBadge availability={product.availability} />}
        </span>
      </Link>

      <div className="product-card__body">
        <span className="product-card__brand">{product.brand}</span>
        <Link to={`/producto/${product.id}`} className="product-card__name">{product.name}</Link>
        <span className="badge badge--brand" style={{ alignSelf: 'flex-start' }}>{product.category}</span>

        <div className="product-card__foot">
          <span className="product-card__price">{currency(product.price)}</span>
          <Button size="sm" disabled={soldOut} onClick={() => setOpen(true)}>
            {soldOut ? 'Agotado' : 'Reservar'}
          </Button>
        </div>
      </div>

      {open && <QuickReserveModal product={product} open={open} onClose={() => setOpen(false)} />}
    </article>
  )
}
