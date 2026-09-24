import React, { useState } from 'react';
import { Leaf, Lock, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
  apiUrl: string;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, apiUrl }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authUrl = apiUrl.replace('/products', '/auth/login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        onLoginSuccess(data.token);
      } else {
        setError(data.message || 'Contraseña incorrecta.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] flex items-center justify-center p-4">
      <div className="bg-white border border-[#c85a32]/20 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {/* Adorno superior decorativo */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1b3b2b] via-[#c85a32] to-[#1b3b2b]" />

        {/* Encabezado */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center bg-[#c85a32] p-3.5 rounded-2xl shadow-md text-white">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#1b3b2b] tracking-tight">
            Pachamama Admin
          </h1>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Acceso Privado al Panel de Control
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b3b2b] mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#c85a32]" />
              <span>Contraseña de Administrador</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresá la contraseña clave..."
                className="w-full bg-[#f7f4ed] pr-10 pl-4 py-3 rounded-xl text-sm border border-gray-300 focus:outline-none focus:border-[#c85a32] text-[#1b3b2b] font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-[#1b3b2b] hover:bg-[#132a1e] active:scale-95 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#c85a32]" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#c85a32]" />
                <span>Ingresar al Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-4">
          <p className="text-[11px] text-gray-400">
            Pachamama Colorada • Acceso restringido a personal autorizado.
          </p>
        </div>

      </div>
    </div>
  );
};