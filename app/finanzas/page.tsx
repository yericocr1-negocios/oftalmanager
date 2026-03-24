'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase } from '../../lib/supabase'

const SEDE_ID = 'd976f6cb-01f1-4962-a728-1a1012ffc305'

export default function Finanzas() {
  const [tab, setTab] = useState('caja')
  const [movimientos, setMovimientos] = useState([])
  const [cuotas, setCuotas] = useState([])
  const [pagar, setPagar] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarMov, setMostrarMov] = useState(false)
  const [mostrarPagar, setMostrarPagar] = useState(false)
  const [nuevoMov, setNuevoMov] = useState({ cliente: '', concepto: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0 })
  const [nuevoPagar, setNuevoPagar] = useState({ proveedor: '', empresa: '', ruc: '', tipoProveedor: 'laboratorio', producto: '', cantidad: 0, costoUnitario: 0, fechaVencimiento: '', numeroFactura: '' })

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    const { data: cajaDatos } = await supabase
      .from('caja')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(100)
    setMovimientos(cajaDatos || [])

    const { data: cuotasDatos } = await supabase
      .from('cuotas_pago')
      .select('*')
      .order('fecha_vencimiento', { ascending: true })
    setCuotas(cuotasDatos || [])

    setCargando(false)
  }

  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0)
  const egresos = movimientos.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0)
  const totalCuotasPendientes = cuotas.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + c.monto, 0)

  const guardarMov = async () => {
    const { error } = await supabase.from('caja').insert([{
      sede_id: SEDE_ID,
      tipo: nuevoMov.tipo,
      concepto: nuevoMov.concepto,
      monto: nuevoMov.monto,
      metodo_pago: nuevoMov.metodo,
      cliente_nombre: nuevoMov.cliente,
      fecha: new Date().toISOString(),
    }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarMov(false)
    setNuevoMov({ cliente: '', concepto: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0 })
    cargarDatos()
  }

  const marcarCuotaPagada = async (id) => {
    await supabase.from('cuotas_pago').update({ estado: 'pagado' }).eq('id', id)
    cargarDatos()
  }

  const guardarPagar = () => {
    const total = nuevoPagar.cantidad * nuevoPagar.costoUnitario
    setPagar([...pagar, { ...nuevoPagar, id: pagar.length + 1, total, pagado: 0, estado: 'pendiente', fechaCompra: new Date().toISOString().split('T')[0] }])
    setMostrarPagar(false)
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Finanzas</h2>
            <p className="text-sm text-gray-400">Control financiero en tiempo real</p>
          </div>
          <div>
            {tab === 'caja' && <button onClick={() => setMostrarMov(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Nuevo movimiento</button>}
            {tab === 'pagar' && <button onClick={() => setMostrarPagar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Nueva cuenta por pagar</button>}
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Ingresos</p>
              <p className="text-2xl font-bold text-green-400">S/ {ingresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Egresos</p>
              <p className="text-2xl font-bold text-red-400">S/ {egresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Saldo en caja</p>
              <p className="text-2xl font-bold text-blue-400">S/ {(ingresos - egresos).toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Cuotas pendientes</p>
              <p className="text-2xl font-bold text-yellow-400">S/ {totalCuotasPendientes.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            {['caja', 'cuotas', 'pagar'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 rounded-lg text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'caja' ? 'Caja' : t === 'cuotas' ? 'Cuotas por cobrar' : 'Cuentas por pagar'}
              </button>
            ))}
          </div>

          {tab === 'caja' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {cargando ? (
                <div className="text-center text-gray-400 py-12">Cargando movimientos...</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Dia / Hora</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Concepto</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Metodo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No hay movimientos registrados aun</td></tr>
                    ) : movimientos.map((m) => (
                      <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(m.fecha).toLocaleDateString('es-PE')} {new Date(m.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-sm">{m.cliente_nombre || '-'}</td>
                        <td className="px-4 py-3 text-sm">{m.concepto}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 capitalize">{m.metodo_pago || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={'text-xs px-2 py-1 rounded-full ' + (m.tipo === 'ingreso' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400')}>{m.tipo}</span>
                        </td>
                        <td className={'px-4 py-3 text-sm font-bold ' + (m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400')}>
                          {m.tipo === 'ingreso' ? '+' : '-'} S/ {m.monto}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'cuotas' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Cuota</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Monto</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Fecha vencimiento</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Estado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No hay cuotas registradas. Se generan automaticamente al vender en cuotas.</td></tr>
                  ) : cuotas.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium">{c.cliente_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">Cuota {c.numero_cuota}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-400">S/ {c.monto}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.fecha_vencimiento}</td>
                      <td className="px-4 py-3">
                        <span className={'text-xs px-2 py-1 rounded-full ' + (c.estado === 'pagado' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400')}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.estado !== 'pagado' && (
                          <button onClick={() => marcarCuotaPagada(c.id)} className="text-green-400 hover:text-green-300 text-xs">Marcar pagado</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'pagar' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Proveedor</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Producto</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Total</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Pagado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Pendiente</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Vence</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagar.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No hay cuentas por pagar registradas</td></tr>
                  ) : pagar.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium">{c.proveedor}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 capitalize">{c.tipoProveedor}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.producto}</td>
                      <td className="px-4 py-3 text-sm">S/ {c.total}</td>
                      <td className="px-4 py-3 text-sm text-green-400">S/ {c.pagado}</td>
                      <td className="px-4 py-3 text-sm text-yellow-400">S/ {c.total - c.pagado}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{c.fechaVencimiento}</td>
                      <td className="px-4 py-3">
                        <span className={'text-xs px-2 py-1 rounded-full bg-yellow-900 text-yellow-400'}>{c.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {mostrarMov && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo movimiento</h3>
              <button onClick={() => setMostrarMov(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Cliente / Paciente</label>
                <input type="text" value={nuevoMov.cliente} onChange={(e) => setNuevoMov({...nuevoMov, cliente: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Concepto</label>
                <input type="text" value={nuevoMov.concepto} onChange={(e) => setNuevoMov({...nuevoMov, concepto: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
                  <select value={nuevoMov.tipo} onChange={(e) => setNuevoMov({...nuevoMov, tipo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Metodo</label>
                  <select value={nuevoMov.metodo} onChange={(e) => setNuevoMov({...nuevoMov, metodo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" value={nuevoMov.monto} onChange={(e) => setNuevoMov({...nuevoMov, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarMov(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarMov} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarPagar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-auto py-8">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva cuenta por pagar</h3>
              <button onClick={() => setMostrarPagar(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Proveedor</label>
                  <input type="text" onChange={(e) => setNuevoPagar({...nuevoPagar, proveedor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Empresa</label>
                  <input type="text" onChange={(e) => setNuevoPagar({...nuevoPagar, empresa: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">RUC</label>
                  <input type="text" onChange={(e) => setNuevoPagar({...nuevoPagar, ruc: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo de proveedor</label>
                  <select onChange={(e) => setNuevoPagar({...nuevoPagar, tipoProveedor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="laboratorio">Laboratorio</option>
                    <option value="monturas">Monturas</option>
                    <option value="equipos">Equipos medicos</option>
                    <option value="servicios">Servicios</option>
                    <option value="marketing">Marketing</option>
                    <option value="alquiler">Alquiler</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Producto / Servicio</label>
                <input type="text" onChange={(e) => setNuevoPagar({...nuevoPagar, producto: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cantidad</label>
                  <input type="number" onChange={(e) => setNuevoPagar({...nuevoPagar, cantidad: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Costo unitario S/</label>
                  <input type="number" onChange={(e) => setNuevoPagar({...nuevoPagar, costoUnitario: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">N° Factura</label>
                  <input type="text" onChange={(e) => setNuevoPagar({...nuevoPagar, numeroFactura: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fecha vencimiento</label>
                <input type="date" onChange={(e) => setNuevoPagar({...nuevoPagar, fechaVencimiento: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarPagar(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarPagar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}