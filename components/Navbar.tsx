"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";

export default function Navbar() {
  const { setIsCartOpen, cartItemCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo à esquerda */}
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="relative h-12 w-32 sm:w-40">
                <Image
                  src="/logo.png"
                  alt="Piratas Fishing Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Links Centrais/Direita */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-[#FF6B00] font-bold text-base transition-colors">
                Início
              </Link>
              <Link href="/catalogo" className="text-white hover:text-[#FF6B00] font-bold text-base transition-colors">
                Catálogo
              </Link>
              <Link href="/sobre" className="text-white hover:text-[#FF6B00] font-bold text-base transition-colors">
                Sobre
              </Link>
              <Link href="/contato" className="text-white hover:text-[#FF6B00] font-bold text-base transition-colors">
                Contato
              </Link>
            </div>
          </div>

          {/* Ícone Carrinho */}
          <div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center text-white hover:text-[#FF6B00] transition-colors p-2"
              aria-label="Abrir carrinho"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute 0 top-0 right-0 bg-[#FF6B00] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#1a1a1a]">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
