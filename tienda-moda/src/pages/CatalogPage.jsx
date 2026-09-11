import { useSearchParams } from 'react-router-dom'
import CatalogExplorer from '../components/catalog/CatalogExplorer'

export default function CatalogPage() {
  const [params] = useSearchParams()
  const filtro = params.get('filtro')
  const initialFilters = {}
  if (filtro === 'stock' || filtro === 'order') initialFilters.availability = filtro

  return (
    <div className="page">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Catalogo completo</span>
          <h1 className="section-title">Encontra tu talle</h1>
          <p className="section-lead">
            Buscador, filtros y paginado. Reserva sin pagar online: se confirma al retirar o recibir.
          </p>
        </div>
        <CatalogExplorer pageSize={9} initialFilters={initialFilters} />
      </div>
    </div>
  )
}
