export default function FiltrosPanel({
  busqueda, setBusqueda,
  marcaId, setMarcaId,
  categoriaId, setCategoriaId,
  precioMin, setPrecioMin,
  precioMax, setPrecioMax,
  marcas, categorias,
  totalFiltrados, totalProductos,
  limpiar
}) {
  const hayFiltros = busqueda || marcaId || categoriaId || precioMin || precioMax;

  return (
    <div style={{
      background: 'white', border: '1px solid #e0e0e0',
      borderRadius: 10, padding: 20, marginBottom: 24
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Filtros</span>
        <span style={{ fontSize: 13, color: '#888' }}>
          {totalFiltrados} de {totalProductos} productos
          {hayFiltros && (
            <button onClick={limpiar} style={{
              marginLeft: 10, background: 'none', border: 'none',
              color: '#e74c3c', cursor: 'pointer', fontSize: 13, textDecoration: 'underline'
            }}>
              Limpiar
            </button>
          )}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={inputStyle}
        />

        {/* Marca */}
        <select value={marcaId} onChange={e => setMarcaId(e.target.value)} style={inputStyle}>
          <option value="">Todas las marcas</option>
          {marcas.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>

        {/* Categoría */}
        <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} style={inputStyle}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        {/* Precio mín */}
        <input
          type="number"
          placeholder="Precio mín"
          value={precioMin}
          onChange={e => setPrecioMin(e.target.value)}
          min="0"
          style={inputStyle}
        />

        {/* Precio máx */}
        <input
          type="number"
          placeholder="Precio máx"
          value={precioMax}
          onChange={e => setPrecioMax(e.target.value)}
          min="0"
          style={inputStyle}
        />
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '8px 12px', fontSize: 14,
  border: '1px solid #ddd', borderRadius: 6,
  width: '100%', boxSizing: 'border-box'
};