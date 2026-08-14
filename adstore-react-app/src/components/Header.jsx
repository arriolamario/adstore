import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';

export default function Header() {
  const navigate = useNavigate();
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer click afuera
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const avatarUrl = usuario?.avatarUrl ? usuario.avatarUrl : null;

  const handleLogout = () => {
    setMenuAbierto(false);
    logout();
  };

  return (
    <>
      <header style={{
        background: '#1a1a2e', color: 'white',
        padding: '16px 32px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <h1
          style={{ 
            color: 'white',
            margin: 0, fontSize: 24, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          ADStore
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {usuario ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              {/* Botón avatar + nombre */}
              <button
                onClick={() => setMenuAbierto(o => !o)}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 50, padding: '3px 12px 3px 4px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', color: 'white'
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: '#e74c3c', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700
                  }}>
                    {usuario.nombre?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <span style={{ fontSize: 13 }}>{usuario.nombre}</span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
              </button>

              {/* Dropdown */}
              {menuAbierto && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  minWidth: 180, overflow: 'hidden', zIndex: 200
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{usuario.nombre}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{usuario.email}</p>
                  </div>
                  <MenuItem icon="👤" label="Mi perfil" onClick={() => { setMenuAbierto(false); navigate('/mi-perfil'); }} />
                  <MenuItem icon="📦" label="Mis pedidos" onClick={() => { setMenuAbierto(false); navigate('/mis-pedidos'); }} />
                  <div style={{ borderTop: '1px solid #f0f0f0' }}>
                    <MenuItem icon="🚪" label="Cerrar sesión" onClick={handleLogout} danger />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setMostrarAuth(true)} style={btnOutlineStyle}>
              Ingresar / Registrarse
            </button>
          )}

          <button onClick={() => setMostrarCarrito(true)} style={{
            ...btnOutlineStyle,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            🛒 Carrito
            {items.length > 0 && (
              <span style={{
                background: '#e74c3c', borderRadius: '50%',
                width: 18, height: 18, fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {items.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {mostrarCarrito && <CartDrawer onClose={() => setMostrarCarrito(false)} />}
      {mostrarAuth && (
        <AuthModal
          onClose={() => setMostrarAuth(false)}
          onSuccess={() => setMostrarAuth(false)}
        />
      )}
    </>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', textAlign: 'left', background: hover ? '#f9f9f9' : 'white',
        border: 'none', padding: '10px 16px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 13, color: danger ? '#e74c3c' : '#333',
        transition: 'background 0.15s'
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

const btnOutlineStyle = {
  background: 'none',
  border: '1px solid rgba(255,255,255,0.4)',
  color: 'white', borderRadius: 6,
  padding: '7px 14px', cursor: 'pointer', fontSize: 13
};