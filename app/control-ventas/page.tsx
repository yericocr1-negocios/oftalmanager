'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase } from '../../lib/supabase'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const statusColors = {
  verde: 'bg-green-500',
  naranja: 'bg-orange-500',
  rojo: 'bg-red-500',
}

export default function ControlVentas() {
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [busquedaCliente, setBusquedaCliente] = useState({})
  const [mostrarDropdown, setMostrarDropdown] = useState(null)
  const [filtros, setFiltros] = useState({
    mes: 'todos', cliente: '', ruc_dni: '', ciudad: '', vendedor: '',
    monto: '', cantidad: '', facturado_por: '', fecha_venta: '',
    guia_factura: '', comentarios: '', tipo_pago: '', status: ''
  })
  const [nueva, setNueva] = useState({
    mes: 'Marzo', cliente: '', ruc_dni: '', ciudad: '', vendedor: '', monto: 0,
    cantidad: 1, facturado_por: '', fecha_venta: '', guia_factura: '', comentarios: '',
    tipo_pago: 'directo', num_cuotas: 0, fechas_pago: '', status: 'verde'
  })

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    const { data: ventasData } = await supabase.from('ventas_especializadas').select('*').order('created_at', { ascending: false })
    setVentas(ventasData || [])
    const { data: clientesData } = await supabase.from('pacientes').select('id, nombres, apellidos, dni, ciudad').order('nombres')
    setClientes(clientesData || [])
    setCargando(false)
  }

  const clientesFiltrados = (texto) => clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(texto.toLowerCase()) ||
    (c.dni || '').includes(texto)
  ).slice(0, 5)

  const filtradas = ventas.filter(v => {
    return (
      (filtros.mes === 'todos' || v.mes === filtros.mes) &&
      (filtros.cliente === '' || (v.cliente || '').toLowerCase().includes(filtros.cliente.toLowerCase())) &&
      (filtros.ruc_dni === '' || (v.ruc_dni || '').includes(filtros.ruc_dni)) &&
      (filtros.ciudad === '' || (v.ciudad || '').toLowerCase().includes(filtros.ciudad.toLowerCase())) &&
      (filtros.vendedor === '' || (v.vendedor || '').toLowerCase().includes(filtros.vendedor.toLowerCase())) &&
      (filtros.monto === '' || String(v.monto || '').includes(filtros.monto)) &&
      (filtros.cantidad === '' || String(v.cantidad || '').includes(filtros.cantidad)) &&
      (filtros.facturado_por === '' || (v.facturado_por || '').toLowerCase().includes(filtros.facturado_por.toLowerCase())) &&
      (filtros.fecha_venta === '' || (v.fecha_venta || '').includes(filtros.fecha_venta)) &&
      (filtros.guia_factura === '' || (v.guia_factura || '').toLowerCase().includes(filtros.guia_factura.toLowerCase())) &&
      (filtros.comentarios === '' || (v.comentarios || '').toLowerCase().includes(filtros.comentarios.toLowerCase())) &&
      (filtros.tipo_pago === '' || v.tipo_pago === filtros.tipo_pago) &&
      (filtros.status === '' || v.status === filtros.status)
    )
  })

  const totalMonto = filtradas.reduce((sum, v) => sum + (v.monto || 0), 0)
  const totalCantidad = filtradas.reduce((sum, v) => sum + (v.cantidad || 0), 0)

  const limpiarFiltros = () => setFiltros({
    mes: 'todos', cliente: '', ruc_dni: '', ciudad: '', vendedor: '',
    monto: '', cantidad: '', facturado_por: '', fecha_venta: '',
    guia_factura: '', comentarios: '', tipo_pago: '', status: ''
  })

  const editarCampo = async (id, campo, valor) => {
    setVentas(ventas.map(v => v.id === id ? { ...v, [campo]: valor } : v))
    await supabase.from('ventas_especializadas').update({ [campo]: valor }).eq('id', id)
  }

  const seleccionarCliente = (ventaId, cliente) => {
    const nombre = cliente.nombres + ' ' + cliente.apellidos
    setVentas(ventas.map(v => v.id === ventaId ? { ...v, cliente: nombre, ruc_dni: cliente.dni || '', ciudad: cliente.ciudad || '' } : v))
    supabase.from('ventas_especializadas').update({ cliente: nombre, ruc_dni: cliente.dni || '', ciudad: cliente.ciudad || '' }).eq('id', ventaId)
    setMostrarDropdown(null)
    setBusquedaCliente({})
  }

  const guardarNueva = async () => {
    const { data, error } = await supabase.from('ventas_especializadas').insert([{ empresa_id: 'b2711600-fbf7-4f11-b699-8024e36c7cf5', ...nueva }]).select().single()
    if (error) { alert('Error: ' + error.message); return }
    setVentas([data, ...ventas])
    setMostrarNueva(false)
    setNueva({ mes: 'Marzo', cliente: '', ruc_dni: '', ciudad: '', vendedor: '', monto: 0, cantidad: 1, facturado_por: '', fecha_venta: '', guia_factura: '', comentarios: '', tipo_pago: 'directo', num_cuotas: 0, fechas_pago: '', status: 'verde' })
  }

  const escapeCSV = (val) => {
    const str = String(val === null || val === undefined ? '' : val)
    if (str.includes(';') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"'
    return str
  }

  const descargarCSV = () => {
    const headers = ['Mes','Cliente','RUC/DNI','Ciudad','Vendedor','Monto','Cantidad','Facturado por','Fecha venta','Guia/Factura','Comentarios','Tipo pago','Cuotas','Fechas pago','Status']
    const rows = filtradas.map(v => [
      v.mes || '', v.cliente || '', v.ruc_dni || '', v.ciudad || '', v.vendedor || '',
      v.monto || 0, v.cantidad || 0, v.facturado_por || '', v.fecha_venta || '',
      v.guia_factura || '', v.comentarios || '', v.tipo_pago || '',
      v.num_cuotas || 0, v.fechas_pago || '', v.status || ''
    ])
    const totalRow = ['TOTAL', '', '', '', '', totalMonto, totalCantidad, '', '', '', '', '', '', '', '']
    const csv = '\uFEFF' + [headers, ...rows, totalRow].map(r => r.map(escapeCSV).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'control-ventas.csv'
    a.click()
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
          <div className="flex gap-3">
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={'px-4 py-2 rounded-lg text-sm ' + (mostrarFiltros ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white')}>
              🔍 Filtrar
            </button>
            <button onClick={descargarCSV} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
              ⬇ Descargar
            </button>
            <button onClick={() => setMostrarNueva(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              + Nueva venta
            </button>
          </div>
        </div>

        {mostrarFiltros && (
          <div className="border-b border-gray-800 px-6 py-4 bg-gray-900">
            <div className="grid grid-cols-7 gap-2 mb-2">
              <select value={filtros.mes} onChange={(e) => setFiltros({...filtros, mes: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="todos">Todos los meses</option>
                {meses.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input placeholder="Cliente..." value={filtros.cliente} onChange={(e) => setFiltros({...filtros, cliente: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="RUC/DNI..." value={filtros.ruc_dni} onChange={(e) => setFiltros({...filtros, ruc_dni: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="Ciudad..." value={filtros.ciudad} onChange={(e) => setFiltros({...filtros, ciudad: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="Vendedor..." value={filtros.vendedor} onChange={(e) => setFiltros({...filtros, vendedor: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="Monto..." value={filtros.monto} onChange={(e) => setFiltros({...filtros, monto: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="Facturado por..." value={filtros.facturado_por} onChange={(e) => setFiltros({...filtros, facturado_por: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-7 gap-2">
              <input type="date" value={filtros.fecha_venta} onChange={(e) => setFiltros({...filtros, fecha_venta: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="Guia/Factura..." value={filtros.guia_factura} onChange={(e) => setFiltros({...filtros, guia_factura: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="Comentarios..." value={filtros.comentarios} onChange={(e) => setFiltros({...filtros, comentarios: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <select value={filtros.tipo_pago} onChange={(e) => setFiltros({...filtros, tipo_pago: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="">Tipo de pago</option>
                <option value="directo">Directo</option>
                <option value="credito">Credito</option>
              </select>
              <select value={filtros.status} onChange={(e) => setFiltros({...filtros, status: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="">Todos los status</option>
                <option value="verde">Verde</option>
                <option value="naranja">Naranja</option>
                <option value="rojo">Rojo</option>
              </select>
              <div className="col-span-2 flex justify-end">
                <button onClick={limpiarFiltros} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs">Limpiar filtros</button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {cargando ? (
            <div className="text-center text-gray-400 py-12">Cargando ventas...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Mes</th>
                    <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">Cliente</th>
                    <th className="px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap">RUC/DNI</th>
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
                  {filtradas.length === 0 ? (
                    <tr><td colSpan={15} className="px-4 py-12 text-center text-gray-400 text-sm">No hay ventas registradas</td></tr>
                  ) : filtradas.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-800 border border-gray-700">
                      <td className="px-2 py-2 border border-gray-700">
                        <select value={v.mes || ''} onChange={(e) => editarCampo(v.id, 'mes', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none">
                          {meses.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2 border border-gray-700 relative">
                        <input
                          value={busquedaCliente[v.id] !== undefined ? busquedaCliente[v.id] : (v.cliente || '')}
                          onChange={(e) => { setBusquedaCliente({...busquedaCliente, [v.id]: e.target.value}); editarCampo(v.id, 'cliente', e.target.value); setMostrarDropdown(v.id) }}
                          onFocus={() => setMostrarDropdown(v.id)}
                          className="bg-transparent text-white text-xs w-full focus:outline-none min-w-32"
                        />
                        {mostrarDropdown === v.id && (busquedaCliente[v.id] || '').length > 0 && (
                          <div className="absolute top-full left-0 bg-gray-800 border border-gray-600 rounded-lg z-20 w-48 max-h-32 overflow-auto">
                            {clientesFiltrados(busquedaCliente[v.id] || '').map(c => (
                              <button key={c.id} onClick={() => seleccionarCliente(v.id, c)} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs">
                                <p>{c.nombres} {c.apellidos}</p>
                                <p className="text-gray-400">{c.dni || '-'}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input value={v.ruc_dni || ''} onChange={(e) => editarCampo(v.id, 'ruc_dni', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-24" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input value={v.ciudad || ''} onChange={(e) => editarCampo(v.id, 'ciudad', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-20" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input value={v.vendedor || ''} onChange={(e) => editarCampo(v.id, 'vendedor', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-20" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input type="number" value={v.monto || 0} onChange={(e) => editarCampo(v.id, 'monto', Number(e.target.value))} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-20" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input type="number" value={v.cantidad || 0} onChange={(e) => editarCampo(v.id, 'cantidad', Number(e.target.value))} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-16" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input value={v.facturado_por || ''} onChange={(e) => editarCampo(v.id, 'facturado_por', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-24" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input type="date" value={v.fecha_venta || ''} onChange={(e) => editarCampo(v.id, 'fecha_venta', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-28" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input value={v.guia_factura || ''} onChange={(e) => editarCampo(v.id, 'guia_factura', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-24" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input value={v.comentarios || ''} onChange={(e) => editarCampo(v.id, 'comentarios', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-40" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <select value={v.tipo_pago || 'directo'} onChange={(e) => editarCampo(v.id, 'tipo_pago', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none">
                          <option value="directo">Directo</option>
                          <option value="credito">Credito</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        {v.tipo_pago === 'credito' ? (
                          <input type="number" value={v.num_cuotas || 0} onChange={(e) => editarCampo(v.id, 'num_cuotas', Number(e.target.value))} className="bg-transparent text-white text-xs w-12 focus:outline-none" />
                        ) : <span className="text-gray-500 text-xs">-</span>}
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <input value={v.fechas_pago || ''} onChange={(e) => editarCampo(v.id, 'fechas_pago', e.target.value)} placeholder="ej: 01/04, 01/05" className="bg-transparent text-white text-xs w-full focus:outline-none min-w-32" />
                      </td>
                      <td className="px-2 py-2 border border-gray-700">
                        <select value={v.status || 'verde'} onChange={(e) => editarCampo(v.id, 'status', e.target.value)} className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' + statusColors[v.status || 'verde']}>
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
                    <td colSpan={5} className="px-3 py-3 text-sm border border-gray-700">TOTAL</td>
                    <td className="px-3 py-3 text-sm text-green-400 border border-gray-700">S/ {totalMonto.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-blue-400 border border-gray-700">{totalCantidad}</td>
                    <td colSpan={8} className="border border-gray-700"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
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
                  <label className="text-xs text-gray-400 mb-1 block">RUC / DNI</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, ruc_dni: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Vendedor</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, vendedor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" onChange={(e) => setNueva({...nueva, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cantidad</label>
                  <input type="number" defaultValue={1} onChange={(e) => setNueva({...nueva, cantidad: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Facturado por</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, facturado_por: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha venta</label>
                  <input type="date" onChange={(e) => setNueva({...nueva, fecha_venta: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">N° Guia / Factura</label>
                  <input type="text" onChange={(e) => setNueva({...nueva, guia_factura: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo de pago</label>
                  <select value={nueva.tipo_pago} onChange={(e) => setNueva({...nueva, tipo_pago: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="directo">Directo</option>
                    <option value="credito">Credito</option>
                  </select>
                </div>
              </div>
              {nueva.tipo_pago === 'credito' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Numero de cuotas</label>
                    <input type="number" min={2} onChange={(e) => setNueva({...nueva, num_cuotas: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Fechas de pago</label>
                    <input type="text" placeholder="ej: 01/04, 01/05" onChange={(e) => setNueva({...nueva, fechas_pago: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              )}
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