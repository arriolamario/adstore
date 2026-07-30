import { useState, useEffect } from 'react';
import { useProductos } from '../hooks/useProductos';
import { useFiltros } from '../hooks/useFiltros';
import { usePaginacion } from '../hooks/usePaginacion';
import { getMarcas, getCategorias } from '../services/api';
import ProductoCard from '../components/ProductoCard';
import FiltrosPanel from '../components/FiltrosPanel';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from '../components/CartDrawer';
import Header from '../components/Header';

const POR_PAGINA = 12;

export default function Home() {
  const { productos, loading, error } = useProductos();
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const {
    filtrados, busqueda, setBusqueda,
    marcaId, setMarcaId,
    categoriaId, setCategoriaId,
    precioMin, setPrecioMin,
    precioMax, setPrecioMax,
    limpiar
  } = useFiltros(productos);

  const { itemsPagina, pagina, totalPaginas, setPagina } = usePaginacion(filtrados, POR_PAGINA);

  useEffect(() => {
    getMarcas().then(data => setMarcas(data.filter(m => m.activo))).catch(() => {});
    getCategorias().then(data => setCategorias(data.filter(c => c.activo))).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f9f9' }}>
      <Header />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
        {loading && <p style={{ textAlign: 'center', color: '#888' }}>Cargando productos...</p>}
        {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <>
            <FiltrosPanel
              busqueda={busqueda} setBusqueda={setBusqueda}
              marcaId={marcaId} setMarcaId={setMarcaId}
              categoriaId={categoriaId} setCategoriaId={setCategoriaId}
              precioMin={precioMin} setPrecioMin={setPrecioMin}
              precioMax={precioMax} setPrecioMax={setPrecioMax}
              marcas={marcas} categorias={categorias}
              totalFiltrados={filtrados.length}
              totalProductos={productos.filter(p => p.activo).length}
              limpiar={limpiar}
            />

            {filtrados.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>No se encontraron productos.</p>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 20
                }}>
                  {itemsPagina.map(p => (
                    <ProductoCard key={p.id} producto={p} />
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <Paginacion pagina={pagina} totalPaginas={totalPaginas} setPagina={setPagina} />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Paginacion({ pagina, totalPaginas, setPagina }) {
  const paginas = [];
  const delta = 2;
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= pagina - delta && i <= pagina + delta))
      paginas.push(i);
    else if (paginas[paginas.length - 1] !== '...')
      paginas.push('...');
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 36 }}>
      <BtnPag onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>‹</BtnPag>

      {paginas.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ padding: '6px 4px', color: '#999', fontSize: 14 }}>…</span>
        ) : (
          <BtnPag key={p} onClick={() => setPagina(p)} activo={p === pagina}>{p}</BtnPag>
        )
      )}

      <BtnPag onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>›</BtnPag>
    </div>
  );
}

function BtnPag({ onClick, disabled, activo, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 36, height: 36, border: activo ? 'none' : '1px solid #ddd',
        borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        background: activo ? '#1a1a2e' : 'white',
        color: activo ? 'white' : disabled ? '#bbb' : '#333',
        fontWeight: activo ? 700 : 400, fontSize: 14,
        transition: 'all 0.15s'
      }}
    >
      {children}
    </button>
  );
}