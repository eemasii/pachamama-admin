import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '../types';
import { X, Loader2, Image as ImageIcon, Sparkles, Link as LinkIcon, UploadCloud } from 'lucide-react';

type ImageMode = 'url' | 'file';
type SubmitPhase = 'idle' | 'uploading' | 'saving';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  message?: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
  categories: string[];
  token: string | null;
  uploadUrl: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  token,
  uploadUrl,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<ImageMode>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [phase, setPhase] = useState<SubmitPhase>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loading = phase !== 'idle';

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
    setImageMode('url');
    setSelectedFile(null);
    setFileError('');
  }, [initialData, isOpen, categories]);

  // Genera (y libera) la vista previa local del archivo seleccionado
  useEffect(() => {
    if (!selectedFile) {
      setFilePreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Formato no permitido. Usá JPG, PNG o WEBP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('La imagen supera el máximo de 5MB.');
      return;
    }
    setFileError('');
    setSelectedFile(file);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'x-admin-token': token ? token.trim() : '' },
      body: formData,
    });

    const data: UploadResponse = await res.json();
    if (!res.ok || !data.success || !data.imageUrl) {
      throw new Error(data.message || 'No se pudo subir la imagen.');
    }
    return data.imageUrl;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'NUEVA' ? customCategory.trim() : category.trim();
    const usingFile = imageMode === 'file' && selectedFile !== null;
    const hasImage = usingFile || (imageMode === 'url' ? Boolean(imageUrl.trim()) : Boolean(imageUrl));

    if (!title || !price || !hasImage || !finalCategory) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    try {
      let finalImageUrl = imageUrl.trim();

      if (usingFile && selectedFile) {
        setPhase('uploading');
        finalImageUrl = await uploadImage(selectedFile);
      }

      setPhase('saving');
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category: finalCategory,
        imageUrl: finalImageUrl,
      });
      onClose();
    } catch (error) {
      console.error(error);
      setFileError(error instanceof Error ? error.message : 'Error al guardar el producto.');
    } finally {
      setPhase('idle');
    }
  };

  const tabClass = (active: boolean) =>
    `flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
      active ? 'bg-[#1b3b2b] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200/60'
    }`;

  const submitLabel =
    phase === 'uploading'
      ? 'Subiendo imagen...'
      : phase === 'saving'
        ? 'Guardando...'
        : initialData
          ? 'Guardar Cambios'
          : 'Crear Producto';

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
              Imagen del Producto *
            </label>

            <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 mb-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setImageMode('url')}
                className={tabClass(imageMode === 'url')}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Por Link (URL)
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setImageMode('file')}
                className={tabClass(imageMode === 'file')}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Subir Archivo
              </button>
            </div>

            {imageMode === 'url' ? (
              <>
                <input
                  type="url"
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
              </>
            ) : (
              <>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-[#c85a32] bg-[#c85a32]/5'
                      : 'border-gray-300 bg-white hover:border-[#c85a32]'
                  }`}
                >
                  <UploadCloud className="w-7 h-7 mx-auto text-[#c85a32]" />
                  <p className="mt-1.5 text-sm font-semibold text-gray-700">
                    Arrastrá una imagen o tocá para seleccionar
                  </p>
                  <p className="text-xs text-gray-400">JPG, PNG o WEBP • máx. 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      handleFile(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </div>

                {selectedFile && filePreview ? (
                  <div className="mt-3 flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-14 h-14 object-contain rounded-xl bg-[#f3efe6] p-1 border border-gray-200"
                    />
                    <div className="text-xs text-gray-500 truncate flex-1">
                      <p className="font-semibold text-gray-700">Se subirá al guardar</p>
                      <p className="truncate max-w-xs">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setSelectedFile(null)}
                      className="p-1.5 text-gray-400 hover:text-[#c85a32] rounded-full cursor-pointer"
                      title="Quitar archivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  imageUrl && (
                    <div className="mt-3 flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200">
                      <img
                        src={imageUrl}
                        alt="Imagen actual"
                        className="w-14 h-14 object-contain rounded-xl bg-[#f3efe6] p-1 border border-gray-200"
                      />
                      <p className="text-xs text-gray-500">Imagen actual (se conserva si no subís otra)</p>
                    </div>
                  )
                )}
              </>
            )}

            {fileError && <p className="mt-2 text-xs font-semibold text-red-600">{fileError}</p>}
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
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-extrabold text-white bg-[#c85a32] hover:bg-[#b34e2a] disabled:opacity-70 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
