export default function Home() {
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

  const cards = [
    { label: 'Ventas hoy', value: 'S/ 0', icon: '💰', color: 'text-green-400' },
    { label: 'Ingresos del mes', value: 'S/ 0', icon: '📈', color: 'text-blue-400' },
    { label: 'Citas hoy', value: '0', icon: '📅', color: 'text-purple-400' },
    { label: 'Clientes nuevos', value: '0', icon: '👤', color: 'text-orange-400' },
  ]

  const accesos = [
    { label: 'Nuevo cliente', href: '/pacientes', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Nueva cita', href: '/agenda', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Nueva venta', href: '/ventas', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Nueva consulta', href: '/consulta', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: 'Control ventas', href: '/control-ventas', color: 'bg-pink-600 hover:bg-pink-700' },
  ]

  const resumen = [
    { label: 'Citas programadas', value: '0', color: 'text-blue-400' },
    { label: 'Consultas realizadas', value: '0', color: 'text-green-400' },
    { label: 'Ventas completadas', value: '0', color: 'text-yellow-400' },
    { label: 'Ingresos del dia', value: 'S/ 0', color: 'text-purple-400' },
  ]

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">OFTALMANAGER</h1>
          <p className="text-xs text-gray-400 mt-1">Sistema de gestion clinica</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) => {
            return (
              <a href={item.href} key={item.label} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-sm text-gray-400">Bienvenido a OFTALMANAGER</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">A</div>
            <span className="text-sm text-gray-300">Admin</span>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-4 gap-4 mb-8">
            {cards.map((card) => {
              return (
                <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-sm text-gray-400">{card.label}</p>
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  <p className={'text-2xl font-bold ' + card.color}>{card.value}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Accesos rapidos</h3>
              <div className="grid grid-cols-2 gap-3">
                {accesos.map((btn) => {
                  return (
                    <a key={btn.label} href={btn.href} className={'text-white text-sm px-4 py-3 rounded-lg text-center transition-all ' + btn.color}>
                      {btn.label}
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Resumen del dia</h3>
              <div className="space-y-3">
                {resumen.map((item) => {
                  return (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <span className={'font-bold ' + item.color}>{item.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Ultimas ventas</h3>
              <div className="text-center text-gray-500 py-8 text-sm">
                No hay ventas registradas aun
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Proximas citas</h3>
              <div className="text-center text-gray-500 py-8 text-sm">
                No hay citas programadas aun
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}