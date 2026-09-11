const AVAILABILITY = [
  { value: 'all', label: 'Todos' },
  { value: 'stock', label: 'En stock' },
  { value: 'order', label: 'A pedido' },
]

const SORTS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
]

export default function Filters({ categories, filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch, page: 1 })

  return (
    <div>
      <div className="catalog__toolbar">
        <div className="catalog__search">
          <input
            className="input"
            type="search"
            placeholder="Buscar por nombre, marca o categoria…"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            aria-label="Buscar productos"
          />
        </div>
        <select
          className="select"
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value })}
          aria-label="Ordenar"
          style={{ width: 'auto' }}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="filters">
        {AVAILABILITY.map((a) => (
          <button
            key={a.value}
            className={`chip ${filters.availability === a.value ? 'is-active' : ''}`}
            onClick={() => set({ availability: a.value })}
          >
            {a.label}
          </button>
        ))}
        <span style={{ width: 1, background: 'var(--border)', margin: '0 var(--space-2)' }} />
        <button
          className={`chip ${filters.category === 'all' ? 'is-active' : ''}`}
          onClick={() => set({ category: 'all' })}
        >
          Todas las categorias
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`chip ${filters.category === c ? 'is-active' : ''}`}
            onClick={() => set({ category: c })}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
