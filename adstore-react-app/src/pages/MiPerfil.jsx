import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actualizarUsuario, subirAvatarUsuario, eliminarAvatarUsuario } from '../services/api';
import Header from '../components/Header';

export default function MiPerfil() {
  const navigate = useNavigate();
  const { usuario, actualizarPerfil } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nombre: usuario?.nombre ?? '',
    email: usuario?.email ?? '',
    password: '',
    confirmPassword: '',
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  if (!usuario) {
    return (
      <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f9f9' }}>
        <Header />
        <main style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', color: '#888' }}>
          <p>Debés iniciar sesión para ver tu perfil.</p>
          <button onClick={() => navigate('/')} style={btnStyle}>Volver al inicio</button>
        </main>
      </div>
    );
  }

  const avatarUrl = usuario.avatarUrl
    ? usuario.avatarUrl
    : null;

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.email.trim()) e.email = 'El email es obligatorio';
    if (form.password && form.password.length < 6)
      e.password = 'La contraseña debe tener al menos 6 caracteres';
    if (form.password && form.password !== form.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden';
    return e;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const e2 = validar();
    if (Object.keys(e2).length > 0) { setErrores(e2); return; }
    setErrores({});
    setGuardando(true);
    setExito('');
    try {
      const datos = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        ...(form.password ? { password: form.password } : {}),
      };
      const actualizado = await actualizarUsuario(usuario.token, usuario.usuarioId, datos);
      actualizarPerfil({ nombre: actualizado.nombre, email: actualizado.email });
      setExito('Perfil actualizado correctamente');
      setForm(f => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const handleFotoChange = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendoFoto(true);
    try {
      const res = await subirAvatarUsuario(usuario.token, usuario.usuarioId, archivo);
      actualizarPerfil({ avatarUrl: res.avatarUrl });
      setExito('Foto actualizada');
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setSubiendoFoto(false);
      e.target.value = '';
    }
  };

  const handleEliminarFoto = async () => {
    if (!window.confirm('¿Eliminar la foto de perfil?')) return;
    setSubiendoFoto(true);
    try {
      await eliminarAvatarUsuario(usuario.token, usuario.usuarioId);
      actualizarPerfil({ avatarUrl: null });
      setExito('Foto eliminada');
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setSubiendoFoto(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f9f9f9' }}>
      <Header />
      <main style={{ maxWidth: 560, margin: '40px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>Mi perfil</h2>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 14 }}>
            ← Volver
          </button>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: 20, background: 'white', borderRadius: 12, border: '1px solid #e0e0e0' }}>
          <div style={{ position: 'relative' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1a1a2e' }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#1a1a2e', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700
              }}>
                {usuario.nombre?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 16 }}>{usuario.nombre}</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#888' }}>{usuario.email}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoFoto}
                style={{ ...btnStyle, fontSize: 12, padding: '5px 12px' }}
              >
                {subiendoFoto ? 'Subiendo...' : '📷 Cambiar foto'}
              </button>
              {avatarUrl && (
                <button
                  onClick={handleEliminarFoto}
                  disabled={subiendoFoto}
                  style={{ ...btnDangerStyle, fontSize: 12, padding: '5px 12px' }}
                >
                  Eliminar foto
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFotoChange}
            />
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleGuardar} style={{ background: 'white', borderRadius: 12, border: '1px solid #e0e0e0', padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>Datos personales</h3>

          {errores.general && (
            <p style={{ background: '#fef2f2', color: '#e74c3c', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {errores.general}
            </p>
          )}
          {exito && (
            <p style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ✓ {exito}
            </p>
          )}

          <div style={fieldStyle}>
            <label style={labelStyle}>Nombre *</label>
            <input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              style={{ ...inputStyle, ...(errores.nombre ? errorInputStyle : {}) }}
            />
            {errores.nombre && <span style={errorTextStyle}>{errores.nombre}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{ ...inputStyle, ...(errores.email ? errorInputStyle : {}) }}
            />
            {errores.email && <span style={errorTextStyle}>{errores.email}</span>}
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 12px' }}>Dejá vacío si no querés cambiar la contraseña</p>

          <div style={fieldStyle}>
            <label style={labelStyle}>Nueva contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              style={{ ...inputStyle, ...(errores.password ? errorInputStyle : {}) }}
            />
            {errores.password && <span style={errorTextStyle}>{errores.password}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Confirmar contraseña</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              style={{ ...inputStyle, ...(errores.confirmPassword ? errorInputStyle : {}) }}
            />
            {errores.confirmPassword && <span style={errorTextStyle}>{errores.confirmPassword}</span>}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button type="submit" disabled={guardando} style={btnStyle}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

const fieldStyle = { marginBottom: 16 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 5 };
const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: 14,
  border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box', outline: 'none'
};
const errorInputStyle = { borderColor: '#e74c3c' };
const errorTextStyle = { fontSize: 12, color: '#e74c3c', marginTop: 3, display: 'block' };
const btnStyle = {
  background: '#1a1a2e', color: 'white', border: 'none',
  borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600
};
const btnDangerStyle = {
  background: 'white', color: '#e74c3c', border: '1px solid #e74c3c',
  borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14
};
