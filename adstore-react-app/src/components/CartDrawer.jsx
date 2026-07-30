import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { crearPedido } from '../services/api';
import AuthModal from './AuthModal';

export default function CartDrawer({ onClose }) {
  const { items, quitar, cambiarCantidad, vaciar, total } = useCart();
  const { usuario } = useAuth();
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [pedidoOk, setPedidoOk] = useState(false);
  const [error, setError] = useState('');

  const confirmar = async () => {
    if (!usuario) { setMostrarAuth(true); return; }
    setConfirmando(true);
    setError('');
    try {
      await crearPedido(usuario.token, usuario.usuarioId, items);
      vaciar();
      setPedidoOk(true);
    } catch {
      setError('Error al confirmar el pedido. Intentá de nuevo.');
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 900
      }} onClick={onClose} />

      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100%', width: 380,
        background: 'white', zIndex: 901, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #eee',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ margin: 0 }}>Carrito ({items.length})</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {pedidoOk ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48 }}>✅</div>
              <h4>¡Pedido confirmado!</h4>
              <p style={{ color: '#888', fontSize: 14 }}>Tu pedido fue registrado correctamente.</p>
              <button onClick={onClose} style={{
                marginTop: 12, background: '#1a1a2e', color: 'white',
                border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer'
              }}>Cerrar</button>
            </div>
          ) : items.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>El carrito está vacío</p>
          ) : (
            items.map(item => (
              <div key={item.productoTalleId} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                borderBottom: '1px solid #f0f0f0', paddingBottom: 14, marginBottom: 14
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.productoNombre}</p>
                  <p style={{ margin: '2px 0', fontSize: 12, color: '#888' }}>Talle: {item.talle}</p>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1a1a2e' }}>${item.precio.toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => cambiarCantidad(item.productoTalleId, item.cantidad - 1)}
                    style={btnCantStyle}>−</button>
                  <span style={{ minWidth: 20, textAlign: 'center', fontSize: 14 }}>{item.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(item.productoTalleId, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stockMax}
                    style={btnCantStyle}>+</button>
                </div>
                <button onClick={() => quitar(item.productoTalleId)}
                  style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 18 }}>
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {!pedidoOk && items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
            {error && (
              <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 8 }}>{error}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>${total.toFixed(2)}</span>
            </div>
            <button onClick={confirmar} disabled={confirmando} style={{
              width: '100%', background: '#1a1a2e', color: 'white',
              border: 'none', borderRadius: 8, padding: '14px', fontSize: 15,
              cursor: confirmando ? 'not-allowed' : 'pointer', opacity: confirmando ? 0.7 : 1
            }}>
              {confirmando ? 'Confirmando...' : 'Confirmar pedido'}
            </button>
          </div>
        )}
      </div>

      {mostrarAuth && (
        <AuthModal
          onClose={() => setMostrarAuth(false)}
          onSuccess={() => { setMostrarAuth(false); confirmar(); }}
        />
      )}
    </>
  );
}

const btnCantStyle = {
  width: 26, height: 26, border: '1px solid #ddd', background: 'white',
  borderRadius: 4, cursor: 'pointer', fontSize: 16, display: 'flex',
  alignItems: 'center', justifyContent: 'center'
};