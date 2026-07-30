const BASE_URL = 'http://localhost:5127/api';

export async function getProductos() {
  const res = await fetch(`${BASE_URL}/productos`);
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
}

export async function getProductoById(id) {
  const res = await fetch(`${BASE_URL}/productos/${id}`);
  if (!res.ok) throw new Error('Error al obtener producto');
  return res.json();
}

export async function getMarcas() {
  const res = await fetch(`${BASE_URL}/marcas`);
  if (!res.ok) throw new Error('Error al obtener marcas');
  return res.json();
}

export async function getCategorias() {
  const res = await fetch(`${BASE_URL}/categorias`);
  if (!res.ok) throw new Error('Error al obtener categorías');
  return res.json();
}

export async function getProductoTallesById(id) {
  const res = await fetch(`${BASE_URL}/productotalles/producto/${id}`);
  if (!res.ok) throw new Error('Error al obtener producto');
  return res.json();
}


export async function loginUsuario(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Email o contraseña incorrectos');
  return res.json();
}

export async function registrarUsuario(nombre, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password, confirmPassword: password, rol: 'Cliente' })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Error al registrarse');
  }
  return res.json();
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Error al procesar la solicitud');
  }
  return res.json();
}

export async function resetPasswordWithToken(token, newPassword) {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Error al restablecer la contraseña');
  }
  return res.json();
}

export async function crearPedido(token, usuarioId, items) {
  const res = await fetch(`${BASE_URL}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      usuarioId,
      estado: 'Pendiente',
      detalles: items.map(i => ({
        productoTalleId: i.productoTalleId,
        cantidad: i.cantidad,
        precioUnitario: i.precio
      }))
    })
  });
  if (!res.ok) throw new Error('Error al confirmar el pedido');
  return res.json();
}

export async function getPedidosUsuario(token, usuarioId) {
  const res = await fetch(`${BASE_URL}/pedidos/usuario/${usuarioId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
}

export async function getUsuarioById(token, usuarioId) {
  const res = await fetch(`${BASE_URL}/usuarios/${usuarioId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener perfil');
  return res.json();
}

export async function actualizarUsuario(token, usuarioId, datos) {
  const res = await fetch(`${BASE_URL}/usuarios/${usuarioId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Error al actualizar perfil');
  }
  return res.json();
}

export async function subirAvatarUsuario(token, usuarioId, archivo) {
  const formData = new FormData();
  formData.append('file', archivo);
  const res = await fetch(`${BASE_URL}/usuarios/${usuarioId}/avatar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) throw new Error('Error al subir la foto');
  return res.json();
}

export async function eliminarAvatarUsuario(token, usuarioId) {
  const res = await fetch(`${BASE_URL}/usuarios/${usuarioId}/avatar`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al eliminar la foto');
}