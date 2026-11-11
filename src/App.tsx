import { useState } from 'react';
import type { Product } from './types';
import { ProductFormModal } from './components/ProductFormModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast } from './components/Toast';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { NavigationTabs, type TabId } from './components/NavigationTabs';
import { ProductsManager } from './components/ProductsManager';
import { ReceiptGenerator } from './components/ReceiptGenerator';
import { useAuth } from './hooks/useAuth';
import { useCatalog } from './hooks/useCatalog';
import { useProducts, API_URL, UPLOAD_API_URL } from './hooks/useProducts';

export function App() {
  const { token, login, logout, logoutReason, clearLogoutReason } = useAuth();
  const p = useProducts(token, logout);
  const [activeTab, setActiveTab] = useState<TabId>('products');
  const { catalog } = useCatalog(token, activeTab === 'receipt');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; title: string } | null>(null);
  if (!token) {
    return (
      <><Login onLoginSuccess={login} apiUrl={API_URL} /><Toast message={logoutReason} type="error" onClose={clearLogoutReason} /></>
    );
  }
  const openForm = (product: Product | null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-[#f7f4ed] text-gray-800 flex flex-col justify-between">
      <div>
        <Header
          loading={p.loading}
          showNewButton={activeTab === 'products'}
          onRefresh={p.refresh}
          onNew={() => openForm(null)}
          onLogout={() => logout()}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <NavigationTabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === 'products' ? (
            <ProductsManager
              {...p}
              onSearchChange={p.setSearchTerm}
              onCategoryChange={p.setSelectedCategory}
              onPageChange={p.handlePageChange}
              onEdit={openForm}
              onDelete={setDeleteCandidate}
            />
          ) : (
            <ReceiptGenerator products={catalog} />
          )}
        </main>
      </div>
      <footer className="bg-[#1b3b2b] text-emerald-100/60 text-xs text-center py-4 border-t border-[#c85a32]/20 print:hidden">
        Pachamama Colorada Admin Panel • Autenticación Segura
      </footer>
      <div className="print:hidden">
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => p.saveProduct(data, editingProduct)}
          initialData={editingProduct}
          categories={p.categories}
          token={token}
          uploadUrl={UPLOAD_API_URL}
        />
        <ConfirmModal
          isOpen={Boolean(deleteCandidate)}
          title="Eliminar Producto"
          message={`¿Estás seguro de que querés eliminar "${deleteCandidate?.title}"?`}
          onConfirm={async () => {
            if (deleteCandidate) await p.deleteProduct(deleteCandidate);
            setDeleteCandidate(null);
          }}
          onCancel={() => setDeleteCandidate(null)}
        />
        <Toast message={p.toast.message} type={p.toast.type} onClose={p.closeToast} />
      </div>
    </div>
  );
}
export default App;


