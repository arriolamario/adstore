export default function EmptyState({ icon = '📭', title, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      {title && <p style={{ fontWeight: 600, color: 'var(--text-soft)' }}>{title}</p>}
      {children && <p>{children}</p>}
    </div>
  )
}
