import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordWithToken } from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError('El enlace de recuperación no es válido.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithToken(token, form.newPassword);
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f9f9f9', fontFamily: 'sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: 'white', borderRadius: 12, padding: 36,
        width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, color: '#1a1a2e' }}>ADStore</h1>
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Nueva contraseña</h2>

        {exito ? (
          <div>
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '14px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20 }}>
              ✓ Tu contraseña fue actualizada correctamente.
            </div>
            <button onClick={() => navigate('/')} style={btnStyle}>
              Ir al inicio
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px' }}>
              Ingresá tu nueva contraseña. Debe tener al menos 6 caracteres.
            </p>

            {error && (
              <div style={{ background: '#fdf2f2', color: '#e74c3c', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {!token ? (
              <button onClick={() => navigate('/')} style={{ ...btnStyle, background: '#888' }}>
                Volver al inicio
              </button>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Nueva contraseña *</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    value={form.newPassword}
                    onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirmar contraseña *</label>
                  <input
                    type="password"
                    placeholder="Repetí la contraseña"
                    required
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: 14,
  border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box', outline: 'none'
};
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 5 };
const btnStyle = {
  background: '#1a1a2e', color: 'white', border: 'none',
  borderRadius: 8, padding: '12px', fontSize: 15,
  cursor: 'pointer', fontWeight: 600, width: '100%'
};
