const steps = [
  {
    title: 'Elegi y reserva',
    text: 'Buscas tu modelo, seleccionas el talle y lo reservas. No pagas nada online: se confirma al retirar o recibir.',
  },
  {
    title: 'Te confirmamos',
    text: 'Si esta en stock, lo preparamos el mismo dia. Si es a pedido, lo encargamos y llega en ~5 dias habiles.',
  },
  {
    title: 'Retiro o envio',
    text: 'Pasas por el local a buscarlo o te lo enviamos a domicilio. Vos elegis la opcion mas comoda.',
  },
]

export default function HowItWorks() {
  return (
    <section className="section" id="como-funciona">
      <div className="container">
        <div className="section-head section-head--center">
          <span className="eyebrow">Como funciona</span>
          <h2 className="section-title">Reservar en AD Moda & Confort es simple</h2>
          <p className="section-lead">Tres pasos y tu producto queda separado a tu nombre.</p>
        </div>

        <div className="steps">
          {steps.map((s, i) => (
            <article className="card card--pad step" key={s.title}>
              <div className="step__num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p className="text-soft" style={{ fontSize: 'var(--fs-sm)' }}>{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
