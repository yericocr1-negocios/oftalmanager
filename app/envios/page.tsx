'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase, getEmpresaId } from '../../lib/supabase'

export default function Envios() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [envios, setEnvios] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrar, setMostrar] = useState(false)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [mostrarClientes, setMostrarClientes] = useState(false)
  const [filtros, setFiltros] = useState({ cliente: '', ciudad: '', fecha: '', codigo: '', numero: '', tema: '', empresa_envio: '', monto: '' })
  const [nuevo, setNuevo] = useState({
    ciudad: '', fecha: '', codigo_envio: '', numero_envio: '', tema: '',
    empresa_envio: '', cantidad_paquetes: '', monto: '', comentario: ''
  })

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    const eid = await getEmpresaId()
    setEmpresaId(eid)
    setCargando(true)
    const { data: enviosData } = await supabase.from('envios').select('*').eq('empresa_id', eid).order('fecha', { ascending: false })
    setEnvios(enviosData || [])
    const { data: clientesData } = await supabase.from('pacientes').select('id, nombres, apellidos, ciudad').eq('empresa_id', eid).order('nombres')
    setClientes(clientesData || [])
    setCargando(false)
  }

  const clientesFiltrados = clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(busquedaCliente.toLowerCase())
  )

  const guardar = async () => {
    if (!nuevo.fecha) { alert('La fecha es obligatoria'); return }
    const { error } = await supabase.from('envios').insert([{
      empresa_id: empresaId,
      paciente_id: clienteSeleccionado ? clienteSeleccionado.id : null,
      cliente_nombre: clienteSeleccionado ? clienteSeleccionado.nombres + ' ' + clienteSeleccionado.apellidos : '',
      ciudad: nuevo.ciudad || (clienteSeleccionado?.ciudad || ''),
      fecha: nuevo.fecha,
      codigo_envio: nuevo.codigo_envio,
      numero_envio: nuevo.numero_envio,
      tema: nuevo.tema,
      empresa_envio: nuevo.empresa_envio,
      cantidad_paquetes: parseInt(nuevo.cantidad_paquetes) || 1,
      monto: parseFloat(nuevo.monto) || 0,
      comentario: nuevo.comentario,
    }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrar(false)
    setNuevo({ ciudad: '', fecha: '', codigo_envio: '', numero_envio: '', tema: '', empresa_envio: '', cantidad_paquetes: '', monto: '', comentario: '' })
    setClienteSeleccionado(null)
    setBusquedaCliente('')
    iniciar()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este envío?')) return
    await supabase.from('envios').delete().eq('id', id)
    setEnvios(envios.filter(e => e.id !== id))
  }

  const filtrados = envios.filter(e =>
    (filtros.cliente === '' || (e.cliente_nombre || '').toLowerCase().includes(filtros.cliente.toLowerCase())) &&
    (filtros.ciudad === '' || (e.ciudad || '').toLowerCase().includes(filtros.ciudad.toLowerCase())) &&
    (filtros.fecha === '' || (e.fecha || '').includes(filtros.fecha)) &&
    (filtros.codigo === '' || (e.codigo_envio || '').toLowerCase().includes(filtros.codigo.toLowerCase())) &&
    (filtros.numero === '' || (e.numero_envio || '').toLowerCase().includes(filtros.numero.toLowerCase())) &&
    (filtros.tema === '' || (e.tema || '').toLowerCase().includes(filtros.tema.toLowerCase())) &&
    (filtros.empresa_envio === '' || (e.empresa_envio || '').toLowerCase().includes(filtros.empresa_envio.toLowerCase())) &&
    (filtros.monto === '' || String(e.monto || '').includes(filtros.monto))
  )

  const totalMonto = filtrados.reduce((s, e) => s + (e.monto || 0), 0)
  const totalPaquetes = filtrados.reduce((s, e) => s + (e.cantidad_paquetes || 0), 0)

  const thClass = 'text-left px-3 py-3 text-xs text-gray-400 uppercase whitespace-nowrap border-b border-gray-700'
  const tdClass = 'px-3 py-3 text-sm text-gray-200 whitespace-nowrap'
  const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500'
  const filterClass = 'bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full'

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
            <div>
              <h2 className="text-lg font-semibold">Envíos</h2>
              <p className="text-sm text-gray-400">{filtrados.length} registros — {totalPaquetes} paquetes — S/ {totalMonto.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={'px-3 py-2 rounded-lg text-sm ' + (mostrarFiltros ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white')}>
              🔍 Filtrar
            </button>
            <button onClick={() => setMostrar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Agregar envío</button>
          </div>
        </div>

        {mostrarFiltros && (
          <div className="border-b border-gray-800 px-4 py-3 bg-gray-900 grid grid-cols-2 md:grid-cols-4 gap-2">
            <input placeholder="Cliente..." value={filtros.cliente} onChange={e => setFiltros({...filtros, cliente: e.target.value})} className={filterClass} />
            <input placeholder="Ciudad..." value={filtros.ciudad} onChange={e => setFiltros({...filtros, ciudad: e.target.value})} className={filterClass} />
            <input placeholder="Fecha..." value={filtros.fecha} onChange={e => setFiltros({...filtros, fecha: e.target.value})} className={filterClass} />
            <input placeholder="Código envío..." value={filtros.codigo} onChange={e => setFiltros({...filtros, codigo: e.target.value})} className={filterClass} />
            <input placeholder="Número envío..." value={filtros.numero} onChange={e => setFiltros({...filtros, numero: e.target.value})} className={filterClass} />
            <input placeholder="Tema..." value={filtros.tema} onChange={e => setFiltros({...filtros, tema: e.target.value})} className={filterClass} />
            <input placeholder="Empresa envío..." value={filtros.empresa_envio} onChange={e => setFiltros({...filtros, empresa_envio: e.target.value})} className={filterClass} />
            <input placeholder="Monto..." value={filtros.monto} onChange={e => setFiltros({...filtros, monto: e.target.value})} className={filterClass} />
          </div>
        )}

        <div className="p-4 md:p-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className={thClass}>Cliente</th>
                    <th className={thClass}>Ciudad</th>
                    <th className={thClass}>Fecha</th>
                    <th className={thClass}>Código envío</th>
                    <th className={thClass}>N° envío</th>
                    <th className={thClass}>Tema</th>
                    <th className={thClass}>Empresa envío</th>
                    <th className={thClass}>Paquetes</th>
                    <th className={thClass}>Monto</th>
                    <th className={thClass}>Comentario</th>
                    <th className={thClass}>Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan={11} className="text-center text-gray-400 py-12">Cargando...</td></tr>
                  ) : filtrados.length === 0 ? (
                    <tr><td colSpan={11} className="text-center text-gray-400 py-12">No hay envíos registrados</td></tr>
                  ) : filtrados.map(e => (
                    <tr key={e.id} className="border-t border-gray-800 hover:bg-gray-800">
                      <td className={tdClass + ' font-medium'}>{e.cliente_nombre || '-'}</td>
                      <td className={tdClass}>{e.ciudad || '-'}</td>
                      <td className={tdClass}>{e.fecha}</td>
                      <td className={tdClass}>{e.codigo_envio || '-'}</td>
                      <td className={tdClass}>{e.numero_envio || '-'}</td>
                      <td className={tdClass}>{e.tema || '-'}</td>
                      <td className={tdClass}>{e.empresa_envio || '-'}</td>
                      <td className={tdClass + ' text-blue-400 font-bold text-center'}>{e.cantidad_paquetes}</td>
                      <td className={tdClass + ' text-green-400 font-bold'}>S/ {Number(e.monto || 0).toFixed(2)}</td>
                      <td className={tdClass}>{e.comentario || '-'}</td>
                      <td className={tdClass}>
                        <button onClick={() => eliminar(e.id)} className="text-red-400 hover:text-red-300 text-lg">🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800 border-t border-gray-700">
                    <td colSpan={7} className="px-3 py-3 text-xs text-gray-400 font-bold uppercase">Totales</td>
                    <td className="px-3 py-3 text-sm font-bold text-blue-400">{totalPaquetes}</td>
                    <td className="px-3 py-3 text-sm font-bold text-green-400">S/ {totalMonto.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {mostrar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Agregar envío</h3>
              <button onClick={() => setMostrar(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={clienteSeleccionado ? clienteSeleccionado.nombres + ' ' + clienteSeleccionado.apellidos : busquedaCliente}
                    onChange={e => { setBusquedaCliente(e.target.value); setClienteSeleccionado(null); setMostrarClientes(true) }}
                    onFocus={() => setMostrarClientes(true)}
                    className={inputClass}
                  />
                  {mostrarClientes && busquedaCliente && (
                    <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-10 max-h-40 overflow-auto">
                      {clientesFiltrados.slice(0, 5).map(c => (
                        <button key={c.id} onClick={() => { setClienteSeleccionado(c); setBusquedaCliente(''); setMostrarClientes(false); setNuevo({...nuevo, ciudad: c.ciudad || ''}) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                          {c.nombres} {c.apellidos}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {clienteSeleccionado && (
                  <div className="mt-1 bg-blue-900 rounded px-2 py-1 flex justify-between items-center">
                    <p className="text-xs text-blue-300">{clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</p>
                    <button onClick={() => setClienteSeleccionado(null)} className="text-blue-400 text-xs">X</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" value={nuevo.ciudad} onChange={e => setNuevo({...nuevo, ciudad: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
                  <input type="date" value={nuevo.fecha} onChange={e => setNuevo({...nuevo, fecha: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Código de envío</label>
                  <input type="text" value={nuevo.codigo_envio} onChange={e => setNuevo({...nuevo, codigo_envio: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Número de envío</label>
                  <input type="text" value={nuevo.numero_envio} onChange={e => setNuevo({...nuevo, numero_envio: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tema</label>
                  <input type="text" value={nuevo.tema} onChange={e => setNuevo({...nuevo, tema: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Empresa de envío</label>
                  <input type="text" value={nuevo.empresa_envio} onChange={e => setNuevo({...nuevo, empresa_envio: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cantidad de paquetes</label>
                  <input type="text" value={nuevo.cantidad_paquetes} onChange={e => setNuevo({...nuevo, cantidad_paquetes: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="text" value={nuevo.monto} onChange={e => setNuevo({...nuevo, monto: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Comentario</label>
                <textarea value={nuevo.comentario} onChange={e => setNuevo({...nuevo, comentario: e.target.value})} className={inputClass + ' h-16'} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrar(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar envío</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}