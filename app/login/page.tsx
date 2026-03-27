'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const iniciarSesion = async () => {
    if (!email || !password) { setError('Completa todos los campos'); return }
    setCargando(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })

      if (error) {
        setError('Email o contraseña incorrectos')
        setCargando(false)
        return
      }

      if (data.session) {
        window.location.href = '/'
      }
    } catch (e) {
      setError('Error de conexion. Intenta de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">👁️ OFTALMANAGER</h1>
          <p className="text-gray-400 mt-2 text-sm">Sistema de gestion clinica</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Iniciar sesion</h2>

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                onKeyDown={(e) => e.key === 'Enter' && iniciarSesion()}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={iniciarSesion}
            disabled={cargando}
            className={'w-full mt-6 py-4 rounded-lg font-medium text-white text-base transition-all ' + (cargando ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800')}
          >
            {cargando ? 'Iniciando sesion...' : 'Entrar'}
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            Si olvidaste tu contraseña contacta al administrador
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          OFTALMANAGER v1.0
        </p>
      </div>
    </div>
  )
}