import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProductoTalles, useProducto } from '../hooks/useProducto';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { productoTalles, loading, error } = useProductoTalles(id);
  const { producto } = useProducto(id);
  const [talleSeleccionado, setTalleSeleccionado] = useState(null);
  const [imagenActiva, setImagenActiva] = useState(0);
  const { agregar } = useCart();
  const [agregado, setAgregado] = useState(false);
  
  

  if (loading) return <p style={{ textAlign: 'center', padding: 40, color: '#888' }}>Cargando...</p>;
  if (error || !producto) return <p style={{ textAlign: 'center', padding: 40, color: 'red' }}>{error}</p>;

  const talles = productoTalles ?? [];
  const imagenes = producto.imagenes ?? [];
  const imagenMostrada = imagenes[imagenActiva]?.urlImagen ?? null;

  
  const handleAgregar = () => {
    if (!talleSeleccionado) return;
    agregar(producto, talleSeleccionado);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f9f9' }}>
      <Header />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 16px' }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', color: '#555',
          cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0
        }}>
          ← Volver
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

          {/* Imágenes */}
          <div>
            <div style={{
              background: '#f0f0f0', borderRadius: 12, overflow: 'hidden',
              height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {imagenMostrada
                ? <img src={imagenMostrada} alt={producto.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#aaa' }}>Sin imagen</span>
              }
            </div>
            {imagenes.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {imagenes.map((img, i) => (
                  <img
                    key={img.id}
                    src={img.urlImagen}
                    onClick={() => setImagenActiva(i)}
                    style={{
                      width: 60, height: 60, objectFit: 'cover', borderRadius: 6,
                      cursor: 'pointer', border: imagenActiva === i ? '2px solid #1a1a2e' : '2px solid transparent'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span style={{ fontSize: 13, color: '#888' }}>{producto.marcaNombre} · {producto.categoriaNombre}</span>
              <h2 style={{ margin: '4px 0', fontSize: 28 }}>{producto.nombre}</h2>
            </div>

            <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>
              ${producto.precio?.toFixed(2)}
            </span>

            {producto.descripcion && (
              <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                {producto.descripcion}
              </p>
            )}

            {/* Talles */}
            {talles.length > 0 && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  Talle {talleSeleccionado ? `— ${talleSeleccionado.talle}` : ''}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {talles.map(t => {
                    const sinStock = t.stock === 0;
                    const seleccionado = talleSeleccionado?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        disabled={sinStock}
                        onClick={() => setTalleSeleccionado(t)}
                        style={{
                          padding: '8px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600,
                          cursor: sinStock ? 'not-allowed' : 'pointer',
                          border: seleccionado ? '2px solid #1a1a2e' : '2px solid #ddd',
                          background: sinStock ? '#f5f5f5' : seleccionado ? '#1a1a2e' : 'white',
                          color: sinStock ? '#bbb' : seleccionado ? 'white' : '#1a1a2e',
                          textDecoration: sinStock ? 'line-through' : 'none',
                          position: 'relative'
                        }}
                        title={sinStock ? 'Sin stock' : `Stock: ${t.stock}`}
                      >
                        {t.talle}
                      </button>
                    );
                  })}
                </div>
                {talleSeleccionado && (
                  <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
                    Stock disponible: {talleSeleccionado.stock} unidades
                  </p>
                )}
              </div>
            )}

            {talles.length === 0 && (
              <span style={{
                fontSize: 13, color: '#e74c3c', background: '#fdf2f2',
                padding: '6px 12px', borderRadius: 6, display: 'inline-block'
              }}>
                Sin stock disponible
              </span>
            )}

            <button
              onClick={handleAgregar}
              disabled={!talleSeleccionado}
              style={{
                marginTop: 8, padding: '14px 28px', fontSize: 15, fontWeight: 600,
                background: talleSeleccionado ? '#1a1a2e' : '#ddd',
                color: talleSeleccionado ? 'white' : '#999',
                border: 'none', borderRadius: 8,
                cursor: talleSeleccionado ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s'
              }}
            >
              {agregado ? '✓ Agregado' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}