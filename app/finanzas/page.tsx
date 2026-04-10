'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase, getEmpresaId, getSedeId } from '../../lib/supabase'

const statusCuotaColors: Record<string, string> = {
  verde: 'bg-green-600',
  naranja: 'bg-orange-500',
  rojo: 'bg-red-600',
}

const statusPagarColors: Record<string, string> = {
  pendiente: 'bg-yellow-600',
  parcial: 'bg-blue-600',
  pagado: 'bg-green-600',
  vencido: 'bg-red-600',
}

export default function Finanzas() {
  const [tab, setTab] = useState('caja')
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [cuotas, setCuotas] = useState<any[]>([])
  const [pagar, setPagar] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarMov, setMostrarMov] = useState(false)
  const [mostrarPagar, setMostrarPagar] = useState(false)
  const [mostrarCuota, setMostrarCuota] = useState(false)
  const [editandoCuota, setEditandoCuota] = useState<any>(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState<string|null>(null)
  const [sedeId, setSedeId] = useState<string|null>(null)
  const [busquedaClienteMov, setBusquedaClienteMov] = useState('')
  const [clienteMovSeleccionado, setClienteMovSeleccionado] = useState<any>(null)
  const [mostrarDropdownMov, setMostrarDropdownMov] = useState(false)
  const [busquedaClienteCuota, setBusquedaClienteCuota] = useState('')
  const [clienteCuotaSeleccionado, setClienteCuotaSeleccionado] = useState<any>(null)
  const [mostrarDropdownCuota, setMostrarDropdownCuota] = useState(false)
  const [filtroCaja, setFiltroCaja] = useState({ cliente: '', metodo: '', tipo: '' })
  const [filtroCuotas, setFiltroCuotas] = useState({ cliente: '', estado: '' })
  const [filtroPagar, setFiltroPagar] = useState({ proveedor: '', estado: '' })
  const [nuevoMov, setNuevoMov] = useState({ cliente: '', concepto: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0, fecha: new Date().toISOString().split('T')[0] })
  const [nuevoPagar, setNuevoPagar] = useState({ proveedor: '', tipo: '', fecha_venta: '', producto: '', total: 0, pagado: 0, pendiente: 0, fecha_vencimiento: '', estado: 'pendiente' })
  const [nuevaCuota, setNuevaCuota] = useState({ cliente_nombre: '', ciudad: '', numero_cuota: 1, monto: 0, color_estado: 'verde', monto_pagado: 0, fecha_pagado: '', sucursal: '', fecha_vencimiento: '' })

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    const eid = await getEmpresaId()
    const sid = await getSedeId()
    setEmpresaId(eid)
    setSedeId(sid)
    cargarDatos(eid, sid)
    cargarClientes(eid)
  }

  const cargarClientes = async (eid: string|null) => {
    const query = supabase.from('pacientes').select('id, nombres, apellidos, dni, ciudad').order('nombres')
    if (eid) query.eq('empresa_id', eid)
    const { data } = await query
    setClientes(data || [])
  }

  const cargarDatos = async (eid: string|null, sid: string|null) => {
    setCargando(true)
    const cajaQuery = supabase.from('caja').select('*').order('fecha', { ascending: false }).limit(200)
    if (sid) cajaQuery.eq('sede_id', sid)
    const { data: cajaDatos } = await cajaQuery
    setMovimientos(cajaDatos || [])

    const cuotasQuery = supabase.from('cuotas_pago').select('*').order('created_at', { ascending: false })
    if (eid) cuotasQuery.eq('empresa_id', eid)
    const { data: cuotasDatos } = await cuotasQuery
    setCuotas(cuotasDatos || [])

    const pagarQuery = supabase.from('cuentas_pagar').select('*').order('created_at', { ascending: false })
    if (eid) pagarQuery.eq('empresa_id', eid)
    const { data: pagarDatos } = await pagarQuery
    setPagar(pagarDatos || [])

    setCargando(false)
  }

  const clientesFiltradosMov = clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(busquedaClienteMov.toLowerCase()) ||
    (c.dni || '').includes(busquedaClienteMov)
  ).slice(0, 5)

  const clientesFiltradosCuota = clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(busquedaClienteCuota.toLowerCase()) ||
    (c.dni || '').includes(busquedaClienteCuota)
  ).slice(0, 5)

  const movimientosFiltrados = movimientos.filter(m =>
    (filtroCaja.cliente === '' || (m.cliente_nombre || '').toLowerCase().includes(filtroCaja.cliente.toLowerCase())) &&
    (filtroCaja.metodo === '' || (m.metodo_pago || '') === filtroCaja.metodo) &&
    (filtroCaja.tipo === '' || (m.tipo || '') === filtroCaja.tipo)
  )

  const cuotasFiltradas = cuotas.filter(c =>
    (filtroCuotas.cliente === '' || (c.cliente_nombre || '').toLowerCase().includes(filtroCuotas.cliente.toLowerCase())) &&
    (filtroCuotas.estado === '' || c.color_estado === filtroCuotas.estado)
  )

  const pagarFiltrados = pagar.filter(p =>
    (filtroPagar.proveedor === '' || (p.proveedor || '').toLowerCase().includes(filtroPagar.proveedor.toLowerCase())) &&
    (filtroPagar.estado === '' || p.estado === filtroPagar.estado)
  )

  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + (m.monto || 0), 0)
  const egresos = movimientos.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + (m.monto || 0), 0)
  const totalCuotasPendientes = cuotas.filter(c => c.color_estado !== 'verde' || !c.monto_pagado).reduce((sum, c) => sum + ((c.monto || 0) - (c.monto_pagado || 0)), 0)

  const eliminarMovimiento = async (id: string) => {
    if (!confirm('¿Eliminar?')) return
    await supabase.from('caja').delete().eq('id', id)
    setMovimientos(movimientos.filter(m => m.id !== id))
  }

  const editarMonto = async (id: string, monto: number) => {
    setMovimientos(movimientos.map(m => m.id === id ? { ...m, monto } : m))
    await supabase.from('caja').update({ monto }).eq('id', id)
  }

  const guardarMov = async () => {
    if (!nuevoMov.monto) { alert('Ingresa el monto'); return }
    const nombreCliente = clienteMovSeleccionado
      ? clienteMovSeleccionado.nombres + ' ' + clienteMovSeleccionado.apellidos
      : nuevoMov.cliente

    const { data: cajaNueva, error } = await supabase.from('caja').insert([{
      sede_id: sedeId, tipo: nuevoMov.tipo,
      concepto: nuevoMov.concepto,
      monto: nuevoMov.monto, metodo_pago: nuevoMov.metodo,
      cliente_nombre: nombreCliente,
      fecha: nuevoMov.fecha ? new Date(nuevoMov.fecha).toISOString() : new Date().toISOString(),
    }]).select().single()

    if (error) { alert('Error: ' + error.message); return }

    // Si es egreso → registrar en contabilidad compras
    if (nuevoMov.tipo === 'egreso') {
      await supabase.from('contabilidad_compras').insert([{
        empresa_id: empresaId,
        empresa_proveedor: nombreCliente || 'Sin proveedor',
        fecha: nuevoMov.fecha || new Date().toISOString().split('T')[0],
        producto_servicio: nuevoMov.concepto || '',
        comentario: 'Egreso de caja',
        guia_factura: '',
        monto: nuevoMov.monto,
        impuesto: Math.round(nuevoMov.monto * 0.18 * 100) / 100,
        caja_id: cajaNueva?.id || null
      }])
    }

    // Si es ingreso → registrar en contabilidad ventas
    if (nuevoMov.tipo === 'ingreso') {
      await supabase.from('contabilidad_ventas').insert([{
        empresa_id: empresaId,
        fecha: nuevoMov.fecha || new Date().toISOString().split('T')[0],
        cliente: nombreCliente || '',
        guia_factura: '',
        monto_venta: nuevoMov.monto,
        impuesto: Math.round(nuevoMov.monto * 0.18 * 100) / 100,
        comentarios: nuevoMov.concepto || '',
        origen: 'caja',
        caja_id: cajaNueva?.id || null
      }])
    }

    setMostrarMov(false)
    setNuevoMov({ cliente: '', concepto: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0, fecha: new Date().toISOString().split('T')[0] })
    setClienteMovSeleccionado(null)
    setBusquedaClienteMov('')
    cargarDatos(empresaId, sedeId)
  }

  const guardarCuota = async () => {
    if (!nuevaCuota.cliente_nombre && !clienteCuotaSeleccionado) { alert('Selecciona o ingresa un cliente'); return }
    if (!nuevaCuota.monto) { alert('Ingresa el monto'); return }

    const nombreCliente = clienteCuotaSeleccionado
      ? clienteCuotaSeleccionado.nombres + ' ' + clienteCuotaSeleccionado.apellidos
      : nuevaCuota.cliente_nombre
    const ciudad = clienteCuotaSeleccionado ? (clienteCuotaSeleccionado.ciudad || nuevaCuota.ciudad) : nuevaCuota.ciudad

    const { error } = await supabase.from('cuotas_pago').insert([{
      empresa_id: empresaId,
      cliente_nombre: nombreCliente,
      ciudad,
      numero_cuota: nuevaCuota.numero_cuota,
      monto: nuevaCuota.monto,
      color_estado: nuevaCuota.color_estado,
      monto_pagado: nuevaCuota.monto_pagado,
      fecha_pagado: nuevaCuota.fecha_pagado || null,
      sucursal: nuevaCuota.sucursal,
      fecha_vencimiento: nuevaCuota.fecha_vencimiento || null,
      estado: 'pendiente',
    }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarCuota(false)
    setNuevaCuota({ cliente_nombre: '', ciudad: '', numero_cuota: 1, monto: 0, color_estado: 'verde', monto_pagado: 0, fecha_pagado: '', sucursal: '', fecha_vencimiento: '' })
    setClienteCuotaSeleccionado(null)
    setBusquedaClienteCuota('')
    cargarDatos(empresaId, sedeId)
  }

  const guardarEdicionCuota = async () => {
    if (!editandoCuota) return
    const { error } = await supabase.from('cuotas_pago').update({
      cliente_nombre: editandoCuota.cliente_nombre,
      ciudad: editandoCuota.ciudad,
      numero_cuota: editandoCuota.numero_cuota,
      monto: editandoCuota.monto,
      color_estado: editandoCuota.color_estado,
      monto_pagado: editandoCuota.monto_pagado,
      fecha_pagado: editandoCuota.fecha_pagado || null,
      sucursal: editandoCuota.sucursal,
      fecha_vencimiento: editandoCuota.fecha_vencimiento || null,
    }).eq('id', editandoCuota.id)
    if (error) { alert('Error: ' + error.message); return }
    setEditandoCuota(null)
    cargarDatos(empresaId, sedeId)
  }

  const eliminarCuota = async (id: string) => {
    if (!confirm('¿Eliminar?')) return
    await supabase.from('cuotas_pago').delete().eq('id', id)
    setCuotas(cuotas.filter(c => c.id !== id))
  }

  const editarCuotaInline = async (id: string, campo: string, valor: any) => {
    setCuotas(cuotas.map(c => c.id === id ? { ...c, [campo]: valor } : c))
    await supabase.from('cuotas_pago').update({ [campo]: valor }).eq('id', id)
  }

  const guardarPagar = async () => {
    if (!nuevoPagar.proveedor) { alert('Ingresa el proveedor'); return }
    const { data, error } = await supabase.from('cuentas_pagar').insert([{
      empresa_id: empresaId,
      proveedor: nuevoPagar.proveedor,
      tipo: nuevoPagar.tipo,
      fecha_venta: nuevoPagar.fecha_venta || null,
      producto: nuevoPagar.producto,
      total: nuevoPagar.total,
      pagado: nuevoPagar.pagado,
      pendiente: nuevoPagar.total - nuevoPagar.pagado,
      fecha_vencimiento: nuevoPagar.fecha_vencimiento || null,
      estado: nuevoPagar.estado,
    }]).select().single()
    if (error) { alert('Error: ' + error.message); return }
    setPagar([data, ...pagar])
    setMostrarPagar(false)
    setNuevoPagar({ proveedor: '', tipo: '', fecha_venta: '', producto: '', total: 0, pagado: 0, pendiente: 0, fecha_vencimiento: '', estado: 'pendiente' })
  }

  const editarPagar = async (id: string, campo: string, valor: any) => {
    setPagar(pagar.map(p => {
      if (p.id !== id) return p
      const updated = { ...p, [campo]: valor }
      if (campo === 'total' || campo === 'pagado') {
        updated.pendiente = (campo === 'total' ? Number(valor) : p.total) - (campo === 'pagado' ? Number(valor) : p.pagado)
      }
      return updated
    }))
    await supabase.from('cuentas_pagar').update({ [campo]: valor }).eq('id', id)
  }

  const eliminarPagar = async (id: string) => {
    if (!confirm('¿Eliminar?')) return
    await supabase.from('cuentas_pagar').delete().eq('id', id)
    setPagar(pagar.filter(p => p.id !== id))
  }

  const escapeCSV = (val: any) => {
    const str = String(val === null || val === undefined ? '' : val)
    if (str.includes(';') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"'
    return str
  }

  const descargar = () => {
    let headers: string[], rows: any[][], filename: string
    if (tab === 'caja') {
      headers = ['Fecha', 'Cliente', 'Tipo', 'Monto', 'Metodo', 'Comentario']
      rows = movimientosFiltrados.map(m => [new Date(m.fecha).toLocaleDateString('es-PE'), m.cliente_nombre || '', m.tipo || '', m.monto || 0, m.metodo_pago || '', m.concepto || ''])
      filename = 'caja.csv'
    } else if (tab === 'cuotas') {
      headers = ['Cliente', 'Ciudad', 'Cuota', 'Monto', 'Estado', 'Monto pagado', 'Fecha pagado', 'Sucursal']
      rows = cuotasFiltradas.map(c => [c.cliente_nombre || '', c.ciudad || '', '#' + c.numero_cuota, c.monto || 0, c.color_estado || '', c.monto_pagado || 0, c.fecha_pagado || '', c.sucursal || ''])
      filename = 'cuotas.csv'
    } else {
      headers = ['Proveedor', 'Tipo', 'Producto', 'Total', 'Pagado', 'Pendiente', 'Vence', 'Estado']
      rows = pagarFiltrados.map(p => [p.proveedor || '', p.tipo || '', p.producto || '', p.total || 0, p.pagado || 0, p.pendiente || 0, p.fecha_vencimiento || '', p.estado || ''])
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
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={'px-3 py-2 rounded-lg text-sm ' + (mostrarFiltros ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white')}>🔍</button>
            <button onClick={descargar} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm hidden md:block">⬇</button>
            {tab === 'caja' && <button onClick={() => setMostrarMov(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Movimiento</button>}
            {tab === 'cuotas' && <button onClick={() => setMostrarCuota(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Cuota</button>}
            {tab === 'pagar' && <button onClick={() => setMostrarPagar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Cuenta</button>}
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Ingresos</p>
              <p className="text-xl font-bold text-green-400">S/ {ingresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Egresos</p>
              <p className="text-xl font-bold text-red-400">S/ {egresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Saldo</p>
              <p className="text-xl font-bold text-blue-400">S/ {(ingresos - egresos).toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Cuotas pendientes</p>
              <p className="text-xl font-bold text-yellow-400">S/ {totalCuotasPendientes.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {['caja', 'cuotas', 'pagar'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm whitespace-nowrap transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'caja' ? 'Caja' : t === 'cuotas' ? 'Cuotas por cobrar' : 'Cuentas por pagar'}
              </button>
            ))}
          </div>

          {mostrarFiltros && tab === 'caja' && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-3 gap-3">
              <input placeholder="Cliente..." value={filtroCaja.cliente} onChange={(e) => setFiltroCaja({...filtroCaja, cliente: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
              <select value={filtroCaja.metodo} onChange={(e) => setFiltroCaja({...filtroCaja, metodo: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                <option value="">Todos los metodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="yape">Yape</option>
                <option value="transferencia">Transferencia</option>
                <option value="plin">Plin</option>
              </select>
              <select value={filtroCaja.tipo} onChange={(e) => setFiltroCaja({...filtroCaja, tipo: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                <option value="">Todos</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
          )}

          {mostrarFiltros && tab === 'cuotas' && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-3 gap-3">
              <input placeholder="Cliente..." value={filtroCuotas.cliente} onChange={(e) => setFiltroCuotas({...filtroCuotas, cliente: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
              <select value={filtroCuotas.estado} onChange={(e) => setFiltroCuotas({...filtroCuotas, estado: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                <option value="">Todos</option>
                <option value="verde">Verde</option>
                <option value="naranja">Naranja</option>
                <option value="rojo">Rojo</option>
              </select>
              <button onClick={() => setFiltroCuotas({ cliente: '', estado: '' })} className="bg-gray-700 text-white px-3 py-2 rounded-lg text-xs">Limpiar</button>
            </div>
          )}

          {mostrarFiltros && tab === 'pagar' && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-3 gap-3">
              <input placeholder="Proveedor..." value={filtroPagar.proveedor} onChange={(e) => setFiltroPagar({...filtroPagar, proveedor: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
              <select value={filtroPagar.estado} onChange={(e) => setFiltroPagar({...filtroPagar, estado: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Parcial</option>
                <option value="pagado">Pagado</option>
                <option value="vencido">Vencido</option>
              </select>
              <button onClick={() => setFiltroPagar({ proveedor: '', estado: '' })} className="bg-gray-700 text-white px-3 py-2 rounded-lg text-xs">Limpiar</button>
            </div>
          )}

          {tab === 'caja' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
              {cargando ? <div className="text-center text-gray-400 py-12">Cargando...</div> : (
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Monto</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Metodo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Comentario</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientosFiltrados.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No hay movimientos</td></tr>
                    ) : movimientosFiltrados.map((m) => (
                      <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(m.fecha).toLocaleDateString('es-PE')}</td>
                        <td className="px-4 py-3 text-sm">{m.cliente_nombre || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={'text-xs px-2 py-1 rounded-full ' + (m.tipo === 'ingreso' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400')}>{m.tipo}</span>
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={m.monto || 0} onChange={(e) => editarMonto(m.id, Number(e.target.value))} className={'bg-transparent font-bold text-sm w-24 focus:outline-none border-b border-gray-700 focus:border-blue-500 ' + (m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400')} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 capitalize">{m.metodo_pago || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{m.concepto || '-'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => eliminarMovimiento(m.id)} className="text-red-400 hover:text-red-300 text-xs">🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-700 bg-gray-800">
                      <td colSpan={3} className="px-4 py-3 text-xs text-gray-400 font-bold">TOTALES</td>
                      <td className="px-4 py-3 text-xs font-bold">
                        <span className="text-green-400">+S/ {ingresos.toLocaleString()}</span>
                        <span className="text-gray-500 mx-1">|</span>
                        <span className="text-red-400">-S/ {egresos.toLocaleString()}</span>
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}

          {tab === 'cuotas' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Ciudad</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Cuota</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Monto</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Estado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Monto pagado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Fecha pagado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Sucursal</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {cuotasFiltradas.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No hay cuotas</td></tr>
                  ) : cuotasFiltradas.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">{c.cliente_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.ciudad || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">#{c.numero_cuota}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-400">S/ {c.monto}</td>
                      <td className="px-4 py-3">
                        <select value={c.color_estado || 'verde'} onChange={(e) => editarCuotaInline(c.id, 'color_estado', e.target.value)} className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' + statusCuotaColors[c.color_estado || 'verde']}>
                          <option value="verde">Verde</option>
                          <option value="naranja">Naranja</option>
                          <option value="rojo">Rojo</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" value={c.monto_pagado || 0} onChange={(e) => editarCuotaInline(c.id, 'monto_pagado', Number(e.target.value))} className="bg-transparent text-green-400 text-sm w-20 focus:outline-none border-b border-gray-700 focus:border-blue-500" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="date" value={c.fecha_pagado || ''} onChange={(e) => editarCuotaInline(c.id, 'fecha_pagado', e.target.value)} className="bg-transparent text-white text-xs focus:outline-none border-b border-gray-700 focus:border-blue-500" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.sucursal || '-'}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => setEditandoCuota({...c})} className="text-blue-400 hover:text-blue-300 text-xs">✏</button>
                        <button onClick={() => eliminarCuota(c.id)} className="text-red-400 hover:text-red-300 text-xs">🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'pagar' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
              {cargando ? <div className="text-center text-gray-400 py-12">Cargando...</div> : (
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Proveedor</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Producto</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Total</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Pagado</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Pendiente</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Vence</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase whitespace-nowrap">Estado</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagarFiltrados.length === 0 ? (
                      <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No hay cuentas por pagar</td></tr>
                    ) : pagarFiltrados.map((p) => (
                      <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-4 py-3"><input value={p.proveedor || ''} onChange={(e) => editarPagar(p.id, 'proveedor', e.target.value)} className="bg-transparent text-white text-sm w-full focus:outline-none border-b border-gray-700 focus:border-blue-500 min-w-24" /></td>
                        <td className="px-4 py-3"><input value={p.tipo || ''} onChange={(e) => editarPagar(p.id, 'tipo', e.target.value)} className="bg-transparent text-white text-sm w-full focus:outline-none border-b border-gray-700 focus:border-blue-500 min-w-20" /></td>
                        <td className="px-4 py-3"><input value={p.producto || ''} onChange={(e) => editarPagar(p.id, 'producto', e.target.value)} className="bg-transparent text-white text-sm w-full focus:outline-none border-b border-gray-700 focus:border-blue-500 min-w-28" /></td>
                        <td className="px-4 py-3"><input type="number" value={p.total || 0} onChange={(e) => editarPagar(p.id, 'total', Number(e.target.value))} className="bg-transparent text-white text-sm w-16 focus:outline-none border-b border-gray-700 focus:border-blue-500" /></td>
                        <td className="px-4 py-3"><input type="number" value={p.pagado || 0} onChange={(e) => editarPagar(p.id, 'pagado', Number(e.target.value))} className="bg-transparent text-green-400 text-sm w-16 focus:outline-none border-b border-gray-700 focus:border-blue-500" /></td>
                        <td className="px-4 py-3"><span className="text-yellow-400 text-sm font-bold">S/ {p.pendiente || 0}</span></td>
                        <td className="px-4 py-3"><input type="date" value={p.fecha_vencimiento || ''} onChange={(e) => editarPagar(p.id, 'fecha_vencimiento', e.target.value)} className="bg-transparent text-white text-xs focus:outline-none border-b border-gray-700 focus:border-blue-500" /></td>
                        <td className="px-4 py-3">
                          <select value={p.estado || 'pendiente'} onChange={(e) => editarPagar(p.id, 'estado', e.target.value)} className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' + statusPagarColors[p.estado || 'pendiente']}>
                            <option value="pendiente">Pendiente</option>
                            <option value="parcial">Parcial</option>
                            <option value="pagado">Pagado</option>
                            <option value="vencido">Vencido</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => eliminarPagar(p.id)} className="text-red-400 hover:text-red-300 text-xs">🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
                <input type="date" value={nuevoMov.fecha} onChange={(e) => setNuevoMov({...nuevoMov, fecha: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                <div className="relative">
                  <input type="text" placeholder="Buscar cliente..." value={clienteMovSeleccionado ? clienteMovSeleccionado.nombres + ' ' + clienteMovSeleccionado.apellidos : busquedaClienteMov} onChange={(e) => { setBusquedaClienteMov(e.target.value); setClienteMovSeleccionado(null); setMostrarDropdownMov(true) }} onFocus={() => setMostrarDropdownMov(true)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  {mostrarDropdownMov && busquedaClienteMov && (
                    <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-10 max-h-36 overflow-auto">
                      {clientesFiltradosMov.map((c: any) => (
                        <button key={c.id} onClick={() => { setClienteMovSeleccionado(c); setBusquedaClienteMov(''); setMostrarDropdownMov(false) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                          <p>{c.nombres} {c.apellidos}</p>
                          <p className="text-xs text-gray-400">{c.dni || '-'}</p>
                        </button>
                      ))}
                      <button onClick={() => { setNuevoMov({...nuevoMov, cliente: busquedaClienteMov}); setMostrarDropdownMov(false) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs text-blue-400 border-t border-gray-700">+ Usar sin registrar</button>
                    </div>
                  )}
                </div>
                {clienteMovSeleccionado && (
                  <div className="mt-1 bg-blue-900 rounded px-2 py-1 flex justify-between items-center">
                    <p className="text-xs text-blue-300">{clienteMovSeleccionado.nombres} {clienteMovSeleccionado.apellidos}</p>
                    <button onClick={() => setClienteMovSeleccionado(null)} className="text-blue-400 text-xs">X</button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Comentario</label>
                <input type="text" value={nuevoMov.concepto} onChange={(e) => setNuevoMov({...nuevoMov, concepto: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
                  <select value={nuevoMov.tipo} onChange={(e) => setNuevoMov({...nuevoMov, tipo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" value={nuevoMov.monto} onChange={(e) => setNuevoMov({...nuevoMov, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Metodo</label>
                  <select value={nuevoMov.metodo} onChange={(e) => setNuevoMov({...nuevoMov, metodo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="efectivo">Efectivo</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
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

      {mostrarCuota && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva cuota por cobrar</h3>
              <button onClick={() => setMostrarCuota(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                <div className="relative">
                  <input type="text" placeholder="Buscar cliente..." value={clienteCuotaSeleccionado ? clienteCuotaSeleccionado.nombres + ' ' + clienteCuotaSeleccionado.apellidos : busquedaClienteCuota} onChange={(e) => { setBusquedaClienteCuota(e.target.value); setClienteCuotaSeleccionado(null); setMostrarDropdownCuota(true) }} onFocus={() => setMostrarDropdownCuota(true)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  {mostrarDropdownCuota && busquedaClienteCuota && (
                    <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-10 max-h-36 overflow-auto">
                      {clientesFiltradosCuota.map((c: any) => (
                        <button key={c.id} onClick={() => { setClienteCuotaSeleccionado(c); setBusquedaClienteCuota(''); setMostrarDropdownCuota(false); setNuevaCuota({...nuevaCuota, cliente_nombre: c.nombres + ' ' + c.apellidos, ciudad: c.ciudad || ''}) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                          <p>{c.nombres} {c.apellidos}</p>
                          <p className="text-xs text-gray-400">{c.ciudad || '-'}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {clienteCuotaSeleccionado && (
                  <div className="mt-1 bg-blue-900 rounded px-2 py-1 flex justify-between items-center">
                    <p className="text-xs text-blue-300">{clienteCuotaSeleccionado.nombres} {clienteCuotaSeleccionado.apellidos}</p>
                    <button onClick={() => setClienteCuotaSeleccionado(null)} className="text-blue-400 text-xs">X</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" value={nuevaCuota.ciudad} onChange={(e) => setNuevaCuota({...nuevaCuota, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Numero de cuota</label>
                  <input type="number" min={1} value={nuevaCuota.numero_cuota} onChange={(e) => setNuevaCuota({...nuevaCuota, numero_cuota: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" value={nuevaCuota.monto} onChange={(e) => setNuevaCuota({...nuevaCuota, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Estado</label>
                  <select value={nuevaCuota.color_estado} onChange={(e) => setNuevaCuota({...nuevaCuota, color_estado: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="verde">Verde</option>
                    <option value="naranja">Naranja</option>
                    <option value="rojo">Rojo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto pagado S/</label>
                  <input type="number" value={nuevaCuota.monto_pagado} onChange={(e) => setNuevaCuota({...nuevaCuota, monto_pagado: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha pagado</label>
                  <input type="date" value={nuevaCuota.fecha_pagado} onChange={(e) => setNuevaCuota({...nuevaCuota, fecha_pagado: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Sucursal</label>
                  <input type="text" value={nuevaCuota.sucursal} onChange={(e) => setNuevaCuota({...nuevaCuota, sucursal: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha vencimiento</label>
                  <input type="date" value={nuevaCuota.fecha_vencimiento} onChange={(e) => setNuevaCuota({...nuevaCuota, fecha_vencimiento: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarCuota(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarCuota} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar cuota</button>
            </div>
          </div>
        </div>
      )}

      {editandoCuota && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Editar cuota</h3>
              <button onClick={() => setEditandoCuota(null)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                <input type="text" value={editandoCuota.cliente_nombre} onChange={(e) => setEditandoCuota({...editandoCuota, cliente_nombre: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" value={editandoCuota.ciudad || ''} onChange={(e) => setEditandoCuota({...editandoCuota, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Numero cuota</label>
                  <input type="number" value={editandoCuota.numero_cuota} onChange={(e) => setEditandoCuota({...editandoCuota, numero_cuota: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" value={editandoCuota.monto} onChange={(e) => setEditandoCuota({...editandoCuota, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Estado</label>
                  <select value={editandoCuota.color_estado || 'verde'} onChange={(e) => setEditandoCuota({...editandoCuota, color_estado: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="verde">Verde</option>
                    <option value="naranja">Naranja</option>
                    <option value="rojo">Rojo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto pagado S/</label>
                  <input type="number" value={editandoCuota.monto_pagado || 0} onChange={(e) => setEditandoCuota({...editandoCuota, monto_pagado: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha pagado</label>
                  <input type="date" value={editandoCuota.fecha_pagado || ''} onChange={(e) => setEditandoCuota({...editandoCuota, fecha_pagado: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Sucursal</label>
                  <input type="text" value={editandoCuota.sucursal || ''} onChange={(e) => setEditandoCuota({...editandoCuota, sucursal: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha vencimiento</label>
                  <input type="date" value={editandoCuota.fecha_vencimiento || ''} onChange={(e) => setEditandoCuota({...editandoCuota, fecha_vencimiento: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditandoCuota(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarEdicionCuota} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarPagar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva cuenta por pagar</h3>
              <button onClick={() => setMostrarPagar(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Proveedor</label>
                  <input type="text" value={nuevoPagar.proveedor} onChange={(e) => setNuevoPagar({...nuevoPagar, proveedor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
                  <input type="text" placeholder="ej: laboratorio, monturas..." value={nuevoPagar.tipo} onChange={(e) => setNuevoPagar({...nuevoPagar, tipo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha venta</label>
                  <input type="date" value={nuevoPagar.fecha_venta} onChange={(e) => setNuevoPagar({...nuevoPagar, fecha_venta: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha vencimiento</label>
                  <input type="date" value={nuevoPagar.fecha_vencimiento} onChange={(e) => setNuevoPagar({...nuevoPagar, fecha_vencimiento: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Producto / Servicio</label>
                <input type="text" value={nuevoPagar.producto} onChange={(e) => setNuevoPagar({...nuevoPagar, producto: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Total S/</label>
                  <input type="number" value={nuevoPagar.total} onChange={(e) => setNuevoPagar({...nuevoPagar, total: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Pagado S/</label>
                  <input type="number" value={nuevoPagar.pagado} onChange={(e) => setNuevoPagar({...nuevoPagar, pagado: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Estado</label>
                  <select value={nuevoPagar.estado} onChange={(e) => setNuevoPagar({...nuevoPagar, estado: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
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