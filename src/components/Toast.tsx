import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#1b3b2b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#c85a32]/30 animate-bounce-short">
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition ml-2">
        <X className="w-4 h-4 text-gray-300" />
      </button>
    </div>
  );
};