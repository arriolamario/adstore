export default function Badge({ variant, children, className = '' }) {
  return (
    <span className={['badge', variant && `badge--${variant}`, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}

/** Badge de disponibilidad reutilizable. */
export function AvailabilityBadge({ availability }) {
  return availability === 'stock' ? (
    <Badge variant="stock">● En stock</Badge>
  ) : (
    <Badge variant="order">● A pedido · ~5 dias</Badge>
  )
}
