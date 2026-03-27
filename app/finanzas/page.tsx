'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase, getEmpresaId, getSedeId } from '../../lib/supabase'

const statusPagarColors = {
  pendiente: 'bg-yellow-600',
  parcial: 'bg-blue-600',
  pagado: 'bg-green-600',
  vencido: 'bg-red-600',
}

export default function Finanzas() {
  const [tab, setTab] = useState('caja')
  const [movimientos, setMovimientos] = useState([])
  const [cuotas, setCuotas] = useState([])
  const [pagar, setPagar] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarMov, setMostrarMov] = useState(false)
  const [mostrarPagar, setMostrarPagar] = useState(false)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState(null)
  const [sedeId, setSedeId] = useState(null)
  const [filtroCaja, setFiltroCaja] = useState({ cliente: '', concepto: '', metodo: '', tipo: '', monto: '' })
  const [filtroCuotas, setFiltroCuotas] = useState({ cliente: '', estado: '' })
  const [filtroPagar, setFiltroPagar] = useState({ proveedor: '', tipo: '', producto: '', estado: '' })
  const [nuevoMov, setNuevoMov] = useState({ cliente: '', concepto: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0 })
  const [nuevoPagar, setNuevoPagar] = useState({ proveedor: '', tipoProveedor: '', fecha_venta: '', producto: '', total: 0, pagado: 0, pendiente: 0, fecha_vencimiento: '', estado: 'pendiente' })

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    const eid = await getEmpresaId()
    const sid = await getSedeId()
    setEmpresaId(eid)
    setSedeId(sid)
    cargarDatos(eid, sid)
  }

  const cargarDatos = async (eid, sid) => {
    setCargando(true)
    const cajaQuery = supabase.from('caja').select('*').order('fecha', { ascending: false }).limit(100)
    if (sid) cajaQuery.eq('sede_id', sid)
    const { data: cajaDatos } = await cajaQuery
    setMovimientos(cajaDatos || [])

    const cuotasQuery = supabase.from('cuotas_pago').select('*').order('fecha_vencimiento', { ascending: true })
    if (eid) cuotasQuery.eq('empresa_id', eid)
    const { data: cuotasDatos } = await cuotasQuery
    setCuotas(cuotasDatos || [])

    setCargando(false)
  }

  const movimientosFiltrados = movimientos.filter(m =>
    (filtroCaja.cliente === '' || (m.cliente_nombre || '').toLowerCase().includes(filtroCaja.cliente.toLowerCase())) &&
    (filtroCaja.concepto === '' || (m.concepto || '').toLowerCase().includes(filtroCaja.concepto.toLowerCase())) &&
    (filtroCaja.metodo === '' || (m.metodo_pago || '') === filtroCaja.metodo) &&
    (filtroCaja.tipo === '' || (m.tipo || '') === filtroCaja.tipo) &&
    (filtroCaja.monto === '' || String(m.monto).includes(filtroCaja.monto))
  )

  const cuotasFiltradas = cuotas.filter(c =>
    (filtroCuotas.cliente === '' || (c.cliente_nombre || '').toLowerCase().includes(filtroCuotas.cliente.toLowerCase())) &&
    (filtroCuotas.estado === '' || c.estado === filtroCuotas.estado)
  )

  const pagarFiltrados = pagar.filter(p =>
    (filtroPagar.proveedor === '' || (p.proveedor || '').toLowerCase().includes(filtroPagar.proveedor.toLowerCase())) &&
    (filtroPagar.tipo === '' || (p.tipoProveedor || '').toLowerCase().includes(filtroPagar.tipo.toLowerCase())) &&
    (filtroPagar.producto === '' || (p.producto || '').toLowerCase().includes(filtroPagar.producto.toLowerCase())) &&
    (filtroPagar.estado === '' || p.estado === filtroPagar.estado)
  )

  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0)
  const egresos = movimientos.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0)
  const totalCuotasPendientes = cuotas.filter(c => c.estado === 'pendiente').reduce((sum, c) => sum + c.monto, 0)

  const guardarMov = async () => {
    const { error } = await supabase.from('caja').insert([{
      sede_id: sedeId, tipo: nuevoMov.tipo, concepto: nuevoMov.concepto,
      monto: nuevoMov.monto, metodo_pago: nuevoMov.metodo,
      cliente_nombre: nuevoMov.cliente, fecha: new Date().toISOString(),
    }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarMov(false)
    setNuevoMov({ cliente: '', concepto: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0 })
    cargarDatos(empresaId, sedeId)
  }

  const marcarCuotaPagada = async (id) => {
    await supabase.from('cuotas_pago').update({ estado: 'pagado' }).eq('id', id)
    cargarDatos(empresaId, sedeId)
  }

  const guardarPagar = () => {
    const pendiente = nuevoPagar.total - nuevoPagar.pagado
    setPagar([...pagar, { ...nuevoPagar, id: pagar.length + 1, pendiente }])
    setMostrarPagar(false)
    setNuevoPagar({ proveedor: '', tipoProveedor: '', fecha_venta: '', producto: '', total: 0, pagado: 0, pendiente: 0, fecha_vencimiento: '', estado: 'pendiente' })
  }

  const editarPagar = (id, campo, valor) => {
    setPagar(pagar.map(p => {
      if (p.id !== id) return p
      const updated = { ...p, [campo]: valor }
      if (campo === 'total' || campo === 'pagado') {
        updated.pendiente = (campo === 'total' ? Number(valor) : p.total) - (campo === 'pagado' ? Number(valor) : p.pagado)
      }
      return updated
    }))
  }

  const escapeCSV = (val) => {
    const str = String(val === null || val === undefined ? '' : val)
    if (str.includes(';') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"'
    return str
  }

  const descargar = () => {
    let headers, rows, filename
    if (tab === 'caja') {
      headers = ['Fecha', 'Hora', 'Cliente', 'Concepto', 'Metodo', 'Tipo', 'Monto']
      rows = movimientosFiltrados.map(m => [new Date(m.fecha).toLocaleDateString('es-PE'), new Date(m.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }), m.cliente_nombre || '', m.concepto || '', m.metodo_pago || '', m.tipo || '', m.monto || 0])
      rows.push(['', '', '', '', 'INGRESOS', '', ingresos])
      rows.push(['', '', '', '', 'EGRESOS', '', egresos])
      rows.push(['', '', '', '', 'SALDO', '', ingresos - egresos])
      filename = 'caja.csv'
    } else if (tab === 'cuotas') {
      headers = ['Cliente', 'Cuota', 'Monto', 'Vencimiento', 'Estado']
      rows = cuotasFiltradas.map(c => [c.cliente_nombre || '', 'Cuota ' + c.numero_cuota, c.monto || 0, c.fecha_vencimiento || '', c.estado || ''])
      filename = 'cuotas.csv'
    } else {
      headers = ['Proveedor', 'Tipo', 'Fecha venta', 'Producto', 'Total', 'Pagado', 'Pendiente', 'Vence', 'Estado']
      rows = pagarFiltrados.map(p => [p.proveedor || '', p.tipoProveedor || '', p.fecha_venta || '', p.producto || '', p.total || 0, p.pagado || 0, p.pendiente || 0, p.fecha_vencimiento || '', p.estado || ''])
      filename = 'cuentas-pagar.csv'
    }
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(escapeCSV).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
            <div>
              <h2 className="text-lg font-semibold">Finanzas</h2>
              <p className="text-sm text-gray-400">Control financiero en tiempo real</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={'px-3 md:px-4 py-2 rounded-lg text-sm ' + (mostrarFiltros ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white')}>🔍</button>
            <button onClick={descargar} className="bg-gray-700 hover:bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm hidden md:block">⬇ Descargar</button>
            {tab === 'caja' && <button onClick={() => setMostrarMov(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Movimiento</button>}
            {tab === 'pagar' && <button onClick={() => setMostrarPagar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Cuenta</button>}
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5">
              <p className="text-xs text-gray-400 mb-1">Ingresos</p>
              <p className="text-xl md:text-2xl font-bold text-green-400">S/ {ingresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5">
              <p className="text-xs text-gray-400 mb-1">Egresos</p>
              <p className="text-xl md:text-2xl font-bold text-red-400">S/ {egresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5">
              <p className="text-xs text-gray-400 mb-1">Saldo en caja</p>
              <p className="text-xl md:text-2xl font-bold text-blue-400">S/ {(ingresos - egresos).toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5">
              <p className="text-xs text-gray-400 mb-1">Cuotas pendientes</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-400">S/ {totalCuotasPendientes.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3 mb-4">
            {['caja', 'cuotas', 'pagar'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'caja' ? 'Caja' : t === 'cuotas' ? 'Cuotas por cobrar' : 'Cuentas por pagar'}
              </button>
            ))}
          </div>

          {mostrarFiltros && tab === 'caja' && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              <input placeholder="Cliente..." value={filtroCaja.cliente} onChange={(e) => setFiltroCaja({...filtroCaja, cliente: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="Concepto..." value={filtroCaja.concepto} onChange={(e) => setFiltroCaja({...filtroCaja, concepto: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <select value={filtroCaja.metodo} onChange={(e) => setFiltroCaja({...filtroCaja, metodo: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="">Todos los metodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="yape">Yape</option>
                <option value="transferencia">Transferencia</option>
                <option value="plin">Plin</option>
              </select>
              <select value={filtroCaja.tipo} onChange={(e) => setFiltroCaja({...filtroCaja, tipo: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="">Todos los tipos</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
              <input placeholder="Monto..." value={filtroCaja.monto} onChange={(e) => setFiltroCaja({...filtroCaja, monto: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
          )}

          {mostrarFiltros && tab === 'cuotas' && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <input placeholder="Cliente..." value={filtroCuotas.cliente} onChange={(e) => setFiltroCuotas({...filtroCuotas, cliente: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <select value={filtroCuotas.estado} onChange={(e) => setFiltroCuotas({...filtroCuotas, estado: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
              </select>
              <button onClick={() => setFiltroCuotas({ cliente: '', estado: '' })} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs">Limpiar</button>
            </div>
          )}

          {mostrarFiltros && tab === 'pagar' && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <input placeholder="Proveedor..." value={filtroPagar.proveedor} onChange={(e) => setFiltroPagar({...filtroPagar, proveedor: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="Tipo..." value={filtroPagar.tipo} onChange={(e) => setFiltroPagar({...filtroPagar, tipo: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <input placeholder="Producto..." value={filtroPagar.producto} onChange={(e) => setFiltroPagar({...filtroPagar, producto: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
              <select value={filtroPagar.estado} onChange={(e) => setFiltroPagar({...filtroPagar, estado: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Parcial</option>
                <option value="pagado">Pagado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          )}

          {tab === 'caja' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {cargando ? (
                <div className="text-center text-gray-400 py-12">Cargando...</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Concepto</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Metodo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientosFiltrados.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No hay movimientos</td></tr>
                    ) : movimientosFiltrados.map((m) => (
                      <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(m.fecha).toLocaleDateString('es-PE')}</td>
                        <td className="px-4 py-3 text-sm hidden md:table-cell">{m.cliente_nombre || '-'}</td>
                        <td className="px-4 py-3 text-sm hidden md:table-cell">{m.concepto}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 capitalize hidden md:table-cell">{m.metodo_pago || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={'text-xs px-2 py-1 rounded-full ' + (m.tipo === 'ingreso' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400')}>{m.tipo}</span>
                        </td>
                        <td className={'px-4 py-3 text-sm font-bold ' + (m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400')}>
                          {m.tipo === 'ingreso' ? '+' : '-'} S/ {m.monto}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-700 bg-gray-800">
                      <td colSpan={2} className="px-4 py-3 text-xs text-gray-400 font-bold hidden md:table-cell">TOTALES</td>
                      <td colSpan={2} className="px-4 py-3 text-xs text-green-400 font-bold hidden md:table-cell">Ingresos: S/ {ingresos.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-green-400 font-bold md:hidden">S/ {ingresos.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-red-400 font-bold">S/ {egresos.toLocaleString()}</td>
                    </tr>
                  </tfoot>
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
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Vencimiento</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Estado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotasFiltradas.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No hay cuotas</td></tr>
                  ) : cuotasFiltradas.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium">{c.cliente_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">#{c.numero_cuota}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-400">S/ {c.monto}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 hidden md:table-cell">{c.fecha_vencimiento}</td>
                      <td className="px-4 py-3">
                        <span className={'text-xs px-2 py-1 rounded-full ' + (c.estado === 'pagado' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400')}>{c.estado}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {c.estado !== 'pagado' && <button onClick={() => marcarCuotaPagada(c.id)} className="text-green-400 hover:text-green-300 text-xs">Marcar pagado</button>}
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
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Producto</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Total</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Pagado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Pendiente</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Vence</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagarFiltrados.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No hay cuentas por pagar</td></tr>
                  ) : pagarFiltrados.map((p) => (
                    <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-4 py-3"><input value={p.proveedor || ''} onChange={(e) => editarPagar(p.id, 'proveedor', e.target.value)} className="bg-transparent text-white text-sm w-full focus:outline-none border-b border-gray-700 focus:border-blue-500 min-w-20" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><input value={p.tipoProveedor || ''} onChange={(e) => editarPagar(p.id, 'tipoProveedor', e.target.value)} className="bg-transparent text-white text-sm w-full focus:outline-none border-b border-gray-700 focus:border-blue-500 min-w-20" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><input value={p.producto || ''} onChange={(e) => editarPagar(p.id, 'producto', e.target.value)} className="bg-transparent text-white text-sm w-full focus:outline-none border-b border-gray-700 focus:border-blue-500 min-w-24" /></td>
                      <td className="px-4 py-3"><input type="number" value={p.total || 0} onChange={(e) => editarPagar(p.id, 'total', Number(e.target.value))} className="bg-transparent text-white text-sm w-16 focus:outline-none border-b border-gray-700 focus:border-blue-500" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><input type="number" value={p.pagado || 0} onChange={(e) => editarPagar(p.id, 'pagado', Number(e.target.value))} className="bg-transparent text-green-400 text-sm w-16 focus:outline-none border-b border-gray-700 focus:border-blue-500" /></td>
                      <td className="px-4 py-3"><input type="number" value={p.pendiente || 0} onChange={(e) => editarPagar(p.id, 'pendiente', Number(e.target.value))} className="bg-transparent text-yellow-400 text-sm w-16 focus:outline-none border-b border-gray-700 focus:border-blue-500" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><input type="date" value={p.fecha_vencimiento || ''} onChange={(e) => editarPagar(p.id, 'fecha_vencimiento', e.target.value)} className="bg-transparent text-white text-xs w-full focus:outline-none border-b border-gray-700 focus:border-blue-500" /></td>
                      <td className="px-4 py-3">
                        <select value={p.estado} onChange={(e) => editarPagar(p.id, 'estado', e.target.value)} className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' + statusPagarColors[p.estado]}>
                          <option value="pendiente">Pendiente</option>
                          <option value="parcial">Parcial</option>
                          <option value="pagado">Pagado</option>
                          <option value="vencido">Vencido</option>
                        </select>
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo movimiento</h3>
              <button onClick={() => setMostrarMov(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
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
                  <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
                  <input type="text" placeholder="ej: laboratorio, monturas..." onChange={(e) => setNuevoPagar({...nuevoPagar, tipoProveedor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha venta</label>
                  <input type="date" onChange={(e) => setNuevoPagar({...nuevoPagar, fecha_venta: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha vencimiento</label>
                  <input type="date" onChange={(e) => setNuevoPagar({...nuevoPagar, fecha_vencimiento: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Producto / Servicio</label>
                <input type="text" onChange={(e) => setNuevoPagar({...nuevoPagar, producto: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Total S/</label>
                  <input type="number" onChange={(e) => setNuevoPagar({...nuevoPagar, total: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Pagado S/</label>
                  <input type="number" defaultValue={0} onChange={(e) => setNuevoPagar({...nuevoPagar, pagado: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Pendiente S/</label>
                  <input type="number" defaultValue={0} onChange={(e) => setNuevoPagar({...nuevoPagar, pendiente: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Estado</label>
                  <select onChange={(e) => setNuevoPagar({...nuevoPagar, estado: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="pendiente">Pendiente</option>
                    <option value="parcial">Parcial</option>
                    <option value="pagado">Pagado</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
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