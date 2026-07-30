import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePedidos } from '../hooks/usePedidos';
import Header from '../components/Header';

export default function MisPedidos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { pedidos, loading, error } = usePedidos(usuario);

  if (!usuario) {
    return (
      <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f9f9' }}>
        <Header />
        <main style={{ maxWidth: 700, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
          <p style={{ color: '#888' }}>Debés iniciar sesión para ver tus pedidos.</p>
          <button onClick={() => navigate('/')} style={btnStyle}>Volver al inicio</button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f9f9' }}>
      <Header />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>Mis pedidos</h2>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 14 }}>
            ← Volver
          </button>
        </div>

        {loading && <p style={{ color: '#888' }}>Cargando pedidos...</p>}
        {error && <p style={{ color: '#e74c3c' }}>{error}</p>}

        {!loading && pedidos.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p>Todavía no realizaste ningún pedido.</p>
            <button onClick={() => navigate('/')} style={btnStyle}>Ver productos</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pedidos
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .map(pedido => (
              <div key={pedido.id} style={{
                background: 'white', border: '1px solid #e0e0e0',
                borderRadius: 10, overflow: 'hidden'
              }}>
                {/* Cabecera pedido */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 20px', background: '#f8f8f8', borderBottom: '1px solid #eee'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>Pedido #{pedido.id}</span>
                    <span style={{ marginLeft: 12, fontSize: 13, color: '#888' }}>
                      {new Date(pedido.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                      background: estadoColor(pedido.estado).bg,
                      color: estadoColor(pedido.estado).text
                    }}>
                      {pedido.estado}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>
                      ${pedido.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Detalles */}
                <div style={{ padding: '12px 20px' }}>
                  {pedido.detalles.map(d => (
                    <div key={d.id} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '6px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14
                    }}>
                      <span style={{ color: '#333' }}>
                        {d.productoNombre}
                        <span style={{ color: '#888', marginLeft: 6 }}>x{d.cantidad}</span>
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        ${(d.precioUnitario * d.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}

function estadoColor(estado) {
  switch (estado?.toLowerCase()) {
    case 'pendiente':   return { bg: '#fff8e1', text: '#f59e0b' };
    case 'confirmado':  return { bg: '#e8f5e9', text: '#27ae60' };
    case 'cancelado':   return { bg: '#fdf2f2', text: '#e74c3c' };
    case 'enviado':     return { bg: '#e3f2fd', text: '#2196f3' };
    default:            return { bg: '#f0f0f0', text: '#666' };
  }
}

const btnStyle = {
  marginTop: 12, background: '#1a1a2e', color: 'white',
  border: 'none', borderRadius: 8, padding: '10px 24px',
  cursor: 'pointer', fontSize: 14
};