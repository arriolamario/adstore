import { useState, useEffect } from 'react';
import { getProductoTallesById, getProductoById } from '../services/api';

export function useProductoTalles(id) {
  const [productoTalles, setProductoTalles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    getProductoTallesById(id)
      .then(setProductoTalles)
      .catch(() => setError('No se pudo cargar el producto'))
      .finally(() => setLoading(false));
  }, [id]);

  return { productoTalles, loading, error };
}

export function useProducto(id) {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    getProductoById(id)
      .then(setProducto)
      .catch(() => setError('No se pudo cargar el producto'))
      .finally(() => setLoading(false));
  }, [id]);

  return { producto, loading, error };
}