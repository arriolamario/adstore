import { useMemo, useState } from 'react'
import Filters from './Filters'
import ProductCard from './ProductCard'
import Pagination from '../ui/Pagination'
import EmptyState from '../ui/EmptyState'
import { useCatalog } from '../../context/CatalogContext'

const DEFAULT_FILTERS = {
  query: '',
  availability: 'all',
  category: 'all',
  sort: 'relevance',
  page: 1,
}

export default function CatalogExplorer({ pageSize = 8, initialFilters = {} }) {
  const { products, categories, loading, error } = useCatalog()
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters })

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    let list = products.filter((p) => {
      if (filters.availability !== 'all' && p.availability !== filters.availability) return false
      if (filters.category !== 'all' && p.category !== filters.category) return false
      if (q && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q)) return false
      return true
    })

    switch (filters.sort) {
      case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break
      case 'name': list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break
      default: break
    }
    return list
  }, [products, filters])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(filters.page, pageCount)
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <Filters categories={categories} filters={filters} onChange={setFilters} />

      <p className="text-muted" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-4)' }}>
        {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
      </p>

      {loading && products.length === 0 ? (
        <EmptyState icon="⏳" title="Cargando catalogo…" />
      ) : error ? (
        <EmptyState icon="⚠️" title="No se pudo cargar el catalogo">{error}</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon="🔎" title="Sin resultados">
          Proba con otra busqueda o quita algun filtro.
        </EmptyState>
      ) : (
        <div className="product-grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
    </div>
  )
}
