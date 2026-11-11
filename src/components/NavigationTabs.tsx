import { Package, Receipt } from 'lucide-react';

export type TabId = 'products' | 'receipt';

interface NavigationTabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; Icon: typeof Package }[] = [
  { id: 'products', label: 'Gestión de Productos', Icon: Package },
  { id: 'receipt', label: 'Generar Ticket de Venta', Icon: Receipt },
];

export function NavigationTabs({ activeTab, onChange }: NavigationTabsProps) {
  return (
    <div className="flex items-center gap-3 print:hidden">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === id
              ? 'bg-[#1b3b2b] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
