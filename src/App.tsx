import { useState, useEffect, useCallback } from 'react';
import type { Product, ApiResponse } from './types';
import { ProductFormModal } from './components/ProductFormModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast } from './components/Toast';
import { useDragScroll } from './hooks/useDragScroll';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Leaf, 
  RefreshCw, 
  Package, 
  Tag, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/products';
const CATEGORIES_API_URL = API_URL.replace('/products', '/categories');
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || '';
const PAGE_SIZE = 10;

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  
  // Paginación Servidor
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // Modales & Toast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<{ message: string | null; type: 'success' | 'error' }>({
    message: null,
    type: 'success',
  });

  const {
    ref: dragRef,
    isMouseDown,
    handleMouseDown,
    handleMouseLeaveOrUp,
    handleMouseMove,
  } = useDragScroll();

  // Obtener categorías reales de MongoDB Atlas
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(CATEGORIES_API_URL);
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }, []);

  // Consulta global de productos a MongoDB Atlas
  const fetchProducts = useCallback(
    async (targetPage: number) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', targetPage.toString());
        params.append('limit', PAGE_SIZE.toString());

        if (selectedCategory !== 'Todas') params.append('category', selectedCategory);
        if (searchTerm.trim()) params.append('search', searchTerm.trim());

        const res = await fetch(`${API_URL}?${params.toString()}`);
        const data: ApiResponse = await res.json();

        if (data.success) {
          setProducts(data.products);
          setTotalPages(data.pagination.totalPages);
          setTotalProducts(data.pagination.total);
        } else {
          throw new Error('Error en los datos');
        }
      } catch (error) {
        setToast({ message: 'Error al conectar con la base de datos.', type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, searchTerm]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm, fetchProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchProducts(newPage);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      const isEditing = Boolean(editingProduct);
      const url = isEditing ? `${API_URL}/${editingProduct!._id}` : API_URL;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error guardando producto');
      }

      setToast({
        message: isEditing ? 'Producto actualizado correctamente.' : 'Producto creado con éxito.',
        type: 'success',
      });
      fetchCategories();
      fetchProducts(page);
    } catch (error: any) {
      setToast({ message: error.message || 'No se pudo guardar el producto.', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    try {
      const res = await fetch(`${API_URL}/${deleteCandidate.id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': ADMIN_TOKEN,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error eliminando producto');
      }

      setToast({ message: `"${deleteCandidate.title}" eliminado correctamente.`, type: 'success' });
      
      fetchCategories();
      const newTotal = totalProducts - 1;
      const newTotalPages = Math.ceil(newTotal / PAGE_SIZE) || 1;
      const targetPage = page > newTotalPages ? newTotalPages : page;
      setPage(targetPage);
      fetchProducts(targetPage);
    } catch (error: any) {
      setToast({ message: error.message || 'No se pudo eliminar el producto.', type: 'error' });
    } finally {
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-gray-800 flex flex-col justify-between">
      <div>
        <header className="sticky top-0 z-40 bg-[#1b3b2b] text-[#f8f6f0] shadow-md border-b border-[#c85a32]/30 px-4 sm:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#c85a32] p-2.5 rounded-2xl shadow-inner flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-[#f8f6f0]">
                  Pachamama Admin
                </h1>
                <span className="text-[11px] text-[#e28763] font-semibold tracking-wider uppercase block mt-1">
                  Panel de Gestión de Catálogo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchCategories();
                  fetchProducts(page);
                }}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
                title="Recargar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
                className="bg-[#c85a32] hover:bg-[#b34e2a] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-[#1b3b2b]/10 text-[#1b3b2b] rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Encontrados en BD</p>
                <p className="text-2xl font-black text-[#1b3b2b]">{totalProducts}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-[#c85a32]/10 text-[#c85a32] rounded-xl">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categorías en BD</p>
                <p className="text-2xl font-black text-[#1b3b2b]">{categories.length}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paginación Servidor</p>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Página {page} de {totalPages}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-72 flex-shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en toda la base..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f7f4ed] pl-10 pr-4 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#c85a32]"
              />
            </div>

            {/* Renderizado de TODAS las categorías traídas de MongoDB Atlas */}
            <div
              ref={dragRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              className={`flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none select-none w-full ${
                isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <button
                onClick={() => setSelectedCategory('Todas')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === 'Todas'
                    ? 'bg-[#1b3b2b] text-white shadow-xs'
                    : 'bg-[#f7f4ed] text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#c85a32] text-white shadow-xs'
                      : 'bg-[#f7f4ed] text-gray-600 hover:bg-gray-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1b3b2b] text-white text-xs uppercase font-bold tracking-wider">
                    <th className="p-4">Producto</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-[#f7f4ed]/50 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-12 h-12 object-contain bg-[#f3efe6] rounded-xl p-1 border border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600';
                          }}
                        />
                        <div>
                          <p className="font-bold text-gray-800">{product.title}</p>
                          {product.description && (
                            <p className="text-xs text-gray-400 truncate max-w-xs">{product.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-[#c85a32]/10 text-[#c85a32] border border-[#c85a32]/20 text-xs px-3 py-1 rounded-full font-bold">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 font-black text-[#1b3b2b] text-base">
                        ${product.price.toLocaleString('es-AR')}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate({ id: product._id, title: product.title })}
                          className="p-2 text-[#c85a32] hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && !loading && (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg font-bold text-gray-700">No se encontraron productos.</p>
                <p className="text-xs text-gray-400 mt-1">Prueba cambiando la búsqueda o la categoría seleccionada.</p>
              </div>
            )}

            {totalProducts > 0 && (
              <div className="p-4 bg-gray-50/80 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <p className="text-gray-500 font-medium">
                  Mostrando <span className="font-bold text-gray-800">{(page - 1) * PAGE_SIZE + 1}</span> a{' '}
                  <span className="font-bold text-gray-800">
                    {Math.min(page * PAGE_SIZE, totalProducts)}
                  </span>{' '}
                  de <span className="font-bold text-gray-800">{totalProducts}</span> productos coincidentes
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || loading}
                    className="p-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold text-gray-700 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <span className="px-3 py-1 bg-[#1b3b2b] text-white font-bold rounded-xl">
                    Página {page} de {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages || loading}
                    className="p-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold text-gray-700 cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="bg-[#1b3b2b] text-emerald-100/60 text-xs text-center py-4 border-t border-[#c85a32]/20">
        Pachamama Colorada Admin Panel • Categorías Dinámicas de BD
      </footer>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
        categories={categories}
      />

      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Eliminar Producto"
        message={`¿Estás seguro de que querés eliminar "${deleteCandidate?.title}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: null, type: 'success' })} />
    </div>
  );
}

export default App;