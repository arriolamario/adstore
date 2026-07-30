import { useState, useMemo } from 'react';

export function useFiltros(productos) {
  const [busqueda, setBusqueda] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  const filtrados = useMemo(() => {
    return productos.filter(p => {
      if (!p.activo) return false;
      if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
          !p.marcaNombre?.toLowerCase().includes(busqueda.toLowerCase()) &&
          !p.categoriaNombre?.toLowerCase().includes(busqueda.toLowerCase())) return false;
      if (marcaId && p.marcaId !== parseInt(marcaId)) return false;
      if (categoriaId && p.categoriaId !== parseInt(categoriaId)) return false;
      if (precioMin && p.precio < parseFloat(precioMin)) return false;
      if (precioMax && p.precio > parseFloat(precioMax)) return false;
      return true;
    });
  }, [productos, busqueda, marcaId, categoriaId, precioMin, precioMax]);

  const limpiar = () => {
    setBusqueda('');
    setMarcaId('');
    setCategoriaId('');
    setPrecioMin('');
    setPrecioMax('');
  };

  return {
    filtrados, busqueda, setBusqueda,
    marcaId, setMarcaId,
    categoriaId, setCategoriaId,
    precioMin, setPrecioMin,
    precioMax, setPrecioMax,
    limpiar
  };
}