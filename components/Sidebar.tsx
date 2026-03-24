'use client'

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

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-blue-400">OFTALMANAGER</h1>
        <p className="text-xs text-gray-400 mt-1">Sistema de gestion clinica</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => (
          
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
