import React, { useState, useMemo } from 'react';
import type { Product as CatalogProduct } from '../types';
import { Printer, Plus, Trash2, Search, ShoppingBag } from 'lucide-react';


interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ReceiptGeneratorProps {
  products: CatalogProduct[];
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ products: catalog }) => {
  const products = useMemo<Product[]>(
    () => catalog.map((p) => ({ id: p._id, name: p.title, price: p.price })),
    [catalog]
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Débito / Crédito'>('Efectivo');
  const [ticketNumber, setTicketNumber] = useState<number>(() => Math.floor(1000 + Math.random() * 9000));

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const prodId = prod.id;

    setCart(prev => {
      const existing = prev.find(item => item.id === prodId);
      if (existing) {
        return prev.map(item =>
          item.id === prodId
            ? { ...item, quantity: Number((item.quantity + customQuantity).toFixed(3)) }
            : item
        );
      }
      return [...prev, {
        id: prodId,
        name: prod.name,
        price: prod.price,
        quantity: customQuantity
      }];
    });

    setSelectedProductId('');
    setSearchTerm('');
    setCustomQuantity(1);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Number((item.quantity + delta).toFixed(3));
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleUpdatePrice = (id: string, price: number) => {
    setCart(prev => prev.map(item => (item.id === id ? { ...item, price: Math.max(0, price) } : item)));
  };

  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    if (cart.length > 0 && confirm('¿Deseas vaciar el ticket actual?')) {
      setCart([]);
      setTicketNumber(Math.floor(1000 + Math.random() * 9000));
    }
  };

  return (
    <div className="space-y-6">
      {/* VISTA EN PANTALLA */}
      <div className="print:hidden bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#c85a32]/10 text-[#c85a32] rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Emisión de Tickets de Mostrador</h2>
              <p className="text-xs text-stone-500">Carga rápida de ventas para entregar comprobante al cliente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={cart.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              Nuevo / Limpiar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={cart.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#1b3b2b] hover:bg-[#152e22] text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Ticket
            </button>
          </div>
        </div>

        {/* Buscador y Carga */}
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-5 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-stone-700 mb-1">Filtrar producto</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Escribe para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
              />
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-stone-700 mb-1">Seleccionar Producto</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
            >
              <option value="">-- Elige un producto --</option>
              {filteredProducts.map(p => {
                const id = p.id;
                return (
                  <option key={id} value={id}>
                    {p.name} - ${p.price.toLocaleString('es-AR')}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">Cantidad / Peso (kg)</label>
            <input
              type="number"
              step="any"
              min="0.01"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b3b2b]"
            />
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={!selectedProductId || customQuantity <= 0}
              className="w-full py-2 bg-[#c85a32] hover:bg-[#b04d29] text-white rounded-xl flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
              title="Añadir a la lista"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Tabla preliminar */}
        <div className="mt-6 border border-stone-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-100 text-stone-700 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Producto</th>
                <th className="py-2.5 px-4 text-center">Cant.</th>
                <th className="py-2.5 px-4 text-right">Precio Unit.</th>
                <th className="py-2.5 px-4 text-right">Subtotal</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    No hay productos cargados en el comprobante actual.
                  </td>
                </tr>
              ) : (
                cart.map(item => (
                  <tr key={item.id} className="hover:bg-stone-50/60">
                    <td className="py-2.5 px-4 font-medium text-stone-900">{item.name}</td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-5 h-5 bg-stone-100 rounded text-stone-700 hover:bg-stone-200 cursor-pointer"
                        >-</button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-5 h-5 bg-stone-100 rounded text-stone-700 hover:bg-stone-200 cursor-pointer"
                        >+</button>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <span>$</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 text-right text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c85a32]"
                          title="Editar precio unitario"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-stone-900">
                      ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen */}
        {cart.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-200 gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-stone-600">Forma de Pago:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                className="text-xs font-medium border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia / Alias</option>
                <option value="Débito / Crédito">Débito / Crédito</option>
              </select>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500 block">Total a Cobrar</span>
              <span className="text-2xl font-black text-[#1b3b2b]">
                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* VISTA DE IMPRESIÓN (visible exclusivamente al imprimir) */}
      <div className="hidden print:block font-mono text-[11px] leading-tight text-black max-w-[280px] mx-auto p-2">
        <div className="text-center pb-2 border-b border-dashed border-black">
          <p className="font-extrabold text-sm uppercase">Pachamama Colorada</p>
          <p className="text-[10px]">Alimentos Naturales & Dietética</p>
          <p className="text-[10px]">Av. Rademacher 2880 - Posadas, Misiones</p>
          <p className="text-[10px]">WhatsApp: +54 9 376 480-9283</p>
        </div>

        <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>Ticket: #{ticketNumber}</span>
            <span>{new Date().toLocaleDateString('es-AR')}</span>
          </div>
          <div className="flex justify-between">
            <span>Hora: {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Pago: {paymentMethod}</span>
          </div>
        </div>

        <table className="w-full my-2 text-left">
          <thead>
            <tr className="border-b border-black text-[10px]">
              <th className="py-1">Cant x Art.</th>
              <th className="text-right py-1">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dotted divide-stone-400">
            {cart.map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="py-1 pr-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-[9px] text-stone-600">
                    {item.quantity} x ${item.price.toLocaleString('es-AR')}
                  </div>
                </td>
                <td className="text-right py-1 whitespace-nowrap font-bold">
                  ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pt-2 border-t-2 border-black space-y-1">
          <div className="flex justify-between text-xs font-black">
            <span>TOTAL:</span>
            <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="text-center pt-4 mt-3 border-t border-dashed border-black text-[9px] space-y-0.5">
          <p className="font-bold">¡Muchas gracias por su compra!</p>
          <p>Comprobante no válido como factura</p>
          <p>www.pachamamacolorada.com.ar</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
