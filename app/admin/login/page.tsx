'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { loginAction } from './actions'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Piratas Fishing" width={180} height={60} className="h-16 w-auto object-contain mx-auto mb-4" priority />
          <p className="text-gray-500 text-sm">Painel Administrativo</p>
        </div>

        <form action={formAction} className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Senha de acesso</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full bg-[#0f0f0f] border border-gray-700 focus:border-[#FF6B00] rounded-lg px-4 py-3 text-white outline-none transition-colors"
            />
          </div>

          {state?.error && (
            <p className="text-red-400 text-sm">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-[#FF6B00] hover:bg-[#e05f00] disabled:bg-gray-700 text-white font-black rounded-lg transition-colors"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
