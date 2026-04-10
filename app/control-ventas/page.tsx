'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase, getEmpresaId } from '../../lib/supabase'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const statusColors: Record<string, string> = {
  verde: 'bg-green-500',
  naranja: 'bg-orange-500',
  rojo: 'bg-red-500',
}

export default function ControlVentas() {
  const [ventas, setVentas] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState<string|null>(null)
  const [busquedaClienteTabla, setBusquedaClienteTabla] = useState<Record<string, string>>({})
  const [mostrarDropdownTabla, setMostrarDropdownTabla] = useState<string|null>(null)
  const [busquedaClienteNueva, setBusquedaClienteNueva] = useState('')
  const [clienteNuevaSeleccionado, setClienteNuevaSeleccionado] = useState<any>(null)
  const [mostrarDropdownNueva, setMostrarDropdownNueva] = useState(false)
  const [filtros, setFiltros] = useState({ mes: 'todos', cliente: '', ciudad: '', vendedor: '', tipo_pago: '', status: '' })
  const [nueva, setNueva] = useState({
    mes: meses[new Date().getMonth()], cliente: '', ruc_dni: '', ciudad: '', vendedor: '', monto: 0,
    cantidad: 1, facturado_por: '', fecha_venta: '', guia_factura: '', comentarios: '',
    tipo_pago: 'directo', num_cuotas: 0, fechas_pago: '', status: 'verde',
    precio_costo: 0
  })

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    const eid = await getEmpresaId()
    setEmpresaId(eid)
    cargarDatos(eid)
  }

  const cargarDatos = async (eid: string|null) => {
    setCargando(true)
    const ventasQuery = supabase.from('ventas_especializadas').select('*').order('created_at', { ascending: false })
    if (eid) ventasQuery.eq('empresa_id', eid)
    const { data: ventasData } = await ventasQuery
    setVentas(ventasData || [])

    const clientesQuery = supabase.from('pacientes').select('id, nombres, apellidos, dni, ciudad').order('nombres')
    if (eid) clientesQuery.eq('empresa_id', eid)
    const { data: clientesData } = await clientesQuery
    setClientes(clientesData || [])
    setCargando(false)
  }

  const clientesFiltradosTabla = (texto: string) => clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(texto.toLowerCase()) ||
    (c.dni || '').includes(texto)
  ).slice(0, 5)

  const clientesFiltradosNueva = clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(busquedaClienteNueva.toLowerCase()) ||
    (c.dni || '').includes(busquedaClienteNueva)
  ).slice(0, 5)

  const filtradas = ventas.filter(v => {
    return (
      (filtros.mes === 'todos' || v.mes === filtros.mes) &&
      (filtros.cliente === '' || (v.cliente || '').toLowerCase().includes(filtros.cliente.toLowerCase())) &&
      (filtros.ciudad === '' || (v.ciudad || '').toLowerCase().includes(filtros.ciudad.toLowerCase())) &&
      (filtros.vendedor === '' || (v.vendedor || '').toLowerCase().includes(filtros.vendedor.toLowerCase())) &&
      (filtros.tipo_pago === '' || v.tipo_pago === filtros.tipo_pago) &&
      (filtros.status === '' || v.status === filtros.status) &&
      (busqueda === '' || (v.cliente || '').toLowerCase().includes(busqueda.toLowerCase()) || (v.ciudad || '').toLowerCase().includes(busqueda.toLowerCase()))
    )
  })

  const totalMonto = filtradas.reduce((sum, v) => sum + (v.monto || 0), 0)
  const totalCantidad = filtradas.reduce((sum, v) => sum + (v.cantidad || 0), 0)

  const getPrecioUnitario = (v: any) => v.cantidad > 0 ? v.monto / v.cantidad : 0
  const getMargen = (v: any) => getPrecioUnitario(v) - (v.precio_costo || 0)

  const editarCampo = async (id: string, campo: string, valor: any) => {
    setVentas(ventas.map(v => v.id === id ? { ...v, [campo]: valor } : v))
    await supabase.from('ventas_especializadas').update({ [campo]: valor }).eq('id', id)
  }

  const eliminarVenta = async (id: string) => {
    if (!confirm('¿Eliminar esta venta?')) return
    await supabase.from('ventas_especializadas').delete().eq('id', id)
    setVentas(ventas.filter(v => v.id !== id))
  }

  const seleccionarClienteTabla = (ventaId: string, cliente: any) => {
    const nombre = cliente.nombres + ' ' + cliente.apellidos
    setVentas(ventas.map(v => v.id === ventaId ? { ...v, cliente: nombre, ruc_dni: cliente.dni || '', ciudad: cliente.ciudad || '' } : v))
    supabase.from('ventas_especializadas').update({ cliente: nombre, ruc_dni: cliente.dni || '', ciudad: cliente.ciudad || '' }).eq('id', ventaId)
    setMostrarDropdownTabla(null)
    setBusquedaClienteTabla({})
  }

  const seleccionarClienteNueva = (cliente: any) => {
    setClienteNuevaSeleccionado(cliente)
    setBusquedaClienteNueva('')
    setMostrarDropdownNueva(false)
    setNueva({...nueva, cliente: cliente.nombres + ' ' + cliente.apellidos, ruc_dni: cliente.dni || '', ciudad: cliente.ciudad || ''})
  }

  const guardarNueva = async () => {
    if (!nueva.cliente && !clienteNuevaSeleccionado) { alert('Ingresa el nombre del cliente'); return }
    if (!nueva.monto) { alert('Ingresa el monto'); return }
    if (!empresaId) { alert('Error: no se encontro la empresa'); return }

    const precioUnitario = nueva.cantidad > 0 ? nueva.monto / nueva.cantidad : 0
    const margen = precioUnitario - (nueva.precio_costo || 0)

    const { data, error } = await supabase.from('ventas_especializadas').insert([{
      empresa_id: empresaId,
      ...nueva,
      paciente_id: clienteNuevaSeleccionado ? clienteNuevaSeleccionado.id : null,
      precio_unitario: precioUnitario,
      margen
    }]).select().single()
    if (error) { alert('Error: ' + error.message); return }
    setVentas([data, ...ventas])
    setMostrarNueva(false)
    setClienteNuevaSeleccionado(null)
    setBusquedaClienteNueva('')
    setNueva({ mes: meses[new Date().getMonth()], cliente: '', ruc_dni: '', ciudad: '', vendedor: '', monto: 0, cantidad: 1, facturado_por: '', fecha_venta: '', guia_factura: '', comentarios: '', tipo_pago: 'directo', num_cuotas: 0, fechas_pago: '', status: 'verde', precio_costo: 0 })
  }

  const escapeCSV = (val: any) => {
    const str = String(val === null || val === undefined ? '' : val)
    if (str.includes(';') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"'
    return str
  }

  const descargarCSV = () => {
    const headers = ['Mes','Cliente','RUC/DNI','Ciudad','Vendedor','Monto','Cantidad','Precio Unit.','Costo','Margen','Facturado por','Fecha venta','Guia/Factura','Comentarios','Tipo pago','Cuotas','Fechas pago','Status']
    const rows = filtradas.map(v => [
      v.mes||'', v.cliente||'', v.ruc_dni||'', v.ciudad||'', v.vendedor||'',
      v.monto||0, v.cantidad||0,
      getPrecioUnitario(v).toFixed(2),
      v.precio_costo||0,
      getMargen(v).toFixed(2),
      v.facturado_por||'', v.fecha_venta||'', v.guia_factura||'', v.comentarios||'',
      v.tipo_pago||'', v.num_cuotas||0, v.fechas_pago||'', v.status||''
    ])
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(escapeCSV).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'control-ventas.csv'
    a.click()
  }

  const thClass = "px-3 py-3 text-left text-xs text-gray-400 uppercase border border-gray-700 whitespace-nowrap"

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
            <div>
              <h2 className="text-base md:text-lg font-semibold">Control de ventas</h2>
              <p className="text-xs md:text-sm text-gray-400">S/ {totalMonto.toLocaleString()} — {totalCantidad} uds</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={'px-3 py-2 rounded-lg text-xs md:text-sm ' + (mostrarFiltros ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white')}>🔍</button>
            <button onClick={descargarCSV} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs hidden md:block">⬇</button>
            <button onClick={() => setMostrarNueva(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Nueva</button>
          </div>
        </div>

        {mostrarFiltros && (
          <div className="border-b border-gray-800 px-4 md:px-6 py-4 bg-gray-900">
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
              <select value={filtros.mes} onChange={(e) => setFiltros({...filtros, mes: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none col-span-2 md:col-span-1">
                <option value="todos">Todos los meses</option>
                {meses.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input placeholder="Cliente..." value={filtros.cliente} onChange={(e) => setFiltros({...filtros, cliente: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none" />
              <input placeholder="Ciudad..." value={filtros.ciudad} onChange={(e) => setFiltros({...filtros, ciudad: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none" />
              <input placeholder="Vendedor..." value={filtros.vendedor} onChange={(e) => setFiltros({...filtros, vendedor: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none" />
              <select value={filtros.tipo_pago} onChange={(e) => setFiltros({...filtros, tipo_pago: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none">
                <option value="">Tipo pago</option>
                <option value="directo">Directo</option>
                <option value="credito">Credito</option>
              </select>
              <select value={filtros.status} onChange={(e) => setFiltros({...filtros, status: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none">
                <option value="">Status</option>
                <option value="verde">Verde</option>
                <option value="naranja">Naranja</option>
                <option value="rojo">Rojo</option>
              </select>
              <button onClick={() => setFiltros({ mes: 'todos', cliente: '', ciudad: '', vendedor: '', tipo_pago: '', status: '' })} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs">Limpiar</button>
            </div>
          </div>
        )}

        <div className="p-4 md:p-6 overflow-x-auto">
          {cargando ? (
            <div className="text-center text-gray-400 py-12">Cargando ventas...</div>
          ) : (
            <table className="w-full text-sm border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-800">
                  <th className={thClass}>Mes</th>
                  <th className={thClass}>Cliente</th>
                  <th className={thClass}>RUC/DNI</th>
                  <th className={thClass}>Ciudad</th>
                  <th className={thClass}>Vendedor</th>
                  <th className={thClass}>Monto</th>
                  <th className={thClass}>Cant.</th>
                  <th className={thClass + ' text-blue-400'}>Precio Unit.</th>
                  <th className={thClass + ' text-orange-400'}>Costo</th>
                  <th className={thClass + ' text-green-400'}>Margen</th>
                  <th className={thClass}>Facturado por</th>
                  <th className={thClass}>Fecha</th>
                  <th className={thClass}>Guia/Factura</th>
                  <th className={thClass}>Comentarios</th>
                  <th className={thClass}>Tipo pago</th>
                  <th className={thClass}>Cuotas</th>
                  <th className={thClass}>Fechas pago</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}></th>
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr><td colSpan={19} className="px-4 py-12 text-center text-gray-400 text-sm">No hay ventas registradas</td></tr>
                ) : filtradas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-800 border border-gray-700">
                    <td className="px-2 py-2 border border-gray-700">
                      <select value={v.mes || ''} onChange={(e) => editarCampo(v.id, 'mes', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none">
                        {meses.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2 border border-gray-700 relative">
                      <input
                        value={busquedaClienteTabla[v.id] !== undefined ? busquedaClienteTabla[v.id] : (v.cliente || '')}
                        onChange={(e) => { setBusquedaClienteTabla({...busquedaClienteTabla, [v.id]: e.target.value}); editarCampo(v.id, 'cliente', e.target.value); setMostrarDropdownTabla(v.id) }}
                        onFocus={() => setMostrarDropdownTabla(v.id)}
                        className="bg-transparent text-white text-xs w-full focus:outline-none min-w-32"
                      />
                      {mostrarDropdownTabla === v.id && (busquedaClienteTabla[v.id] || '').length > 0 && (
                        <div className="absolute top-full left-0 bg-gray-800 border border-gray-600 rounded-lg z-20 w-48 max-h-32 overflow-auto">
                          {clientesFiltradosTabla(busquedaClienteTabla[v.id] || '').map((c: any) => (
                            <button key={c.id} onClick={() => seleccionarClienteTabla(v.id, c)} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs">
                              <p>{c.nombres} {c.apellidos}</p>
                              <p className="text-gray-400">{c.dni || '-'}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 border border-gray-700"><input value={v.ruc_dni || ''} onChange={(e) => editarCampo(v.id, 'ruc_dni', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-20" /></td>
                    <td className="px-2 py-2 border border-gray-700"><input value={v.ciudad || ''} onChange={(e) => editarCampo(v.id, 'ciudad', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-20" /></td>
                    <td className="px-2 py-2 border border-gray-700"><input value={v.vendedor || ''} onChange={(e) => editarCampo(v.id, 'vendedor', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-20" /></td>
                    <td className="px-2 py-2 border border-gray-700"><input type="number" value={v.monto || 0} onChange={(e) => editarCampo(v.id, 'monto', Number(e.target.value))} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-16" /></td>
                    <td className="px-2 py-2 border border-gray-700"><input type="number" value={v.cantidad || 0} onChange={(e) => editarCampo(v.id, 'cantidad', Number(e.target.value))} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-12" /></td>

                    {/* PRECIO UNITARIO — calculado automático */}
                    <td className="px-2 py-2 border border-gray-700 text-blue-400 font-bold text-xs whitespace-nowrap">
                      S/ {getPrecioUnitario(v).toFixed(2)}
                    </td>

                    {/* COSTO — editable */}
                    <td className="px-2 py-2 border border-gray-700">
                      <input
                        type="number"
                        value={v.precio_costo || ''}
                        onChange={(e) => editarCampo(v.id, 'precio_costo', Number(e.target.value))}
                        placeholder="0.00"
                        className="bg-transparent text-orange-400 text-xs w-16 focus:outline-none border-b border-gray-700 focus:border-blue-500"
                      />
                    </td>

                    {/* MARGEN — calculado automático */}
                    <td className="px-2 py-2 border border-gray-700 text-xs font-bold whitespace-nowrap">
                      <span className={getMargen(v) >= 0 ? 'text-green-400' : 'text-red-400'}>
                        S/ {getMargen(v).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-2 py-2 border border-gray-700"><input value={v.facturado_por || ''} onChange={(e) => editarCampo(v.id, 'facturado_por', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-24" /></td>
                    <td className="px-2 py-2 border border-gray-700"><input type="date" value={v.fecha_venta || ''} onChange={(e) => editarCampo(v.id, 'fecha_venta', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-28" /></td>
                    <td className="px-2 py-2 border border-gray-700"><input value={v.guia_factura || ''} onChange={(e) => editarCampo(v.id, 'guia_factura', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-24" /></td>
                    <td className="px-2 py-2 border border-gray-700"><input value={v.comentarios || ''} onChange={(e) => editarCampo(v.id, 'comentarios', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-32" /></td>
                    <td className="px-2 py-2 border border-gray-700">
                      <select value={v.tipo_pago || 'directo'} onChange={(e) => editarCampo(v.id, 'tipo_pago', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none">
                        <option value="directo">Directo</option>
                        <option value="credito">Credito</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      {v.tipo_pago === 'credito' ? <input type="number" value={v.num_cuotas || 0} onChange={(e) => editarCampo(v.id, 'num_cuotas', Number(e.target.value))} className="bg-transparent text-white text-xs w-12 focus:outline-none" /> : <span className="text-gray-500 text-xs">-</span>}
                    </td>
                    <td className="px-2 py-2 border border-gray-700"><input value={v.fechas_pago || ''} onChange={(e) => editarCampo(v.id, 'fechas_pago', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none min-w-24" /></td>
                    <td className="px-2 py-2 border border-gray-700">
                      <select value={v.status || 'verde'} onChange={(e) => editarCampo(v.id, 'status', e.target.value)} className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' + statusColors[v.status || 'verde']}>
                        <option value="verde">Verde</option>
                        <option value="naranja">Naranja</option>
                        <option value="rojo">Rojo</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 border border-gray-700">
                      <button onClick={() => eliminarVenta(v.id)} className="text-red-400 hover:text-red-300 text-xs">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-800 font-bold">
                  <td colSpan={5} className="px-3 py-3 text-sm border border-gray-700">TOTAL</td>
                  <td className="px-3 py-3 text-sm text-green-400 border border-gray-700">S/ {totalMonto.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-blue-400 border border-gray-700">{totalCantidad}</td>
                  <td colSpan={12} className="border border-gray-700"></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {mostrarNueva && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva venta especializada</h3>
              <button onClick={() => setMostrarNueva(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Mes</label>
                  <select value={nueva.mes} onChange={(e) => setNueva({...nueva, mes: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    {meses.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar cliente registrado..."
                      value={clienteNuevaSeleccionado ? clienteNuevaSeleccionado.nombres + ' ' + clienteNuevaSeleccionado.apellidos : busquedaClienteNueva}
                      onChange={(e) => { setBusquedaClienteNueva(e.target.value); setClienteNuevaSeleccionado(null); setMostrarDropdownNueva(true); setNueva({...nueva, cliente: e.target.value}) }}
                      onFocus={() => setMostrarDropdownNueva(true)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    {mostrarDropdownNueva && busquedaClienteNueva && (
                      <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-20 max-h-36 overflow-auto">
                        {clientesFiltradosNueva.map((c: any) => (
                          <button key={c.id} onClick={() => seleccionarClienteNueva(c)} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs">
                            <p>{c.nombres} {c.apellidos}</p>
                            <p className="text-gray-400">{c.dni || '-'} — {c.ciudad || '-'}</p>
                          </button>
                        ))}
                        <button onClick={() => setMostrarDropdownNueva(false)} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs text-blue-400 border-t border-gray-700">
                          + Usar "{busquedaClienteNueva}" sin registrar
                        </button>
                      </div>
                    )}
                  </div>
                  {clienteNuevaSeleccionado && (
                    <div className="mt-1 bg-blue-900 rounded px-2 py-1 flex justify-between items-center">
                      <p className="text-xs text-blue-300">{clienteNuevaSeleccionado.nombres} {clienteNuevaSeleccionado.apellidos}</p>
                      <button onClick={() => { setClienteNuevaSeleccionado(null); setNueva({...nueva, cliente: '', ruc_dni: '', ciudad: ''}) }} className="text-blue-400 text-xs">X</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">RUC / DNI</label>
                  <input type="text" value={nueva.ruc_dni} onChange={(e) => setNueva({...nueva, ruc_dni: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" value={nueva.ciudad} onChange={(e) => setNueva({...nueva, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Vendedor</label>
                  <input type="text" value={nueva.vendedor} onChange={(e) => setNueva({...nueva, vendedor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" value={nueva.monto} onChange={(e) => setNueva({...nueva, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cantidad</label>
                  <input type="number" value={nueva.cantidad} onChange={(e) => setNueva({...nueva, cantidad: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Precio costo S/</label>
                  <input type="number" value={nueva.precio_costo} onChange={(e) => setNueva({...nueva, precio_costo: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Precio unitario calculado en tiempo real */}
              {nueva.monto > 0 && nueva.cantidad > 0 && (
                <div className="bg-gray-800 rounded-lg p-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Precio unitario (auto)</p>
                    <p className="text-blue-400 font-bold">S/ {(nueva.monto / nueva.cantidad).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Margen (auto)</p>
                    <p className={(nueva.monto / nueva.cantidad - nueva.precio_costo) >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      S/ {(nueva.monto / nueva.cantidad - nueva.precio_costo).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Facturado por</label>
                  <input type="text" value={nueva.facturado_por} onChange={(e) => setNueva({...nueva, facturado_por: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha venta</label>
                  <input type="date" value={nueva.fecha_venta} onChange={(e) => setNueva({...nueva, fecha_venta: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">N° Guia / Factura</label>
                  <input type="text" value={nueva.guia_factura} onChange={(e) => setNueva({...nueva, guia_factura: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo de pago</label>
                  <select value={nueva.tipo_pago} onChange={(e) => setNueva({...nueva, tipo_pago: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="directo">Directo</option>
                    <option value="credito">Credito</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Status</label>
                  <select value={nueva.status} onChange={(e) => setNueva({...nueva, status: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="verde">Verde</option>
                    <option value="naranja">Naranja</option>
                    <option value="rojo">Rojo</option>
                  </select>
                </div>
                {nueva.tipo_pago === 'credito' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Numero de cuotas</label>
                    <input type="number" min={2} value={nueva.num_cuotas || 2} onChange={(e) => setNueva({...nueva, num_cuotas: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                )}
              </div>
              {nueva.tipo_pago === 'credito' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fechas de pago</label>
                  <input type="text" placeholder="ej: 01/04/2025, 01/05/2025" value={nueva.fechas_pago} onChange={(e) => setNueva({...nueva, fechas_pago: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Comentarios</label>
                <textarea value={nueva.comentarios} onChange={(e) => setNueva({...nueva, comentarios: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-16" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarNueva(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarNueva} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}