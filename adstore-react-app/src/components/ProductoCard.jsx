import { useNavigate } from 'react-router-dom';
export default function ProductoCard({ producto }) {
  const navigate = useNavigate();
  const imagenUrl = producto.imagenes?.[0]?.urlImagen
    ? producto.imagenes[0].urlImagen
    : null;

  return (
    <div onClick={() => navigate(`/producto/${producto.id}`)} style={{
      border: '1px solid #e0e0e0',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer'
    }}>
      {imagenUrl ? (
        <img src={imagenUrl} alt={producto.nombre}
          style={{ width: '100%', height: 200, objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: '100%', height: 200, background: '#f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#aaa', fontSize: 14
        }}>
          Sin imagen
        </div>
      )}
      <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{producto.nombre}</h3>
        <span style={{ fontSize: 12, color: '#777' }}>{producto.marcaNombre} · {producto.categoriaNombre}</span>
        {producto.descripcion && (
          <p style={{ fontSize: 13, color: '#555', margin: '4px 0', flexGrow: 1 }}>
            {producto.descripcion.length > 80
              ? producto.descripcion.slice(0, 80) + '...'
              : producto.descripcion}
          </p>
        )}
        <span style={{ fontWeight: 'bold', fontSize: 18, color: '#1a1a1a' }}>
          ${producto.precio.toFixed(2)}
        </span>

        <div style={{
          marginTop: 6,
          fontSize: 12,
          fontWeight: 600,
          color: producto.stockTotal > 0 ? '#27ae60' : '#e74c3c',
          background: producto.stockTotal > 0 ? '#eafaf1' : '#fdf2f2',
          padding: '3px 8px',
          borderRadius: 4,
          display: 'inline-block'
        }}>
          {producto.stockTotal > 0 ? `✓ En stock (${producto.stockTotal})` : '✗ Sin stock'}
        </div>
      </div>
    </div>
  );
}