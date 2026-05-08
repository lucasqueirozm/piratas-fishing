"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function Home() {
  const { addToCart } = useCart();

  return (
    <main className="font-sans selection:bg-[#FF6B00] selection:text-white relative flex-grow">
      {/* 2. HERO */}
      <section 
        className="relative bg-[#1a1a1a] py-24 sm:py-32 lg:py-40 overflow-hidden flex items-center justify-center min-h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: "url('/hero_bg.jpg')" }}
      >
        {/* Overlays para escurecer a imagem e integrar com o fundo da página */}
        <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/20 to-transparent pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase mb-2 drop-shadow-2xl">
            PIRATAS FISHING
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FF6B00] mb-6 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            O Segredo da Fisgada
          </h2>
          <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl font-medium mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Isca de camarão fresca e de qualidade para você fisgar mais
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link 
              href="/catalogo"
              className="px-8 py-4 bg-[#FF6B00] hover:bg-[#e66000] text-white font-black text-lg rounded-md uppercase tracking-wider transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,107,0,0.5)]"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO "POR QUE ESCOLHER A PIRATAS FISHING?" */}
      <section className="bg-[#222222] py-24 border-y border-[#8B0000]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-[#1a1a1a] p-10 rounded-2xl border-2 border-gray-800 hover:border-[#FF6B00] transition-colors text-center group shadow-xl">
              <div className="text-5xl mb-6 group-hover:scale-125 transition-transform inline-block drop-shadow-lg">🎣</div>
              <h3 className="text-xl font-black mb-4 text-white uppercase tracking-wide">Isca Artificial</h3>
              <p className="text-gray-400 font-bold text-base leading-relaxed">Iscas artificiais de alta qualidade para pescar mais</p>
            </div>
            
            <div className="bg-[#1a1a1a] p-10 rounded-2xl border-2 border-gray-800 hover:border-[#FF6B00] transition-colors text-center group shadow-xl">
              <div className="text-5xl mb-6 group-hover:scale-125 transition-transform inline-block drop-shadow-lg">🚚</div>
              <h3 className="text-xl font-black mb-4 text-white uppercase tracking-wide">Entrega Rápida</h3>
              <p className="text-gray-400 font-bold text-base leading-relaxed">Enviamos para todo o Brasil pelos Correios</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEÇÃO "PRODUTOS EM DESTAQUE" */}
      <section id="produtos" className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Nossos Produtos
            </h2>
            <div className="w-24 h-1.5 bg-[#FF6B00] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {/* Produto 1 */}
            <div className="bg-[#222222] rounded-2xl overflow-hidden border-2 border-gray-800 hover:border-[#8B0000] flex flex-col transition-all hover:shadow-[0_10px_30px_rgba(139,0,0,0.3)] group cursor-pointer relative">
              <Link href="/produto/isca-rosa-500g" className="absolute inset-0 z-10"></Link>
              <div className="h-64 bg-black w-full relative flex items-center justify-center overflow-hidden">
                <Image src="/lure_pink.png" alt="Isca de Camarão Rosa 500g" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-black mb-3 text-white leading-tight">Isca de Camarão Rosa 500g</h3>
                <p className="text-[#FF6B00] text-3xl font-black mb-8 mt-auto tracking-tighter">R$ 35,00</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart({id: 'isca-rosa-500g', name: 'Isca de Camarão Rosa 500g', price: 35, priceStr: 'R$ 35,00', image: '/lure_pink.png'})
                  }}
                  className="relative z-20 w-full block text-center py-3 bg-[#FF6B00] hover:bg-[#e66000] text-white font-black text-base rounded-lg uppercase tracking-wider transition-colors shadow-lg"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>

            {/* Produto 2 */}
            <div className="bg-[#222222] rounded-2xl overflow-hidden border-2 border-gray-800 hover:border-[#8B0000] flex flex-col transition-all hover:shadow-[0_10px_30px_rgba(139,0,0,0.3)] group cursor-pointer relative">
              <Link href="/produto/isca-salgado-1kg" className="absolute inset-0 z-10"></Link>
              <div className="h-64 bg-black w-full relative flex items-center justify-center overflow-hidden">
                <Image src="/lure_salted.png" alt="Isca de Camarão Salgado 1kg" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-black mb-3 text-white leading-tight">Isca de Camarão Salgado 1kg</h3>
                <p className="text-[#FF6B00] text-3xl font-black mb-8 mt-auto tracking-tighter">R$ 60,00</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart({id: 'isca-salgado-1kg', name: 'Isca de Camarão Salgado 1kg', price: 60, priceStr: 'R$ 60,00', image: '/lure_salted.png'})
                  }}
                  className="relative z-20 w-full block text-center py-3 bg-[#FF6B00] hover:bg-[#e66000] text-white font-black text-base rounded-lg uppercase tracking-wider transition-colors shadow-lg"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>

            {/* Produto 3 */}
            <div className="bg-[#222222] rounded-2xl overflow-hidden border-2 border-gray-800 hover:border-[#8B0000] flex flex-col transition-all hover:shadow-[0_10px_30px_rgba(139,0,0,0.3)] group cursor-pointer relative">
              <Link href="/produto/isca-temperado-250g" className="absolute inset-0 z-10"></Link>
              <div className="h-64 bg-black w-full relative flex items-center justify-center overflow-hidden">
                <Image src="/lure_spiced.png" alt="Isca de Camarão Temperado 250g" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-black mb-3 text-white leading-tight">Isca Camarão Temperado 250g</h3>
                <p className="text-[#FF6B00] text-3xl font-black mb-8 mt-auto tracking-tighter">R$ 22,00</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart({id: 'isca-temperado-250g', name: 'Isca Camarão Temperado 250g', price: 22, priceStr: 'R$ 22,00', image: '/lure_spiced.png'})
                  }}
                  className="relative z-20 w-full block text-center py-3 bg-[#FF6B00] hover:bg-[#e66000] text-white font-black text-base rounded-lg uppercase tracking-wider transition-colors shadow-lg"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/catalogo" 
              className="inline-block px-8 py-4 border-4 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white font-black text-base rounded-lg uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(255,107,0,0.4)]"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SEÇÃO "COMO COMPRAR" */}
      <section className="py-24 bg-[#1a1a1a] border-t border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B0000] opacity-5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Como comprar é <span className="text-[#FF6B00]">simples</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center flex flex-col items-center">
              <div className="text-6xl mb-6 drop-shadow-md">1️⃣</div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-wide text-white">Escolha sua isca no catálogo</h3>
              <p className="text-gray-400 font-bold">Navegue pelas nossas opções de altíssima qualidade.</p>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <div className="text-6xl mb-6 drop-shadow-md">2️⃣</div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-wide text-white">Calcule o frete pelo seu CEP</h3>
              <p className="text-gray-400 font-bold">Insira seu CEP no carrinho para adicionar o frete.</p>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <div className="text-6xl mb-6 drop-shadow-md">3️⃣</div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-wide text-white">Finalize pelo WhatsApp</h3>
              <p className="text-gray-400 font-bold">Escolha a forma de pagamento e feche a compra em segundos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-[#111111] pt-20 pb-10 border-t-4 border-[#FF6B00] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative h-12 w-36 mb-6">
                <Image src="/logo.png" alt="Piratas Fishing Logo" fill className="object-contain object-center md:object-left" />
              </div>
              <p className="text-gray-400 font-bold text-base text-center md:text-left tracking-wide uppercase">
                O Segredo da Fisgada.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-lg font-black text-white mb-6 uppercase tracking-widest border-b-2 border-[#8B0000] pb-2 inline-block">Links Rápidos</h4>
              <ul className="space-y-4 text-center md:text-left w-full">
                <li><Link href="/catalogo" className="text-gray-400 hover:text-[#FF6B00] font-bold text-base transition-colors block">Catálogo</Link></li>
                <li><Link href="/sobre" className="text-gray-400 hover:text-[#FF6B00] font-bold text-base transition-colors block">Sobre</Link></li>
                <li><Link href="/privacidade" className="text-gray-400 hover:text-[#FF6B00] font-bold text-base transition-colors block">Privacidade</Link></li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-lg font-black text-white mb-6 uppercase tracking-widest border-b-2 border-[#8B0000] pb-2 inline-block">Contato</h4>
              <ul className="space-y-4 text-center md:text-left w-full">
                <li>
                  <a href="https://wa.me/?text=Ol%C3%A1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#25D366] font-bold text-base transition-colors flex items-center justify-center md:justify-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-[#E1306C] font-bold text-base transition-colors flex items-center justify-center md:justify-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>Instagram</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">
              © 2026 Piratas Fishing. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante de IA */}
      <a 
        href="#" 
        title="Fale com nossa IA"
        className="fixed bottom-6 right-6 bg-[#FF6B00] text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-[0_4px_15px_rgba(255,107,0,0.5)] hover:scale-110 transition-transform z-50 group"
      >
        🤖
      </a>
    </main>
  );
}
