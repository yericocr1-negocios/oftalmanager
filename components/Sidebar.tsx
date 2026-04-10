'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getRol, getEmpresaId, supabase } from '../lib/supabase'

const menuCompleto = [
  { icon: '🏠', label: 'Dashboard', href: '/', key: 'dashboard', roles: ['admin','doctor','vendedor','recepcion'] },
  { icon: '👤', label: 'Clientes', href: '/pacientes', key: 'pacientes', roles: ['admin','doctor','vendedor','recepcion'] },
  { icon: '📅', label: 'Agenda', href: '/agenda', key: 'agenda', roles: ['admin','doctor','recepcion'] },
  { icon: '💰', label: 'Ventas diarias', href: '/ventas', key: 'ventas', roles: ['admin','vendedor'] },
  { icon: '📊', label: 'Control de ventas', href: '/control-ventas', key: 'control_ventas', roles: ['admin','vendedor'] },
  { icon: '📦', label: 'Inventario', href: '/inventario', key: 'inventario', roles: ['admin','vendedor'] },
  { icon: '💳', label: 'Finanzas', href: '/finanzas', key: 'finanzas', roles: ['admin'] },
  { icon: '📈', label: 'Reportes', href: '/reportes', key: 'reportes', roles: ['admin'] },
  { icon: '🧾', label: 'Contabilidad', href: '/contabilidad', key: 'contabilidad', roles: ['admin'] },
  { icon: '📬', label: 'Envíos', href: '/envios', key: 'envios', roles: ['admin'] },
  { icon: '🧮', label: 'Tributario', href: '/tributario', key: 'tributario', roles: ['admin'] },
  { icon: '⚙️', label: 'Config', href: '/configuracion', key: 'configuracion', roles: ['admin'] },
]

export default function Sidebar({ menuAbierto = false, setMenuAbierto = null }: { menuAbierto?: boolean, setMenuAbierto?: any }) {
  const pathname = usePathname()
  const [rol, setRol] = useState<string | null>(null)
  const [menu, setMenu] = useState(menuCompleto)
  const [nombreEmpresa, setNombreEmpresa] = useState('')

  useEffect(() => { cargarMenu() }, [])

  const cargarMenu = async () => {
    const r = await getRol()
    setRol(r)
    const eid = await getEmpresaId()
    if (eid) {
      const { data: emp } = await supabase.from('empresas').select('nombre, permisos').eq('id', eid).single()
      if (emp?.nombre) setNombreEmpresa(emp.nombre)
      if (emp?.permisos && r && r !== 'admin' && emp.permisos[r]) {
        const permisosRol: string[] = emp.permisos[r]
        setMenu(menuCompleto.filter(item => permisosRol.includes(item.key)))
        return
      }
    }
    if (r) setMenu(menuCompleto.filter(item => item.roles.includes(r)))
  }

  const cerrar = () => { if (setMenuAbierto) setMenuAbierto(false) }

  const cerrarSesion = async () => {
    const mod = await import('../lib/supabase')
    mod.clearCache()
    await mod.supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {menuAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden" onClick={cerrar} />
      )}
      <div className={'fixed md:relative z-40 md:z-auto h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ' + (menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}>

        <div className="p-5 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👁️</span>
            <div>
              <h1 className="text-lg font-bold text-blue-400">OFTALMANAGER</h1>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-36">{nombreEmpresa || 'Sistema de gestion'}</p>
            </div>
          </div>
          <button onClick={cerrar} className="md:hidden text-gray-400 hover:text-white text-lg">✕</button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {menu.map((item) => {
            const activo = pathname === item.href
            return (
              <a href={item.href} key={item.label} onClick={cerrar} className={'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ' + (activo ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white')}>
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>

        {rol && (
          <div className="p-3 border-t border-gray-800">
            <div className="bg-gray-800 rounded-lg px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Rol activo</p>
                <p className="text-sm font-medium capitalize text-blue-400">{rol}</p>
              </div>
              <span className="text-xl">
                {rol === 'admin' ? '👑' : rol === 'doctor' ? '👨‍⚕️' : rol === 'vendedor' ? '💼' : '📋'}
              </span>
            </div>
            <button onClick={cerrarSesion} className="w-full mt-2 text-xs text-gray-500 hover:text-red-400 py-1 transition-all text-center">
              Cerrar sesión
            </button>
          </div>
        )}

      </div>
    </>
  )
}