import Button from '../ui/Button'

const WHATSAPP_URL = 'https://wa.me/5492664325416'

export default function CTASection() {
  return (
    <section className="section" id="local">
      <div className="container">
        <div
          className="card card--pad"
          style={{
            background: 'linear-gradient(120deg, var(--brand-600), var(--accent-500))',
            color: 'var(--text-invert)',
            border: 0,
            padding: 'var(--space-8)',
            textAlign: 'center',
          }}
        >
          <h2 className="section-title" style={{ color: '#fff' }}>
            Reserva hoy, retira cuando quieras
          </h2>
          <p style={{ margin: 'var(--space-4) auto 0', maxWidth: '48ch', opacity: 0.92 }}>
            Estamos en Av. Fuerza Aerea 2778. Reserva online y evita la cola.
          </p>
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button to="/catalogo" variant="secondary" size="lg">Explorar productos</Button>
            <Button href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" variant="ghost" size="lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>
              Escribinos por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
