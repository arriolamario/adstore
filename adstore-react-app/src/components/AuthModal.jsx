import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUsuario, registrarUsuario, forgotPassword } from '../services/api';

export default function AuthModal({ onClose, onSuccess }) {
  const { login } = useAuth();
  const [modo, setModo] = useState('login');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cambiarModo = (m) => { setModo(m); setError(''); setExito(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setExito(''); setLoading(true);
    try {
      if (modo === 'login') {
        const data = await loginUsuario(form.email, form.password);
        login(data); onSuccess();
      } else if (modo === 'registro') {
        const data = await registrarUsuario(form.nombre, form.email, form.password);
        login(data); onSuccess();
      } else if (modo === 'forgot') {
        await forgotPassword(form.email);
        setExito('Si el email esta registrado, recibiras un enlace para restablecer tu contrasena. Revisa tu bandeja de entrada.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const titulo = { login: 'Iniciar sesion', registro: 'Crear cuenta', forgot: 'Olvide mi contrasena' }[modo];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 32, width: '100%', maxWidth: 400, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>x</button>

        <h3 style={{ margin: '0 0 8px' }}>{titulo}</h3>

        {modo === 'forgot' && (
          <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px' }}>
            Ingresa tu email y te enviaremos un enlace para crear una nueva contrasena.
          </p>
        )}

        {error && <div style={{ background: '#fdf2f2', color: '#e74c3c', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        {exito && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>ok {exito}</div>}

        {!exito && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {modo === 'registro' && (
              <input type="text" placeholder="Nombre completo" required value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inputStyle} />
            )}
            <input type="email" placeholder="Email" required value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} />
            {(modo === 'login' || modo === 'registro') && (
              <input type="password" placeholder="Contrasena (min. 6 caracteres)" required minLength={6} value={form.password} onChange={e => set('password', e.target.value)} style={inputStyle} />
            )}
            <button type="submit" disabled={loading} style={{ background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Cargando...' : { login: 'Ingresar', registro: 'Registrarme', forgot: 'Enviar enlace' }[modo]}
            </button>
          </form>
        )}

        {modo === 'login' && !exito && (
          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 8, marginBottom: 0 }}>
            <button onClick={() => cambiarModo('forgot')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
              Olvide mi contrasena
            </button>
          </p>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, marginTop: 12, color: '#666', marginBottom: 0 }}>
          {modo === 'login' && <><span>No tenes cuenta? </span><Enlace onClick={() => cambiarModo('registro')}>Registrate</Enlace></>}
          {modo === 'registro' && <><span>Ya tenes cuenta? </span><Enlace onClick={() => cambiarModo('login')}>Ingresa</Enlace></>}
          {(modo === 'forgot' || !!exito) && <Enlace onClick={() => cambiarModo('login')}>Volver al login</Enlace>}
        </p>
      </div>
    </div>
  );
}

function Enlace({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#1a1a2e', cursor: 'pointer', fontWeight: 600, marginLeft: 4 }}>
      {children}
    </button>
  );
}

const inputStyle = {
  padding: '10px 14px', fontSize: 14,
  border: '1px solid #ddd', borderRadius: 8,
  width: '100%', boxSizing: 'border-box'
};
