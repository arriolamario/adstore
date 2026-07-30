import { useState, useMemo, useEffect } from 'react';

export function usePaginacion(items, porPagina = 12) {
  const [pagina, setPagina] = useState(1);

  // Si cambian los items (filtros), volver a página 1
  useEffect(() => { setPagina(1); }, [items]);

  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);

  const itemsPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return items.slice(inicio, inicio + porPagina);
  }, [items, paginaActual, porPagina]);

  return { itemsPagina, pagina: paginaActual, totalPaginas, setPagina };
}
