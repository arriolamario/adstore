const items = [
  { icon: '⚡', text: 'Reserva en 30 segundos' },
  { icon: '🏬', text: 'Retiro por el local sin costo' },
  { icon: '🚚', text: 'Envios a todo el pais' },
  { icon: '🔁', text: 'Cambios dentro de los 30 dias' },
]

export default function TrustBar() {
  return (
    <div className="trustbar">
      <div className="container trustbar__inner">
        {items.map((i) => (
          <div className="trustbar__item" key={i.text}>
            <span>{i.icon}</span>
            <span>{i.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
