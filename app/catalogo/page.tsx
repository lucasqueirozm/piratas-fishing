"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

const products = [
  { id: "isca-rosa-500g", name: "Isca de Camarão Rosa 500g", price: 35, priceStr: "R$ 35,00", image: "/lure_pink.png" },
  { id: "isca-salgado-1kg", name: "Isca de Camarão Salgado 1kg", price: 60, priceStr: "R$ 60,00", image: "/lure_salted.png" },
  { id: "isca-temperado-250g", name: "Isca Camarão Temperado 250g", price: 22, priceStr: "R$ 22,00", image: "/lure_spiced.png" },
  { id: "isca-articulada-10g", name: "Isca Camarão Articulado 10g", price: 15, priceStr: "R$ 15,00", image: "/lure_pink.png" }, // Reusing image for mock
  { id: "isca-fluorescente-15g", name: "Isca Camarão Fluorescente 15g", price: 18, priceStr: "R$ 18,00", image: "/lure_salted.png" },
  { id: "isca-silicone-pacote", name: "Pacote Camarão Silicone 20un", price: 45, priceStr: "R$ 45,00", image: "/lure_spiced.png" }
];

export default function CatalogoPage() {
  const { addToCart } = useCart();

  return (
    <main className="font-sans min-h-screen bg-[#1a1a1a] flex-grow py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Catálogo Completo
          </h1>
          <p className="text-gray-400 mt-4 text-lg">Encontre a isca perfeita para a sua próxima pescaria.</p>
          <div className="w-32 h-1.5 bg-[#FF6B00] mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {products.map((p) => (
            <div key={p.id} className="bg-[#222222] rounded-2xl overflow-hidden border-2 border-gray-800 hover:border-[#8B0000] flex flex-col transition-all hover:shadow-[0_10px_30px_rgba(139,0,0,0.3)] group cursor-pointer relative">
              <Link href={`/produto/${p.id}`} className="absolute inset-0 z-10"></Link>
              <div className="h-64 bg-black w-full relative flex items-center justify-center overflow-hidden">
                <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-8 flex flex-col flex-grow relative z-20">
                <h3 className="text-xl font-black mb-3 text-white leading-tight">{p.name}</h3>
                <p className="text-[#FF6B00] text-3xl font-black mb-8 mt-auto tracking-tighter">{p.priceStr}</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(p);
                  }}
                  className="w-full block text-center py-3 bg-[#FF6B00] hover:bg-[#e66000] text-white font-black text-base rounded-lg uppercase tracking-wider transition-colors shadow-lg"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
