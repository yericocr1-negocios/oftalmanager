'use client'
import { useState } from 'react'
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
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex items-center gap-3">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
          <div>
            <h2 className="text-base md:text-lg font-semibold">Reportes</h2>
            <p className="text-xs md:text-sm text-gray-400">Resumen de la semana</p>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[
              { label: 'Ingresos semana', value: 'S/ 12,450', color: 'text-green-400', icon: '💰' },
              { label: 'Total ventas', value: '105', color: 'text-blue-400', icon: '🛒' },
              { label: 'Ticket promedio', value: 'S/ 118', color: 'text-purple-400', icon: '🎫' },
              { label: 'Crecimiento', value: '+18%', color: 'text-yellow-400', icon: '📈' },
            ].map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-gray-400">{card.label}</p>
                  <span className="text-base md:text-xl">{card.icon}</span>
                </div>
                <p className={'text-lg md:text-2xl font-bold ' + card.color}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-4 md:mb-6 text-sm md:text-base">Ventas por dia</h3>
              <div className="flex items-end gap-2 md:gap-3 h-32 md:h-40">
                {ventasPorDia.map((v) => (
                  <div key={v.dia} className="flex-1 flex flex-col items-center gap-1 md:gap-2">
                    <p className="text-xs text-gray-400 hidden md:block">S/{v.ventas}</p>
                    <div className="w-full bg-blue-600 rounded-t-md" style={{ height: (v.ventas / maxVenta * 100) + '%' }}></div>
                    <p className="text-xs text-gray-400">{v.dia}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-4 text-sm md:text-base">Ventas por doctor</h3>
              <div className="space-y-3 md:space-y-4">
                {ventasPorDoctor.map((d) => (
                  <div key={d.nombre}>
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span>{d.nombre}</span>
                      <span className="text-green-400">S/ {d.monto.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: (d.monto / 8500 * 100) + '%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
            <h3 className="font-semibold mb-4 text-sm md:text-base">Productos mas rentables</h3>
            <div className="md:hidden space-y-3">
              {ventasPorProducto.map((p) => (
                <div key={p.nombre} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{p.cantidad} unidades</p>
                  </div>
                  <span className="text-green-400 font-bold text-sm">S/ {p.monto.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <table className="w-full hidden md:table">
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