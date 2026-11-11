import { useState, useEffect } from 'react';
import type { Product, ApiResponse } from '../types';
import { API_URL } from './useProducts';

const CATALOG_PAGE_SIZE = 100;

/** Carga el catálogo completo (recorriendo todas las páginas) cuando `enabled` es true. */
export function useCatalog(token: string | null, enabled: boolean) {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  useEffect(() => {
    if (!token || !enabled) return;
    let cancelled = false;

    (async () => {
      setLoadingCatalog(true);
      try {
        const all: Product[] = [];
        let page = 1;
        let totalPages = 1;
        do {
          const res = await fetch(`${API_URL}?page=${page}&limit=${CATALOG_PAGE_SIZE}`, {
            headers: { 'x-admin-token': token.trim() },
          });
          if (!res.ok) break;
          const data: ApiResponse = await res.json();
          if (!data.success) break;
          all.push(...data.products);
          totalPages = data.pagination.totalPages;
          page += 1;
        } while (page <= totalPages);
        if (!cancelled) setCatalog(all);
      } catch (error) {
        console.error('Error cargando catálogo completo:', error);
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();

    return () => { cancelled = true; };
  }, [token, enabled]);

  return { catalog, loadingCatalog };
}
