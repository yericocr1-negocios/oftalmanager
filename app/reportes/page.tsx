'use client'
import Sidebar from '../../components/Sidebar'

const ventasPorDia = [
  { dia: 'Lun', ventas: 1200 },
  { dia: 'Mar', ventas: 1800 },
  { dia: 'Mie', ventas: 950 },
  { dia: 'Jue', ventas: 2100 },
  { dia: 'Vie', ventas: 2800 },
  { dia: 'Sab', ventas: 3200 },
  { dia: 'Dom', ventas: 400 },
]

const ventasPorDoctor = [
  { nombre: 'Dr. Garcia', ventas: 45, monto: 8500 },
  { nombre: 'Dra. Torres', ventas: 38, monto: 7200 },
  { nombre: 'Dr. Mendoza', ventas: 22, monto: 4100 },
]

const ventasPorProducto = [
  { nombre: 'Luna Antireflex Premium', cantidad: 28, monto: 7840 },
  { nombre: 'Montura Ray-Ban', cantidad: 15, monto: 5250 },
  { nombre: 'Consulta Especializada', cantidad: 42, monto: 5040 },
  { nombre: 'Luna Fotocrom', cantidad: 18, monto: 5760 },
  { nombre: 'Cirugia Catarata', cantidad: 3, monto: 7500 },
]

const maxVenta = Math.max(...ventasPorDia.map(v => v.ventas))

export default function Reportes() {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-8 py-4">
          <h2 className="text-lg font-semibold">Reportes</h2>
          <p className="text-sm text-gray-400">Resumen de la semana</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Ingresos semana', value: 'S/ 12,450', color: 'text-green-400', icon: '💰' },
              { label: 'Total ventas', value: '105', color: 'text-blue-400', icon: '🛒' },
              { label: 'Ticket promedio', value: 'S/ 118', color: 'text-purple-400', icon: '🎫' },
              { label: 'Crecimiento', value: '+18%', color: 'text-yellow-400', icon: '📈' },
            ].map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs text-gray-400">{card.label}</p>
                  <span>{card.icon}</span>
                </div>
                <p className={'text-2xl font-bold ' + card.color}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Ventas por dia</h3>
              <div className="flex items-end gap-3 h-40">
                {ventasPorDia.map((v) => (
                  <div key={v.dia} className="flex-1 flex flex-col items-center gap-2">
                    <p className="text-xs text-gray-400">S/{v.ventas}</p>
                    <div className="w-full bg-blue-600 rounded-t-md" style={{ height: (v.ventas / maxVenta * 100) + '%' }}></div>
                    <p className="text-xs text-gray-400">{v.dia}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Ventas por doctor</h3>
              <div className="space-y-4">
                {ventasPorDoctor.map((d) => (
                  <div key={d.nombre}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{d.nombre}</span>
                      <span className="text-green-400">S/ {d.monto.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: (d.monto / 8500 * 100) + '%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{d.ventas} ventas</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Productos mas rentables</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 text-xs text-gray-400 uppercase">Producto</th>
                  <th className="text-left py-3 text-xs text-gray-400 uppercase">Cantidad</th>
                  <th className="text-left py-3 text-xs text-gray-400 uppercase">Ingresos</th>
                  <th className="text-left py-3 text-xs text-gray-400 uppercase">Participacion</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorProducto.map((p) => (
                  <tr key={p.nombre} className="border-b border-gray-800">
                    <td className="py-3 text-sm">{p.nombre}</td>
                    <td className="py-3 text-sm text-gray-300">{p.cantidad}</td>
                    <td className="py-3 text-sm text-green-400">S/ {p.monto.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: (p.monto / 7840 * 100) + '%' }}></div>
                        </div>
                        <span className="text-xs text-gray-400">{Math.round(p.monto / 7840 * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}