import { useState, useEffect } from 'react';
import { getPedidosUsuario } from '../services/api';

export function usePedidos(usuario) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuario) { setLoading(false); return; }
    getPedidosUsuario(usuario.token, usuario.usuarioId)
      .then(setPedidos)
      .catch(() => setError('No se pudieron cargar los pedidos'))
      .finally(() => setLoading(false));
  }, [usuario]);

  return { pedidos, loading, error };
}