/** Campo de formulario reutilizable (input / textarea / select). */
export default function Field({ label, hint, as = 'input', children, className = '', ...rest }) {
  const id = rest.id || rest.name
  return (
    <div className={['field', className].filter(Boolean).join(' ')}>
      {label && <label htmlFor={id}>{label}</label>}
      {as === 'textarea' && <textarea id={id} className="textarea" {...rest} />}
      {as === 'select' && (
        <select id={id} className="select" {...rest}>
          {children}
        </select>
      )}
      {as === 'input' && <input id={id} className="input" {...rest} />}
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}
