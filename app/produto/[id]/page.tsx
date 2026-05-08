"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useParams } from "next/navigation";

// Mock DB
const productsDB = [
  { id: "isca-rosa-500g", name: "Isca de Camarão Rosa 500g", price: 35, priceStr: "R$ 35,00", image: "/lure_pink.png", description: "O camarão rosa é a nossa isca mais vendida, ideal para robalos e pescadas. Produzida com material super resistente que suporta várias fisgadas." },
  { id: "isca-salgado-1kg", name: "Isca de Camarão Salgado 1kg", price: 60, priceStr: "R$ 60,00", image: "/lure_salted.png", description: "Perfeito para longas pescarias. O tratamento com sal garante uma flutuabilidade e textura que atrai até os peixes mais manhosos." },
  { id: "isca-temperado-250g", name: "Isca Camarão Temperado 250g", price: 22, priceStr: "R$ 22,00", image: "/lure_spiced.png", description: "A essência atrativa imita o cheiro natural do camarão, criando um rastro infalível na água." },
  { id: "isca-articulada-10g", name: "Isca Camarão Articulado 10g", price: 15, priceStr: "R$ 15,00", image: "/lure_pink.png", description: "Nado realista que engana qualquer predador. Ideal para pescaria em manguezais." },
  { id: "isca-fluorescente-15g", name: "Isca Camarão Fluorescente 15g", price: 18, priceStr: "R$ 18,00", image: "/lure_salted.png", description: "Brilha no escuro! Excelente para pesca noturna ou em águas turvas." },
  { id: "isca-silicone-pacote", name: "Pacote Camarão Silicone 20un", price: 45, priceStr: "R$ 45,00", image: "/lure_spiced.png", description: "Kit econômico com 20 unidades de camarão de silicone macio e muito flexível." }
];

export default function ProdutoPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = productsDB.find((p) => p.id === id);

  if (!product) {
    return (
      <main className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-4xl font-black mb-4">Produto não encontrado</h1>
        <Link href="/catalogo" className="text-[#FF6B00] hover:underline text-lg">Voltar ao catálogo</Link>
      </main>
    );
  }

  return (
    <main className="font-sans min-h-screen bg-[#1a1a1a] flex-grow py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-8 flex gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-[#FF6B00] transition-colors">Início</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-[#FF6B00] transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* Imagem do Produto */}
          <div className="relative h-[400px] md:h-[600px] w-full bg-[#111111] rounded-3xl overflow-hidden border-2 border-gray-800 shadow-2xl">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </div>

          {/* Informações do Produto */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
              {product.name}
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>
            
            <div className="text-5xl font-black text-[#FF6B00] tracking-tighter mb-10">
              {product.priceStr}
            </div>

            {/* Ações Rápidas de Compra */}
            <div className="bg-[#222222] p-6 rounded-2xl border border-gray-800">
              <h4 className="text-white font-black uppercase tracking-widest mb-4">Adicionar ao carrinho em lote</h4>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => addToCart(product, 5)} className="py-3 border-2 border-gray-700 hover:border-[#FF6B00] text-white hover:text-[#FF6B00] font-bold rounded-lg transition-colors">
                  + 5 unidades
                </button>
                <button onClick={() => addToCart(product, 10)} className="py-3 border-2 border-gray-700 hover:border-[#FF6B00] text-white hover:text-[#FF6B00] font-bold rounded-lg transition-colors">
                  + 10 unidades
                </button>
                <button onClick={() => addToCart(product, 20)} className="py-3 border-2 border-gray-700 hover:border-[#FF6B00] text-white hover:text-[#FF6B00] font-bold rounded-lg transition-colors">
                  + 20 unidades
                </button>
                <button onClick={() => addToCart(product, 50)} className="py-3 border-2 border-gray-700 hover:border-[#FF6B00] text-white hover:text-[#FF6B00] font-bold rounded-lg transition-colors">
                  + 50 unidades
                </button>
              </div>

              <button 
                onClick={() => addToCart(product, 1)}
                className="w-full py-5 bg-[#FF6B00] hover:bg-[#e66000] text-white font-black text-lg rounded-xl uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,107,0,0.5)] transform hover:-translate-y-1"
              >
                Adicionar 1 Unidade
              </button>
            </div>
            
            {/* Informações Extras */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-500 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚚</span> Envio para todo Brasil
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span> Compra segura
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
