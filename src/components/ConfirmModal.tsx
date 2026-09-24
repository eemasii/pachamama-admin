import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#f7f4ed] border border-[#c85a32]/20 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-3">
          <div className="p-2.5 bg-red-500/10 text-red-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1b3b2b]">{title}</h3>
            <p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
          </div>
          <button onClick={onCancel} className="ml-auto p-1.5 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-700 my-4">{message}</p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition cursor-pointer"
          >
            Confirmar Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};