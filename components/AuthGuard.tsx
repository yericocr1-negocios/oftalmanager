'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [verificando, setVerificando] = useState(true)
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    verificarSesion()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setAutenticado(false)
        window.location.href = '/login'
      } else if (session) {
        setAutenticado(true)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const verificarSesion = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/login'
      return
    }
    setAutenticado(true)
    setVerificando(false)
  }

  if (verificando) {
    return (
      <div className="flex h-screen bg-gray-950 items-center justify-center">
        <div className="text-center">
          <p className="text-3xl mb-4">👁️</p>
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!autenticado) return null

  return <>{children}</>
}