'use client'
import { usePathname } from 'next/navigation'

const menu = [
  { icon: '🏠', label: 'Dashboard', href: '/' },
  { icon: '👤', label: 'Clientes (pacientes)', href: '/pacientes' },
  { icon: '📅', label: 'Agenda', href: '/agenda' },
  { icon: '💰', label: 'Ventas diarias', href: '/ventas' },
  { icon: '📊', label: 'Control de ventas', href: '/control-ventas' },
  { icon: '📦', label: 'Inventario', href: '/inventario' },
  { icon: '💳', label: 'Finanzas', href: '/finanzas' },
  { icon: '📈', label: 'Reportes', href: '/reportes' },
  { icon: '⚙️', label: 'Config', href: '/configuracion' },
]

export default function Sidebar({ menuAbierto = false, setMenuAbierto = null }: { menuAbierto?: boolean, setMenuAbierto?: any }) {
  const pathname = usePathname()

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
      </div>
    </>
  )
}