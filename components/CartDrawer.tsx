"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [cep, setCep] = useState("");
  const [shippingCost, setShippingCost] = useState<number | null>(null);

  if (!isCartOpen) return null;

  const handleCalculateShipping = () => {
    if (cep.length >= 8) {
      // Simulação estática de frete (R$ 15,00)
      setShippingCost(15.00);
    }
  };

  const finalTotal = cartTotal + (shippingCost || 0);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
      <div className="relative w-full max-w-md bg-[#1a1a1a] h-full shadow-2xl flex flex-col border-l-4 border-[#FF6B00] animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase text-white tracking-widest">Seu Carrinho</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        {/* ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <p className="text-lg font-bold">Seu carrinho está vazio.</p>
              <p className="text-sm mt-2">Navegue pelos produtos e adicione-os aqui.</p>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 bg-[#222222] p-4 rounded-xl border border-gray-800">
                <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0 bg-black">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-white font-bold text-sm leading-tight mb-1">{product.name}</h4>
                  <p className="text-[#FF6B00] font-black">{product.priceStr}</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white font-bold"
                    >-</button>
                    <span className="text-white font-bold">{quantity}</span>
                    <button 
                      onClick={() => updateQuantity(product.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white font-bold"
                    >+</button>
                  </div>
                </div>
                
                <button 
                  onClick={() => removeFromCart(product.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors p-2"
                  aria-label="Remover item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* FOOTER (Frete & Total) */}
        <div className="p-6 border-t border-gray-800 bg-[#111111] space-y-4">
          
          {/* Calculador de Frete Simulado */}
          {cart.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <input 
                type="text" 
                placeholder="CEP (Somente números)"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="bg-[#222222] border border-gray-700 text-white rounded-md px-3 py-2 flex-1 outline-none focus:border-[#FF6B00]"
                maxLength={8}
              />
              <button 
                onClick={handleCalculateShipping}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-bold transition-colors"
              >
                Calcular
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="font-bold">Subtotal</span>
              <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
            </div>
            
            {shippingCost !== null && (
              <div className="flex justify-between items-center text-gray-400">
                <span className="font-bold">Frete</span>
                <span>R$ {shippingCost.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-800">
              <span className="text-gray-400 font-bold uppercase">Total</span>
              <span className="text-3xl font-black text-[#FF6B00]">
                R$ {finalTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
          
          <button 
            disabled={cart.length === 0}
            onClick={() => {
              const itemsText = cart.map(item => `- ${item.quantity}x ${item.product.name}`).join('%0A');
              const total = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
              const freteText = shippingCost ? `%0AFrete: R$ ${shippingCost.toFixed(2).replace('.', ',')}` : "";
              const msg = `Olá, Piratas Fishing! Gostaria de finalizar meu pedido:%0A%0A${itemsText}${freteText}%0A%0A*Total: ${total}*`;
              
              window.open(`https://wa.me/?text=${msg}`, '_blank');
            }}
            className="w-full py-4 bg-[#25D366] hover:bg-[#20b858] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black text-lg rounded-lg uppercase tracking-wider transition-colors flex justify-center items-center gap-3 shadow-[0_0_15px_rgba(37,211,102,0.3)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Finalizar pelo WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
