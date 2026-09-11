import Button from '../ui/Button'
import { AvailabilityBadge } from '../ui/Badge'
import { currency } from '../../lib/format'
import { useCatalog } from '../../context/CatalogContext'

export default function Hero() {
  const { products } = useCatalog()
  const featured = products.find((p) => p.availability === 'stock') || products[0]

  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="animate-in">
          <span className="eyebrow">Reserva online · Envio o retiro en local</span>
          <h1 className="hero__title">
            Asegura tus <span className="grad">zapatillas y ropa</span> antes de que se agoten
          </h1>
          <p className="hero__lead">
            Reservas tu talle en segundos. Lo que esta en stock sale hoy; lo que es a pedido
            llega en aproximadamente 5 dias habiles. Sin vueltas.
          </p>

          <div className="hero__cta">
            <Button to="/catalogo" size="lg">Ver catalogo</Button>
            <Button to="/catalogo?filtro=stock" variant="secondary" size="lg">
              Entrega inmediata
            </Button>
          </div>

          <div className="hero__meta">
            <div>
              <strong>+120</strong>
              <span>modelos disponibles</span>
            </div>
            <div>
              <strong>5 dias</strong>
              <span>demora en productos a pedido</span>
            </div>
            <div>
              <strong>2</strong>
              <span>formas de entrega</span>
            </div>
          </div>
        </div>

        {featured && (
          <div className="hero__card animate-in">
            <img src={featured.image} alt={featured.name} loading="eager" />
            <div className="hero__card-row">
              <div>
                <div className="product-card__brand">{featured.brand}</div>
                <div style={{ fontWeight: 600 }}>{featured.name}</div>
              </div>
              <span className="hero__price">{currency(featured.price)}</span>
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <AvailabilityBadge availability={featured.availability} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
