'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getRol } from '../lib/supabase'

const menuCompleto = [
  { icon: '🏠', label: 'Dashboard', href: '/', roles: ['admin', 'doctor', 'vendedor', 'recepcion'] },
  { icon: '👤', label: 'Clientes', href: '/pacientes', roles: ['admin', 'doctor', 'vendedor', 'recepcion'] },
  { icon: '📅', label: 'Agenda', href: '/agenda', roles: ['admin', 'doctor', 'recepcion'] },
  { icon: '💰', label: 'Ventas diarias', href: '/ventas', roles: ['admin', 'vendedor'] },
  { icon: '📊', label: 'Control de ventas', href: '/control-ventas', roles: ['admin', 'vendedor'] },
  { icon: '📦', label: 'Inventario', href: '/inventario', roles: ['admin', 'vendedor'] },
  { icon: '💳', label: 'Finanzas', href: '/finanzas', roles: ['admin'] },
  { icon: '📈', label: 'Reportes', href: '/reportes', roles: ['admin'] },
  { icon: '⚙️', label: 'Config', href: '/configuracion', roles: ['admin'] },
  { icon: '🧾', label: 'Contabilidad', href: '/contabilidad', roles: ['admin'] },
  { icon: '📬', label: 'Envíos', href: '/envios', roles: ['admin'] },
]

export default function Sidebar({ menuAbierto = false, setMenuAbierto = null }: { menuAbierto?: boolean, setMenuAbierto?: any }) {
  const pathname = usePathname()
  const [rol, setRol] = useState<string | null>(null)
  const [menu, setMenu] = useState(menuCompleto)

  useEffect(() => {
    getRol().then(r => {
      setRol(r)
      if (r) {
        setMenu(menuCompleto.filter(item => item.roles.includes(r)))
      }
    })
  }, [])

  const cerrar = () => {
    if (setMenuAbierto) setMenuAbierto(false)
  }

  return (
    <>
      {menuAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden" onClick={cerrar} />
      )}
      <div className={'fixed md:relative z-40 md:z-auto h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ' + (menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-400">OFTALMANAGER</h1>
            <p className="text-xs text-gray-400 mt-1">Sistema de gestion clinica</p>
          </div>
          <button onClick={cerrar} className="md:hidden text-gray-400 hover:text-white text-lg">✕</button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const activo = pathname === item.href
            return (
              <a href={item.href} key={item.label} onClick={cerrar} className={'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ' + (activo ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white')}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>
        {rol && (
          <div className="p-4 border-t border-gray-800">
            <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Tu rol</p>
                <p className="text-sm font-medium capitalize text-blue-400">{rol}</p>
              </div>
              <span className="text-lg">
                {rol === 'admin' ? '👑' : rol === 'doctor' ? '👨‍⚕️' : rol === 'vendedor' ? '💼' : '📋'}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}