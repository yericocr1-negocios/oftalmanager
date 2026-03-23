export default function Home() {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">👁 OFTALMANAGER</h1>
          <p className="text-xs text-gray-400 mt-1">Sistema de gestión clínica</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: '🏠', label: 'Dashboard' },
            { icon: '👤', label: 'Pacientes' },
            { icon: '📅', label: 'Agenda' },
            { icon: '💰', label: 'Ventas' },
            { icon: '📦', label: 'Inventario' },
            { icon: '💳', label: 'Finanzas' },
            { icon: '📊', label: 'Reportes' },
            { icon: '⚙️', label: 'Configuración' },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-auto">
        
        {/* HEADER */}
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

          {/* CARDS KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Ventas hoy', value: 'S/ 0', icon: '💰', color: 'text-green-400' },
              { label: 'Ingresos del mes', value: 'S/ 0', icon: '📈', color: 'text-blue-400' },
              { label: 'Citas hoy', value: '0', icon: '📅', color: 'text-purple-400' },
              { label: 'Pacientes nuevos', value: '0', icon: '👤', color: 'text-orange-400' },
            ].map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <span className="text-xl">{card.icon}</span>
                </div>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* TABLAS */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Últimas ventas */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Últimas ventas</h3>
              <div className="text-center text-gray-500 py-8 text-sm">
                No hay ventas registradas aún
              </div>
            </div>

            {/* Próximas citas */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Próximas citas</h3>
              <div className="text-center text-gray-500 py-8 text-sm">
                No hay citas programadas aún
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}