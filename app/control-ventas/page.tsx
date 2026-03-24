'use client'
import { useState } from 'react'
import Sidebar from '../../components/Sidebar'

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const ventasEjemplo = [
  { id: 1, mes: 'Marzo', cliente: 'OPTICA ESPEJO', ciudad: 'Lima', vendedor: 'Alm', monto: 90, cantidad: 2, facturadoPor: 'Vortex Neg', fecha: '3/2/2026', guia: 'FAC 499', comentarios: 'PAGO 05/02/2026', tipoPago: 'contado', cuotas: 0, fechasPago: [], status: 'verde' },
  { id: 2, mes: 'Marzo', cliente: 'OPTICA MOGOLLON', ciudad: 'Piura', vendedor: 'Alm', monto: 420, cantidad: 8, facturadoPor: 'All In One', fecha: '3/2/2026', guia: 'FAC 246', comentarios: '', tipoPago: 'contado', cuotas: 0, fechasPago: [], status: 'verde' },
  { id: 3, mes: 'Marzo', cliente: 'INTEGRAMED', ciudad: 'Piura', vendedor: '', monto: 2410, cantidad: 38, facturadoPor: 'Corp. Vortex', fecha: '9/2/2026', guia: 'FAC 614', comentarios: '', tipoPago: 'credito', cuotas: 3, fechasPago: ['11/03/2026', '11/04/2026', '11/05/2026'], status: 'naranja' },
  { id: 4, mes: 'Marzo', cliente: 'ALFRED ARROYO CUEVA', ciudad: 'Lima', vendedor: 'Alm', monto: 482, cantidad: 8, facturadoPor: 'Vortex Neg', fecha: '3/2/2026', guia: 'FAC 500', comentarios: 'PAGO 05/02/2026 VIA YAPE', tipoPago: 'contado', cuotas: 0, fechasPago: [], status: 'verde' },
]

const statusColors = {
  verde: 'bg-green-500',
  naranja: 'bg-orange-500',
  rojo: 'bg-red-500',
}

export default function ControlVentas() {
  const [ventas, setVentas] = useState(ventasEjemplo)
  const [filtroMes, setFiltroMes] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [nueva, setNueva] = useState({
    mes: 'Marzo', cliente: '', ciudad: '', vendedor: '', monto: 0,
    cantidad: 1, facturadoPor: '', fecha: '', guia: '', comentarios: '',
    tipoPago: 'contado', cuotas: 0, fechasPago: [], status: 'verde'
  })

  const filtradas = ventas.filter(v => {
    const coincideBusqueda = v.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.vendedor.toLowerCase().includes(busqueda.toLowerCase())
    const coincideMes = filtroMes === 'todos' || v.mes === filtroMes
    return coincideBusqueda && coincideMes
  })

  const totalMonto = filtradas.reduce((sum, v) => sum + v.monto, 0)
  const totalCantidad = filtradas.reduce((sum, v) => sum + v.cantidad, 0)

  const cambiarStatus = (id, status) => {
    setVentas(ventas.map(v => v.id === id ? { ...v, status } : v))
  }

  const editarCampo = (id, campo, valor) => {
    setVentas(ventas.map(v => v.id === id ? { ...v, [campo]: valor } : v))
  }

  const guardarNueva = () => {
    setVentas([...ventas, { ...nueva, id: ventas.length + 1 }])
    setMostrarNueva(false)
    setNueva({ mes: 'Marzo', cliente: '', ciudad: '', vendedor: '', monto: 0, cantidad: 1, facturadoPor: '', fecha: '', guia: '', comentarios: '', tipoPago: 'contado', cuotas: 0, fechasPago: [], status: 'verde' })
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Control de ventas</h2>
            <p className="text-sm text-gray-400">Total: S/ {totalMonto.toLocaleString()} — {totalCantidad} unidades</p>
          </div>
          <button onClick={() => setMostrarNueva(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            + Nueva venta
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-3 mb-4 flex-wrap">
            <input
              type="text"
              placeholder="Buscar cliente, ciudad, vendedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos los meses</option>
              {meses.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Mes</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Cliente</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Ciudad</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Vendedor</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Monto</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Cantidad</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Facturado por</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Fecha venta</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">N° Guia/Factura</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Comentarios</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Tipo pago</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Cuotas</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Fechas pago</th>
                  <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-800 border border-gray-700">
                    <td className="px-2 py-2 border border-gray-700">
                      <select value={v.mes} onChange={(e) => editarCampo(v.id, 'mes', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none">
                        {meses.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <input value={v.cliente} onChange={(e) => editarCampo(v.id, 'cliente', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-32" />
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <input value={v.ciudad} onChange={(e) => editarCampo(v.id, 'ciudad', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-20" />
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <input value={v.vendedor} onChange={(e) => editarCampo(v.id, 'vendedor', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-20" />
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <input type="number" value={v.monto} onChange={(e) => editarCampo(v.id, 'monto', Number(e.target.value))} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-20" />
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <input type="number" value={v.cantidad} onChange={(e) => editarCampo(v.id, 'cantidad', Number(e.target.value))} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-16" />
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <input value={v.facturadoPor} onChange={(e) => editarCampo(v.id, 'facturadoPor', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-24" />
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <input value={v.fecha} onChange={(e) => editarCampo(v.id, 'fecha', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-24" />
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <input value={v.guia} onChange={(e) => editarCampo(v.id, 'guia', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-24" />
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <input value={v.comentarios} onChange={(e) => editarCampo(v.id, 'comentarios', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-40" />
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <select value={v.tipoPago} onChange={(e) => editarCampo(v.id, 'tipoPago', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none">
                        <option value="contado">Contado</option>
                        <option value="credito">Credito</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      {v.tipoPago === 'credito' ? (
                        <input type="number" value={v.cuotas} onChange={(e) => editarCampo(v.id, 'cuotas', Number(e.target.value))} className="bg-transparent text-white text-xs w-12 focus:outline-none" />
                      ) : <span className="text-gray-500 text-xs">-</span>}
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      {v.tipoPago === 'credito' && v.fechasPago.length > 0 ? (
                        <div className="text-xs text-gray-300">{v.fechasPago.join(', ')}</div>
                      ) : <span className="text-gray-500 text-xs">-</span>}
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <select
                        value={v.status}
                        onChange={(e) => cambiarStatus(v.id, e.target.value)}
                        className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' + statusColors[v.status]}
                      >
                        <option value="verde">Verde</option>
                        <option value="naranja">Naranja</option>
                        <option value="rojo">Rojo</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-800 font-bold">
                  <td colSpan={4} className="px-3 py-3 text-sm border border-gray-700">TOTAL</td>
                  <td className="px-3 py-3 text-sm text-green-400 border border-gray-700">S/ {totalMonto.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-blue-400 border border-gray-700">{totalCantidad}</td>
                  <td colSpan={8} className="border border-gray-700"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {mostrarNueva && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-auto py-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva venta</h3>
              <button onClick={() => setMostrarNueva(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Mes</label>
                  <select value={nueva.mes} onChange={(e) => setNueva({...nueva, mes: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    {meses.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, cliente: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Vendedor / Encargado</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, vendedor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" onChange={(e) => setNueva({...nueva, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cantidad</label>
                  <input type="number" defaultValue={1} onChange={(e) => setNueva({...nueva, cantidad: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Facturado por</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, facturadoPor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha de venta</label>
                  <input type="date" onChange={(e) => setNueva({...nueva, fecha: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">N° Guia / Factura</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, guia: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo de pago</label>
                  <select value={nueva.tipoPago} onChange={(e) => setNueva({...nueva, tipoPago: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="contado">Contado</option>
                    <option value="credito">Credito</option>
                  </select>
                </div>
                {nueva.tipoPago === 'credito' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Numero de cuotas</label>
                    <input type="number" min={2} defaultValue={2} onChange={(e) => setNueva({...nueva, cuotas: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Comentarios</label>
                <textarea onChange={(e) => setNueva({...nueva, comentarios: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                <select value={nueva.status} onChange={(e) => setNueva({...nueva, status: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value="verde">Verde</option>
                  <option value="naranja">Naranja</option>
                  <option value="rojo">Rojo</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarNueva(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarNueva} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar venta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
