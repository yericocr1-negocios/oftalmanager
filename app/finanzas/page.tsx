'use client'
import { useState } from 'react'

const menu = [
  { icon: '🏠', label: 'Dashboard', href: '/' },
  { icon: '👤', label: 'Pacientes', href: '/pacientes' },
  { icon: '📅', label: 'Agenda', href: '/agenda' },
  { icon: '💰', label: 'Ventas', href: '/ventas' },
  { icon: '📦', label: 'Inventario', href: '/inventario' },
  { icon: '💳', label: 'Finanzas', href: '/finanzas' },
  { icon: '📊', label: 'Reportes', href: '/reportes' },
  { icon: '⚙️', label: 'Config', href: '/configuracion' },
]

const movimientos = [
  { id: 1, tipo: 'ingreso', concepto: 'Venta - Juan Perez', monto: 350, metodo: 'yape', fecha: '2024-01-15 09:30' },
  { id: 2, tipo: 'ingreso', concepto: 'Consulta - Maria Lopez', monto: 120, metodo: 'efectivo', fecha: '2024-01-15 10:15' },
  { id: 3, tipo: 'egreso', concepto: 'Compra monturas proveedor', monto: 800, metodo: 'transferencia', fecha: '2024-01-15 11:00' },
  { id: 4, tipo: 'ingreso', concepto: 'Venta - Carlos Ramirez', monto: 580, metodo: 'tarjeta', fecha: '2024-01-15 12:30' },
  { id: 5, tipo: 'egreso', concepto: 'Pago servicios', monto: 150, metodo: 'efectivo', fecha: '2024-01-15 14:00' },
  { id: 6, tipo: 'ingreso', concepto: 'Cirugia - Ana Flores', monto: 2500, metodo: 'transferencia', fecha: '2024-01-15 15:00' },
]

export default function Finanzas() {
  const [tab, setTab] = useState('caja')

  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0)
  const egresos = movimientos.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0)
  const saldo = ingresos - egresos

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">OFTALMANAGER</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) => (
            <a key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 text-sm">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Finanzas</h2>
            <p className="text-sm text-gray-400">Control de caja y movimientos</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            + Nuevo movimiento
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Ingresos hoy</p>
              <p className="text-2xl font-bold text-green-400">S/ {ingresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Egresos hoy</p>
              <p className="text-2xl font-bold text-red-400">S/ {egresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Saldo en caja</p>
              <p className="text-2xl font-bold text-blue-400">S/ {saldo.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            {['caja', 'por cobrar', 'por pagar'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={'px-4 py-2 rounded-lg text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="font-medium">Movimientos de caja — hoy</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Hora</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Concepto</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Metodo</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Tipo</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Monto</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="px-6 py-4 text-xs text-gray-400">{m.fecha.split(' ')[1]}</td>
                    <td className="px-6 py-4 text-sm">{m.concepto}</td>
                    <td className="px-6 py-4 text-sm text-gray-300 capitalize">{m.metodo}</td>
                    <td className="px-6 py-4">
                      <span className={'text-xs px-2 py-1 rounded-full ' + (m.tipo === 'ingreso' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400')}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className={'px-6 py-4 text-sm font-bold ' + (m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400')}>
                      {m.tipo === 'ingreso' ? '+' : '-'} S/ {m.monto}
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
