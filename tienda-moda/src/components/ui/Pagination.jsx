export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null

  const pages = []
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <nav className="pagination" aria-label="Paginacion de productos">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Anterior">‹</button>
      {pages.map((p, idx) =>
        p === '…' ? (
          <button key={`gap-${idx}`} disabled>…</button>
        ) : (
          <button
            key={p}
            className={p === page ? 'is-active' : ''}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label="Siguiente">›</button>
    </nav>
  )
}
