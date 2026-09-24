import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { X, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
  categories: string[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setPrice(initialData.price.toString());
      setCategory(initialData.category);
      setImageUrl(initialData.imageUrl);
      setCustomCategory('');
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory(categories[0] || 'General');
      setImageUrl('');
      setCustomCategory('');
    }
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'NUEVA' ? customCategory.trim() : category.trim();

    if (!title || !price || !imageUrl || !finalCategory) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category: finalCategory,
        imageUrl: imageUrl.trim(),
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#f7f4ed] border border-[#c85a32]/20 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c85a32]" />
            <h2 className="text-xl font-extrabold text-[#1b3b2b]">
              {initialData ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b3b2b] mb-1.5">
              Título del Producto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Almendras Guara Seleccionadas"
              className="w-full bg-white px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#c85a32]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1b3b2b] mb-1.5">
                Precio ($ARS) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="13500"
                className="w-full bg-white px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-[#1b3b2b] focus:outline-none focus:border-[#c85a32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1b3b2b] mb-1.5">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#c85a32]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="NUEVA">+ Crear Nueva Categoría...</option>
              </select>
            </div>
          </div>

          {category === 'NUEVA' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#c85a32] mb-1.5">
                Nombre de la Nueva Categoría *
              </label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ej: Aceites y Vinagres"
                className="w-full bg-white px-4 py-2.5 border border-[#c85a32] rounded-xl text-sm focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b3b2b] mb-1.5">
              URL de la Imagen *
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-white px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#c85a32]"
            />
            {imageUrl ? (
              <div className="mt-3 flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-14 h-14 object-contain rounded-xl bg-[#f3efe6] p-1 border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error+Imagen';
                  }}
                />
                <div className="text-xs text-gray-500 truncate">
                  <p className="font-semibold text-gray-700">Vista previa limpia</p>
                  <p className="truncate max-w-xs">{imageUrl}</p>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                <span>Pega la URL de la foto del producto</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b3b2b] mb-1.5">
              Descripción (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre beneficios o presentación..."
              className="w-full bg-white px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#c85a32]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-extrabold text-white bg-[#c85a32] hover:bg-[#b34e2a] rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};