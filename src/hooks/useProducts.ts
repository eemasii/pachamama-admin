import { useState, useEffect, useCallback } from 'react';
import type { Product, ApiResponse } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/products';
export const CATEGORIES_API_URL = API_URL.replace('/products', '/categories');
export const UPLOAD_API_URL = API_URL.replace('/products', '/upload');
export const PAGE_SIZE = 10;

export interface ToastState {
  message: string | null;
  type: 'success' | 'error';
}

export function useProducts(token: string | null, logout: (reason?: string) => void) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [toast, setToast] = useState<ToastState>({ message: null, type: 'success' });

  const authHeader = token ? token.trim() : '';
  const closeToast = () => setToast({ message: null, type: 'success' });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(CATEGORIES_API_URL, { headers: { 'x-admin-token': authHeader } });
      if (res.status === 401) {
        logout('Sesión expirada o token inválido. Por favor ingresá nuevamente.');
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) setCategories(data.categories);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }, [authHeader, logout]);

  const fetchProducts = useCallback(
    async (targetPage: number) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', targetPage.toString());
        params.append('limit', PAGE_SIZE.toString());
        if (selectedCategory !== 'Todas') params.append('category', selectedCategory);
        if (searchTerm.trim()) params.append('search', searchTerm.trim());

        const res = await fetch(`${API_URL}?${params.toString()}`, { headers: { 'x-admin-token': authHeader } });
        if (res.status === 401) {
          logout('Sesión expirada o token inválido.');
          return;
        }
        const data: ApiResponse = await res.json();
        if (!data.success) throw new Error(data.message || 'Error en los datos');
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setTotalProducts(data.pagination.total);
      } catch (error) {
        const msg = error instanceof Error ? error.message : '';
        setToast({ message: msg || 'Error al conectar con la base de datos.', type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [authHeader, selectedCategory, searchTerm, logout]
  );

  useEffect(() => {
    if (token) fetchCategories();
  }, [token, fetchCategories]);

  useEffect(() => {
    if (!token) return;
    setPage(1);
    const timer = setTimeout(() => fetchProducts(1), 300);
    return () => clearTimeout(timer);
  }, [token, selectedCategory, searchTerm, fetchProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchProducts(newPage);
  };

  const refresh = () => {
    fetchCategories();
    fetchProducts(page);
  };

  const saveProduct = async (productData: Partial<Product>, editing: Product | null) => {
    try {
      const isEditing = Boolean(editing);
      const url = isEditing ? `${API_URL}/${editing!._id}` : API_URL;
      const payload = {
        title: productData.title ? productData.title.trim() : '',
        description: productData.description ? productData.description.trim() : '',
        price: Number(productData.price) || 0,
        imageUrl: productData.imageUrl ? productData.imageUrl.trim() : '',
        category: productData.category ? productData.category.trim() : '',
        unit: productData.unit ? productData.unit.trim() : '1kg',
        barcode: productData.barcode ? productData.barcode.trim() : '',
      };
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': authHeader },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        logout('Sesión expirada o token inválido.');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Error guardando producto');

      setToast({
        message: isEditing ? 'Producto actualizado correctamente.' : 'Producto creado con éxito.',
        type: 'success',
      });
      refresh();
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      setToast({ message: msg || 'No se pudo guardar el producto.', type: 'error' });
    }
  };

  const deleteProduct = async (candidate: { id: string; title: string }) => {
    try {
      const res = await fetch(`${API_URL}/${candidate.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': authHeader },
      });
      if (res.status === 401) {
        logout('Sesión expirada o token inválido.');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Error eliminando producto');

      setToast({ message: `"${candidate.title}" eliminado correctamente.`, type: 'success' });
      fetchCategories();
      const newTotalPages = Math.ceil((totalProducts - 1) / PAGE_SIZE) || 1;
      const targetPage = page > newTotalPages ? newTotalPages : page;
      setPage(targetPage);
      fetchProducts(targetPage);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      setToast({ message: msg || 'No se pudo eliminar el producto.', type: 'error' });
    }
  };

  return {
    products, categories, loading, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory,
    page, totalPages, totalProducts, toast, closeToast, handlePageChange, refresh, saveProduct, deleteProduct,
  };
}
