import Button from '../ui/Button'

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
            Estamos en Av. Siempre Viva 1234. Atencion de lunes a sabado de 10 a 19 h.
            Reserva online y evita la cola.
          </p>
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button to="/catalogo" variant="secondary" size="lg">Explorar productos</Button>
            <Button to="/registro" variant="ghost" size="lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>
              Crear cuenta
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
