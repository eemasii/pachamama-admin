import type { Product } from '../types';
import { useDragScroll } from '../hooks/useDragScroll';
import { PAGE_SIZE } from '../hooks/useProducts';
import { Barcode, Edit2, Trash2, Search, Package, Tag, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductsManagerProps {
  products: Product[];
  categories: string[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  page: number;
  totalPages: number;
  totalProducts: number;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (candidate: { id: string; title: string }) => void;
}

export function ProductsManager({
  products, categories, loading, searchTerm, onSearchChange, selectedCategory, onCategoryChange,
  page, totalPages, totalProducts, onPageChange, onEdit, onDelete,
}: ProductsManagerProps) {
  const { ref: dragRef, isMouseDown, handleMouseDown, handleMouseLeaveOrUp, handleMouseMove } = useDragScroll();

  const pageBtn =
    'p-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold text-gray-700 cursor-pointer';
  const catBtn = (active: boolean, activeCls: string) =>
    `px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
      active ? `${activeCls} text-white shadow-xs` : 'bg-[#f7f4ed] text-gray-600 hover:bg-gray-200/60'
    }`;
  const statCard = 'bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4';
  const statLabel = 'text-xs font-bold text-gray-500 uppercase tracking-wider';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={statCard}>
          <div className="p-3 bg-[#1b3b2b]/10 text-[#1b3b2b] rounded-xl"><Package className="w-6 h-6" /></div>
          <div>
            <p className={statLabel}>Encontrados en BD</p>
            <p className="text-2xl font-black text-[#1b3b2b]">{totalProducts}</p>
          </div>
        </div>
        <div className={statCard}>
          <div className="p-3 bg-[#c85a32]/10 text-[#c85a32] rounded-xl"><Tag className="w-6 h-6" /></div>
          <div>
            <p className={statLabel}>Categorías en BD</p>
            <p className="text-2xl font-black text-[#1b3b2b]">{categories.length}</p>
          </div>
        </div>
        <div className={statCard}>
          <div className="p-3 bg-emerald-500/10 text-emerald-700 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <p className={statLabel}>Sesión Segura</p>
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
            placeholder="Buscar por nombre o escanear código..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#f7f4ed] pl-10 pr-4 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#c85a32]"
          />
        </div>

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
          <button onClick={() => onCategoryChange('Todas')} className={catBtn(selectedCategory === 'Todas', 'bg-[#1b3b2b]')}>
            Todas
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => onCategoryChange(cat)} className={catBtn(selectedCategory === cat, 'bg-[#c85a32]')}>
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
                      {product.barcode && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-mono text-[#1b3b2b] bg-[#f7f4ed] border border-[#e28763]/40 rounded-md px-1.5 py-0.5">
                          <Barcode className="w-3 h-3 text-[#c85a32]" />
                          {product.barcode}
                        </span>
                      )}
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
                  <td className="p-4 font-black text-[#1b3b2b] text-base">${product.price.toLocaleString('es-AR')}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      title="Editar producto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete({ id: product._id, title: product.title })}
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
              <span className="font-bold text-gray-800">{Math.min(page * PAGE_SIZE, totalProducts)}</span> de{' '}
              <span className="font-bold text-gray-800">{totalProducts}</span> productos coincidentes
            </p>

            <div className="flex items-center gap-2">
              <button onClick={() => onPageChange(page - 1)} disabled={page === 1 || loading} className={pageBtn}>
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-1.5 bg-[#1b3b2b] text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs">
                <span>Página</span>
                <select
                  value={page}
                  onChange={(e) => onPageChange(Number(e.target.value))}
                  disabled={loading}
                  className="bg-[#132a1e] text-white font-bold px-2 py-0.5 rounded-lg border border-white/20 focus:outline-none focus:border-[#c85a32] cursor-pointer"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p} className="bg-[#1b3b2b] text-white">{p}</option>
                  ))}
                </select>
                <span>de {totalPages}</span>
              </div>

              <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages || loading} className={pageBtn}>
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
