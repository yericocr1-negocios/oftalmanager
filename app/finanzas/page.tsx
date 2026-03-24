'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase } from '../../lib/supabase'

const SEDE_ID = 'd976f6cb-01f1-4962-a728-1a1012ffc305'
const EMPRESA_ID = 'b2711600-fbf7-4f11-b699-8024e36c7cf5'

export default function Finanzas() {
  const [tab, setTab] = useState('caja')
  const [movimientos, setMovimientos] = useState([])
  const [cuotas, setCuotas] = useState([])
  const [cobrar, setCobrar] = useState([])
  const [pagar, setPagar] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarMov, setMostrarMov] = useState(false)
  const [mostrarCobrar, setMostrarCobrar] = useState(false)
  const [mostrarPagar, setMostrarPagar] = useState(false)
  const [nuevoMov, setNuevoMov] = useState({ cliente: '', concepto: '', sucursal: '', numero: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0 })
  const [nuevoCobrar, setNuevoCobrar] = useState({ cliente: '', empresa: '', tipo: 'paciente', dni: '', telefono: '', tipoIngreso: 'consulta', descripcion: '', total: 0, cuotas: 1, fechaVencimiento: '', comprobante: 'boleta' })
  const [nuevoPagar, setNuevoPagar] = useState({ proveedor: '', empresa: '', ruc: '', tipoProveedor: 'laboratorio', producto: '', cantidad: 0, costoUnitario: 0, fechaVencimiento: '', numeroFactura: '' })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)
    const { data: cajaDatos } = await supabase
      .from('caja')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(50)
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

  const estadoColor = {
    pendiente: 'bg-yellow-900 text-yellow-400',
    parcial: 'bg-blue-900 text-blue-400',
    pagado: 'bg-green-900 text-green-400',
    vencido: 'bg-red-900 text-red-400',
  }

  const guardarMov = async () => {
    const ahora = new Date()
    const { error } = await supabase.from('caja').insert([{
      sede_id: SEDE_ID,
      tipo: nuevoMov.tipo,
      concepto: nuevoMov.concepto,
      monto: nuevoMov.monto,
      metodo_pago: nuevoMov.metodo,
      cliente_nombre: nuevoMov.cliente,
      fecha: ahora.toISOString(),
    }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarMov(false)
    setNuevoMov({ cliente: '', concepto: '', sucursal: '', numero: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0 })
    cargarDatos()
  }

  const marcarCuotaPagada = async (id) => {
    await supabase.from('cuotas_pago').update({ estado: 'pagado' }).eq('id', id)
    cargarDatos()
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
            {tab === 'cobrar' && <button onClick={() => setMostrarCobrar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Nueva cuenta por cobrar</button>}
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
            {['caja', 'cuotas', 'cobrar', 'pagar'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 rounded-lg text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'caja' ? 'Caja' : t === 'cuotas' ? 'Cuotas por cobrar' : t === 'cobrar' ? 'Cuentas por cobrar' : 'Cuentas por pagar'}
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
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Sucursal</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">N° Op.</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Metodo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No hay movimientos registrados aun</td></tr>
                    ) : movimientos.map((m) => (
                      <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(m.fecha).toLocaleDateString('es-PE')} {new Date(m.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-4 py-3 text-sm">{m.cliente_nombre || '-'}</td>
                        <td className="px-4 py-3 text-sm">{m.concepto}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">-</td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">-</td>
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
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No hay cuotas registradas</td></tr>
                  ) : cuotas.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm">{c.cliente_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">Cuota {c.numero_cuota}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-400">S/ {c.monto}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.fecha_vencimiento}</td>
                      <td className="px-4 py-3">
                        <span className={'text-xs px-2 py-1 rounded-full ' + (c.estado === 'pagado' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400')}>{c.estado}</span>
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

          {tab === 'cobrar' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="text-center text-gray-400 py-12">Las cuentas por cobrar se generan automaticamente cuando registras una venta en cuotas. Ve a la pestaña Cuotas por cobrar.</p>
            </div>
          )}

          {tab === 'pagar' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="text-center text-gray-400 py-8 text-sm">Proximamente — registro de cuentas por pagar a proveedores</p>
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
    </div>
  )
}