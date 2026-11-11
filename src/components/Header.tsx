import { Leaf, Plus, RefreshCw, LogOut } from 'lucide-react';

interface HeaderProps {
  loading: boolean;
  showNewButton: boolean;
  onRefresh: () => void;
  onNew: () => void;
  onLogout: () => void;
}

export function Header({ loading, showNewButton, onRefresh, onNew, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#1b3b2b] text-[#f8f6f0] shadow-md border-b border-[#c85a32]/30 px-4 sm:px-8 py-4 print:hidden">
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

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onRefresh}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {showNewButton && (
            <button
              onClick={onNew}
              className="bg-[#c85a32] hover:bg-[#b34e2a] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1.5"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
