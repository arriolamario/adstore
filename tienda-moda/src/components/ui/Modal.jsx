import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  // Portal a <body> para evitar que transforms/overflow de ancestros
  // (p. ej. .product-card:hover) recorten o reposicionen el modal.
  return createPortal(
    <div className="modal-center" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-center__box" role="dialog" aria-modal="true" aria-label={title}>
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--fs-xl)' }}>{title}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
        )}
        {children}
        {footer && <div style={{ marginTop: 'var(--space-5)' }}>{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
