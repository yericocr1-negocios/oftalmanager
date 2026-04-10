'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase, getEmpresaId } from '../../lib/supabase'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const UIT = 5150

export default function Contabilidad() {
  const [tab, setTab] = useState('ventas')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState<string|null>(null)
  const [cargando, setCargando] = useState(true)

  // Ventas
  const [ventas, setVentas] = useState<any[]>([])
  const [mostrarVenta, setMostrarVenta] = useState(false)
  const [filtroVentas, setFiltroVentas] = useState({ fecha: '', cliente: '', guia: '', monto: '', comentarios: '' })
  const [nuevaVenta, setNuevaVenta] = useState({ fecha: '', cliente: '', guia_factura: '', monto_venta: '', comentarios: '' })

  // Compras
  const [compras, setCompras] = useState<any[]>([])
  const [mostrarCompra, setMostrarCompra] = useState(false)
  const [filtroCompras, setFiltroCompras] = useState({ empresa: '', fecha: '', producto: '', comentario: '', guia: '', monto: '' })
  const [nuevaCompra, setNuevaCompra] = useState({ empresa_proveedor: '', fecha: '', producto_servicio: '', comentario: '', guia_factura: '', monto: '' })

  // Renta
  const [filtroRentaMes, setFiltroRentaMes] = useState('todos')

  // Impuestos (tributario)
  const [regimen, setRegimen] = useState('RMT')
  const [ventasImp, setVentasImp] = useState('')
  const [comprasImp, setComprasImp] = useState('')
  const [calculado, setCalculado] = useState<any>(null)

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    const eid = await getEmpresaId()
    setEmpresaId(eid)
    await cargarDatos(eid)
  }

  const cargarDatos = async (eid: string|null) => {
    setCargando(true)
    const { data: ventasData } = await supabase.from('contabilidad_ventas').select('*').eq('empresa_id', eid).order('fecha', { ascending: false })
    setVentas(ventasData || [])
    const { data: comprasData } = await supabase.from('contabilidad_compras').select('*').eq('empresa_id', eid).order('fecha', { ascending: false })
    setCompras(comprasData || [])
    setCargando(false)
  }

  const guardarVenta = async () => {
    if (!nuevaVenta.fecha || !nuevaVenta.monto_venta) { alert('Fecha y monto son obligatorios'); return }
    const monto = parseFloat(nuevaVenta.monto_venta) || 0
    const impuesto = Math.round(monto * 0.18 * 100) / 100
    const { error } = await supabase.from('contabilidad_ventas').insert([{
      empresa_id: empresaId,
      fecha: nuevaVenta.fecha,
      cliente: nuevaVenta.cliente,
      guia_factura: nuevaVenta.guia_factura,
      monto_venta: monto,
      impuesto,
      comentarios: nuevaVenta.comentarios,
      origen: 'manual'
    }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarVenta(false)
    setNuevaVenta({ fecha: '', cliente: '', guia_factura: '', monto_venta: '', comentarios: '' })
    cargarDatos(empresaId)
  }

  const guardarCompra = async () => {
    if (!nuevaCompra.fecha || !nuevaCompra.monto) { alert('Fecha y monto son obligatorios'); return }
    const montoCompra = parseFloat(nuevaCompra.monto) || 0
    const impuestoCompra = Math.round(montoCompra * 0.18 * 100) / 100
    const { error } = await supabase.from('contabilidad_compras').insert([{
      empresa_id: empresaId, ...nuevaCompra, monto: montoCompra, impuesto: impuestoCompra
    }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarCompra(false)
    setNuevaCompra({ empresa_proveedor: '', fecha: '', producto_servicio: '', comentario: '', guia_factura: '', monto: '' })
    cargarDatos(empresaId)
  }

  const eliminarVenta = async (id: string) => {
    if (!confirm('¿Eliminar este registro?')) return
    await supabase.from('contabilidad_ventas').delete().eq('id', id)
    setVentas(ventas.filter(v => v.id !== id))
  }

  const eliminarCompra = async (id: string) => {
    if (!confirm('¿Eliminar este registro?')) return
    await supabase.from('contabilidad_compras').delete().eq('id', id)
    setCompras(compras.filter(c => c.id !== id))
  }

  const ventasFiltradas = ventas.filter(v =>
    (filtroVentas.fecha === '' || (v.fecha || '').includes(filtroVentas.fecha)) &&
    (filtroVentas.cliente === '' || (v.cliente || '').toLowerCase().includes(filtroVentas.cliente.toLowerCase())) &&
    (filtroVentas.guia === '' || (v.guia_factura || '').toLowerCase().includes(filtroVentas.guia.toLowerCase())) &&
    (filtroVentas.monto === '' || String(v.monto_venta || '').includes(filtroVentas.monto)) &&
    (filtroVentas.comentarios === '' || (v.comentarios || '').toLowerCase().includes(filtroVentas.comentarios.toLowerCase()))
  )

  const comprasFiltradas = compras.filter(c =>
    (filtroCompras.empresa === '' || (c.empresa_proveedor || '').toLowerCase().includes(filtroCompras.empresa.toLowerCase())) &&
    (filtroCompras.fecha === '' || (c.fecha || '').includes(filtroCompras.fecha)) &&
    (filtroCompras.producto === '' || (c.producto_servicio || '').toLowerCase().includes(filtroCompras.producto.toLowerCase())) &&
    (filtroCompras.comentario === '' || (c.comentario || '').toLowerCase().includes(filtroCompras.comentario.toLowerCase())) &&
    (filtroCompras.guia === '' || (c.guia_factura || '').toLowerCase().includes(filtroCompras.guia.toLowerCase())) &&
    (filtroCompras.monto === '' || String(c.monto || '').includes(filtroCompras.monto))
  )

  const totalVentas = ventasFiltradas.reduce((s, v) => s + (v.monto_venta || 0), 0)
  const totalImpuesto = ventasFiltradas.reduce((s, v) => s + (v.impuesto || 0), 0)
  const totalCompras = comprasFiltradas.reduce((s, c) => s + (c.monto || 0), 0)

  const rentaPorMes = meses.map((mes, idx) => {
    const mesNum = String(idx + 1).padStart(2, '0')
    const vMes = ventas.filter(v => v.fecha && v.fecha.slice(5,7) === mesNum).reduce((s,v) => s+(v.monto_venta||0), 0)
    const cMes = compras.filter(c => c.fecha && c.fecha.slice(5,7) === mesNum).reduce((s,c) => s+(c.monto||0), 0)
    return { mes, ventas: vMes, compras: cMes, renta: vMes - cMes }
  }).filter(r => filtroRentaMes === 'todos' || r.mes === filtroRentaMes)

  // ── CÁLCULO TRIBUTARIO ──
  const calcular = () => {
    const v = parseFloat(ventasImp) || 0
    const c = parseFloat(comprasImp) || 0
    const utilidad = v - c
    let resultado: any = { ventas: v, compras: c, utilidad, regimen }

    if (regimen === 'NRUS') {
      const cuota = v <= 5000 ? 20 : v <= 8000 ? 50 : 0
      resultado = { ...resultado, cuota, totalImpuestos: cuota, igv: 0, renta: 0 }
    } else if (regimen === 'RER') {
      const igvVentas = v * 0.18
      const igvCompras = c * 0.18
      const igv = igvVentas - igvCompras
      const renta = v * 0.015
      resultado = { ...resultado, igvVentas, igvCompras, igv, renta, totalImpuestos: igv + renta }
    } else if (regimen === 'RMT') {
      const igvVentas = v * 0.18
      const igvCompras = c * 0.18
      const igv = igvVentas - igvCompras
      const rentaMensual = v * 0.01
      const limite15UIT = 15 * UIT
      const rentaAnual = utilidad * 12 <= limite15UIT ? utilidad * 12 * 0.10 : limite15UIT * 0.10 + (utilidad * 12 - limite15UIT) * 0.295
      resultado = { ...resultado, igvVentas, igvCompras, igv, rentaMensual, rentaAnual: rentaAnual / 12, totalImpuestos: igv + rentaMensual }
    } else if (regimen === 'RG') {
      const igvVentas = v * 0.18
      const igvCompras = c * 0.18
      const igv = igvVentas - igvCompras
      const renta = v * 0.015
      const rentaAnual = utilidad * 12 * 0.295
      resultado = { ...resultado, igvVentas, igvCompras, igv, renta, rentaAnual: rentaAnual / 12, totalImpuestos: igv + renta }
    }

    resultado.utilidadNeta = utilidad - (resultado.totalImpuestos || 0)
    setCalculado(resultado)
  }

  const simular = () => {
    const v = parseFloat(ventasImp) || 0
    const c = parseFloat(comprasImp) || 0
    const resultados = []
    const cuota = v <= 5000 ? 20 : v <= 8000 ? 50 : null
    if (cuota !== null) resultados.push({ regimen: 'NRUS', total: cuota, detalle: `Cuota fija: S/ ${cuota}` })
    const igvRER = (v - c) * 0.18; const rentaRER = v * 0.015
    resultados.push({ regimen: 'RER', total: igvRER + rentaRER, detalle: `IGV: S/ ${igvRER.toFixed(2)} + Renta: S/ ${rentaRER.toFixed(2)}` })
    const igvRMT = (v - c) * 0.18; const rentaRMT = v * 0.01
    resultados.push({ regimen: 'RMT', total: igvRMT + rentaRMT, detalle: `IGV: S/ ${igvRMT.toFixed(2)} + Renta: S/ ${rentaRMT.toFixed(2)}` })
    const igvRG = (v - c) * 0.18; const rentaRG = v * 0.015
    resultados.push({ regimen: 'Régimen General', total: igvRG + rentaRG, detalle: `IGV: S/ ${igvRG.toFixed(2)} + Renta: S/ ${rentaRG.toFixed(2)}` })
    return resultados.sort((a, b) => a.total - b.total)
  }

  const thClass = 'text-left px-3 py-3 text-xs text-gray-400 uppercase whitespace-nowrap border-b border-gray-700'
  const tdClass = 'px-3 py-3 text-sm text-gray-200 whitespace-nowrap'
  const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500'
  const filterClass = 'bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500'

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
            <div>
              <h2 className="text-lg font-semibold">Contabilidad</h2>
              <p className="text-sm text-gray-400">Control contable y tributario</p>
            </div>
          </div>
          <div>
            {tab === 'ventas' && <button onClick={() => setMostrarVenta(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Agregar venta</button>}
            {tab === 'compras' && <button onClick={() => setMostrarCompra(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Agregar compra</button>}
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            {['ventas','compras','renta','impuestos'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 rounded-lg text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'ventas' ? '📥 Ventas' : t === 'compras' ? '📤 Compras' : t === 'renta' ? '📊 Renta' : '🧮 Impuestos'}
              </button>
            ))}
          </div>

          {/* ── VENTAS ── */}
          {tab === 'ventas' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-700 grid grid-cols-2 md:grid-cols-5 gap-2">
                <input placeholder="Filtrar fecha..." value={filtroVentas.fecha} onChange={e => setFiltroVentas({...filtroVentas, fecha: e.target.value})} className={filterClass} />
                <input placeholder="Filtrar cliente..." value={filtroVentas.cliente} onChange={e => setFiltroVentas({...filtroVentas, cliente: e.target.value})} className={filterClass} />
                <input placeholder="Filtrar guía..." value={filtroVentas.guia} onChange={e => setFiltroVentas({...filtroVentas, guia: e.target.value})} className={filterClass} />
                <input placeholder="Filtrar monto..." value={filtroVentas.monto} onChange={e => setFiltroVentas({...filtroVentas, monto: e.target.value})} className={filterClass} />
                <input placeholder="Filtrar comentarios..." value={filtroVentas.comentarios} onChange={e => setFiltroVentas({...filtroVentas, comentarios: e.target.value})} className={filterClass} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className={thClass}>Mes</th>
                      <th className={thClass}>Cliente</th>
                      <th className={thClass}>RUC/DNI</th>
                      <th className={thClass}>Ciudad</th>
                      <th className={thClass}>Vendedor</th>
                      <th className={thClass}>Monto</th>
                      <th className={thClass}>Impuesto 18%</th>
                      <th className={thClass}>Cantidad</th>
                      <th className={thClass}>Precio Unit.</th>
                      <th className={thClass}>Costo</th>
                      <th className={thClass}>Margen</th>
                      <th className={thClass}>Facturado por</th>
                      <th className={thClass}>Fecha</th>
                      <th className={thClass}>Guía / Factura</th>
                      <th className={thClass}>Comentarios</th>
                      <th className={thClass}>Cuotas</th>
                      <th className={thClass}>Fechas pago</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargando ? (
                      <tr><td colSpan={7} className="text-center text-gray-400 py-12">Cargando...</td></tr>
                    ) : ventasFiltradas.length === 0 ? (
                      <tr><td colSpan={7} className="text-center text-gray-400 py-12">No hay registros</td></tr>
                    ) : ventasFiltradas.map(v => (
                      <tr key={v.id} className="border-t border-gray-800 hover:bg-gray-800">
                        <td className={tdClass}>{v.mes || '-'}</td>
                        <td className={tdClass + ' font-medium'}>{v.cliente || '-'}</td>
                        <td className={tdClass}>{v.ruc_dni || '-'}</td>
                        <td className={tdClass}>{v.ciudad || '-'}</td>
                        <td className={tdClass}>{v.vendedor || '-'}</td>
                        <td className={tdClass + ' text-green-400 font-bold'}>S/ {Number(v.monto_venta||0).toFixed(2)}</td>
                        <td className={tdClass + ' text-yellow-400'}>S/ {Number(v.impuesto||0).toFixed(2)}</td>
                        <td className={tdClass + ' text-center'}>{v.cantidad || '-'}</td>
                        <td className={tdClass + ' text-blue-400'}>S/ {Number(v.precio_unitario||0).toFixed(2)}</td>
                        <td className={tdClass + ' text-orange-400'}>S/ {Number(v.precio_costo||0).toFixed(2)}</td>
                        <td className={tdClass + ' font-bold'}>
                          <span className={Number(v.margen||0) >= 0 ? 'text-green-400' : 'text-red-400'}>S/ {Number(v.margen||0).toFixed(2)}</span>
                        </td>
                        <td className={tdClass}>{v.facturado_por || '-'}</td>
                        <td className={tdClass}>{v.fecha}</td>
                        <td className={tdClass}>{v.guia_factura || '-'}</td>
                        <td className={tdClass}>{v.comentarios || '-'}</td>
                        <td className={tdClass}>{v.num_cuotas || '-'}</td>
                        <td className={tdClass}>{v.fechas_pago || '-'}</td>
                        <td className={tdClass}>
                          <span className={'text-xs px-2 py-1 rounded-full text-white ' + (v.status === 'verde' ? 'bg-green-600' : v.status === 'naranja' ? 'bg-orange-500' : v.status === 'rojo' ? 'bg-red-600' : 'bg-gray-600')}>{v.status || '-'}</span>
                        </td>
                        <td className={tdClass}><button onClick={() => eliminarVenta(v.id)} className="text-red-400 hover:text-red-300 text-lg">🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-800 border-t border-gray-700">
                      <td colSpan={5} className="px-3 py-3 text-xs text-gray-400 font-bold uppercase">Totales</td>
                      <td className="px-3 py-3 text-sm font-bold text-green-400">S/ {totalVentas.toFixed(2)}</td>
                      <td className="px-3 py-3 text-sm font-bold text-yellow-400">S/ {totalImpuesto.toFixed(2)}</td>
                      <td colSpan={12}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── COMPRAS ── */}
          {tab === 'compras' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-700 grid grid-cols-2 md:grid-cols-6 gap-2">
                <input placeholder="Empresa..." value={filtroCompras.empresa} onChange={e => setFiltroCompras({...filtroCompras, empresa: e.target.value})} className={filterClass} />
                <input placeholder="Fecha..." value={filtroCompras.fecha} onChange={e => setFiltroCompras({...filtroCompras, fecha: e.target.value})} className={filterClass} />
                <input placeholder="Producto..." value={filtroCompras.producto} onChange={e => setFiltroCompras({...filtroCompras, producto: e.target.value})} className={filterClass} />
                <input placeholder="Comentario..." value={filtroCompras.comentario} onChange={e => setFiltroCompras({...filtroCompras, comentario: e.target.value})} className={filterClass} />
                <input placeholder="Guía..." value={filtroCompras.guia} onChange={e => setFiltroCompras({...filtroCompras, guia: e.target.value})} className={filterClass} />
                <input placeholder="Monto..." value={filtroCompras.monto} onChange={e => setFiltroCompras({...filtroCompras, monto: e.target.value})} className={filterClass} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className={thClass}>Empresa</th>
                      <th className={thClass}>Fecha</th>
                      <th className={thClass}>Producto / Servicio</th>
                      <th className={thClass}>Comentario</th>
                      <th className={thClass}>Guía / Factura</th>
                      <th className={thClass}>Monto</th>
                      <th className={thClass}>Impuesto 18%</th>
                      <th className={thClass}>Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargando ? (
                      <tr><td colSpan={8} className="text-center text-gray-400 py-12">Cargando...</td></tr>
                    ) : comprasFiltradas.length === 0 ? (
                      <tr><td colSpan={8} className="text-center text-gray-400 py-12">No hay registros</td></tr>
                    ) : comprasFiltradas.map(c => (
                      <tr key={c.id} className="border-t border-gray-800 hover:bg-gray-800">
                        <td className={tdClass}>{c.empresa_proveedor || '-'}</td>
                        <td className={tdClass}>{c.fecha}</td>
                        <td className={tdClass}>{c.producto_servicio || '-'}</td>
                        <td className={tdClass}>{c.comentario || '-'}</td>
                        <td className={tdClass}>{c.guia_factura || '-'}</td>
                        <td className={tdClass + ' text-red-400 font-bold'}>S/ {Number(c.monto||0).toFixed(2)}</td>
                        <td className={tdClass + ' text-yellow-400'}>S/ {Number(c.impuesto||(c.monto*0.18)||0).toFixed(2)}</td>
                        <td className={tdClass}><button onClick={() => eliminarCompra(c.id)} className="text-red-400 hover:text-red-300 text-lg">🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-800 border-t border-gray-700">
                      <td colSpan={5} className="px-3 py-3 text-xs text-gray-400 font-bold uppercase">Totales</td>
                      <td className="px-3 py-3 text-sm font-bold text-red-400">S/ {totalCompras.toFixed(2)}</td>
                      <td className="px-3 py-3 text-sm font-bold text-yellow-400">S/ {comprasFiltradas.reduce((s,c) => s+(c.impuesto||c.monto*0.18||0),0).toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── RENTA ── */}
          {tab === 'renta' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <select value={filtroRentaMes} onChange={e => setFiltroRentaMes(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="todos">Todos los meses</option>
                  {meses.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className={thClass}>Mes</th>
                      <th className={thClass}>Total Ventas</th>
                      <th className={thClass}>Total Compras</th>
                      <th className={thClass}>Renta (Ventas - Compras)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentaPorMes.map(r => (
                      <tr key={r.mes} className="border-t border-gray-800 hover:bg-gray-800">
                        <td className={tdClass + ' font-medium'}>{r.mes}</td>
                        <td className={tdClass + ' text-green-400'}>S/ {r.ventas.toFixed(2)}</td>
                        <td className={tdClass + ' text-red-400'}>S/ {r.compras.toFixed(2)}</td>
                        <td className={'px-3 py-3 text-sm font-bold ' + (r.renta >= 0 ? 'text-blue-400' : 'text-red-500')}>S/ {r.renta.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-800 border-t border-gray-700">
                      <td className="px-3 py-3 text-xs text-gray-400 font-bold uppercase">Total Renta</td>
                      <td className="px-3 py-3 text-sm font-bold text-green-400">S/ {rentaPorMes.reduce((s,r)=>s+r.ventas,0).toFixed(2)}</td>
                      <td className="px-3 py-3 text-sm font-bold text-red-400">S/ {rentaPorMes.reduce((s,r)=>s+r.compras,0).toFixed(2)}</td>
                      <td className={'px-3 py-3 text-sm font-bold ' + (rentaPorMes.reduce((s,r)=>s+r.renta,0)>=0?'text-blue-400':'text-red-500')}>
                        S/ {rentaPorMes.reduce((s,r)=>s+r.renta,0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── IMPUESTOS ── */}
          {tab === 'impuestos' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Calculadora de impuestos — Perú</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Ventas del mes S/</label>
                    <input type="number" value={ventasImp} onChange={e => setVentasImp(e.target.value)} placeholder="0.00" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Compras / Gastos S/</label>
                    <input type="number" value={comprasImp} onChange={e => setComprasImp(e.target.value)} placeholder="0.00" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Régimen tributario</label>
                    <select value={regimen} onChange={e => setRegimen(e.target.value)} className={inputClass}>
                      <option value="NRUS">NRUS (Simplificado)</option>
                      <option value="RER">RER (Régimen Especial)</option>
                      <option value="RMT">RMT (MYPE Tributario)</option>
                      <option value="RG">Régimen General</option>
                    </select>
                  </div>
                </div>
                <button onClick={calcular} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
                  Calcular impuestos
                </button>
              </div>

              {calculado && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Ventas</p>
                      <p className="text-xl font-bold text-green-400">S/ {calculado.ventas.toLocaleString('es-PE',{minimumFractionDigits:2})}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Compras</p>
                      <p className="text-xl font-bold text-orange-400">S/ {calculado.compras.toLocaleString('es-PE',{minimumFractionDigits:2})}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Total impuestos</p>
                      <p className="text-xl font-bold text-red-400">S/ {(calculado.totalImpuestos||0).toLocaleString('es-PE',{minimumFractionDigits:2})}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Utilidad neta</p>
                      <p className={'text-xl font-bold ' + (calculado.utilidadNeta>=0?'text-blue-400':'text-red-400')}>S/ {(calculado.utilidadNeta||0).toLocaleString('es-PE',{minimumFractionDigits:2})}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Detalle de impuestos — {calculado.regimen}</h3>
                    <div className="space-y-3">
                      {calculado.regimen === 'NRUS' && (
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                          <span className="text-sm text-gray-300">Cuota fija mensual</span>
                          <span className="font-bold text-red-400">S/ {(calculado.cuota||0).toFixed(2)}</span>
                        </div>
                      )}
                      {calculado.igvVentas !== undefined && (
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                          <span className="text-sm text-gray-300">IGV ventas (18%)</span>
                          <span className="text-yellow-400">S/ {(calculado.igvVentas||0).toFixed(2)}</span>
                        </div>
                      )}
                      {calculado.igvCompras !== undefined && (
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                          <span className="text-sm text-gray-300">IGV compras — crédito fiscal</span>
                          <span className="text-green-400">- S/ {(calculado.igvCompras||0).toFixed(2)}</span>
                        </div>
                      )}
                      {calculado.igv !== undefined && (
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                          <span className="text-sm font-medium">IGV a pagar</span>
                          <span className="font-bold text-red-400">S/ {(calculado.igv||0).toFixed(2)}</span>
                        </div>
                      )}
                      {(calculado.renta || calculado.rentaMensual) && (
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                          <span className="text-sm text-gray-300">Renta mensual ({calculado.regimen==='RMT'?'1%':'1.5%'} de ventas)</span>
                          <span className="text-red-400">S/ {(calculado.renta||calculado.rentaMensual||0).toFixed(2)}</span>
                        </div>
                      )}
                      {calculado.rentaAnual !== undefined && (
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                          <span className="text-sm text-gray-300">Renta anual estimada (mensualizado)</span>
                          <span className="text-orange-400">S/ {(calculado.rentaAnual||0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-bold">Total impuestos del mes</span>
                        <span className="text-lg font-bold text-red-400">S/ {(calculado.totalImpuestos||0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className={'mt-4 rounded-lg p-3 text-sm ' + (calculado.totalImpuestos/calculado.ventas>0.2 ? 'bg-red-900 border border-red-700 text-red-300' : 'bg-green-900 border border-green-700 text-green-300')}>
                      {calculado.totalImpuestos/calculado.ventas>0.2
                        ? '⚠️ Estás pagando más del 20% de tus ventas en impuestos. Considera revisar tu régimen tributario.'
                        : '✅ Tu carga tributaria está dentro de un rango saludable para tu nivel de ventas.'}
                    </div>
                  </div>

                  {ventasImp && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                      <h3 className="font-semibold mb-4">Simulador — ¿En qué régimen pagarías menos?</h3>
                      <div className="space-y-3">
                        {simular().map((r, i) => (
                          <div key={r.regimen} className={'flex justify-between items-center p-3 rounded-lg border ' + (i===0?'border-green-600 bg-green-900':'border-gray-700 bg-gray-800')}>
                            <div>
                              <p className={'text-sm font-medium ' + (i===0?'text-green-400':'text-white')}>{i===0?'🏆 ':''}{r.regimen}</p>
                              <p className="text-xs text-gray-400">{r.detalle}</p>
                            </div>
                            <div className="text-right">
                              <p className={'font-bold ' + (i===0?'text-green-400':'text-white')}>S/ {r.total.toFixed(2)}</p>
                              {i===0 && <p className="text-xs text-green-400">Más eficiente</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">* Simulación referencial. Consulta con un contador para decisiones formales.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal agregar venta */}
      {mostrarVenta && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Agregar venta</h3>
              <button onClick={() => setMostrarVenta(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
                  <input type="date" value={nuevaVenta.fecha} onChange={e => setNuevaVenta({...nuevaVenta, fecha: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                  <input type="text" value={nuevaVenta.cliente} onChange={e => setNuevaVenta({...nuevaVenta, cliente: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Guía / Factura</label>
                  <input type="text" value={nuevaVenta.guia_factura} onChange={e => setNuevaVenta({...nuevaVenta, guia_factura: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto de venta S/</label>
                  <input type="number" value={nuevaVenta.monto_venta} onChange={e => setNuevaVenta({...nuevaVenta, monto_venta: e.target.value})} className={inputClass} />
                </div>
              </div>
              {nuevaVenta.monto_venta && (
                <div className="bg-yellow-900 border border-yellow-700 rounded-lg px-4 py-2">
                  <p className="text-yellow-400 text-sm">Impuesto 18%: <span className="font-bold">S/ {(parseFloat(nuevaVenta.monto_venta)*0.18).toFixed(2)}</span></p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Comentarios</label>
                <textarea value={nuevaVenta.comentarios} onChange={e => setNuevaVenta({...nuevaVenta, comentarios: e.target.value})} className={inputClass + ' h-20'} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarVenta(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarVenta} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar compra */}
      {mostrarCompra && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Agregar compra</h3>
              <button onClick={() => setMostrarCompra(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Empresa</label>
                  <input type="text" value={nuevaCompra.empresa_proveedor} onChange={e => setNuevaCompra({...nuevaCompra, empresa_proveedor: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
                  <input type="date" value={nuevaCompra.fecha} onChange={e => setNuevaCompra({...nuevaCompra, fecha: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Producto / Servicio</label>
                  <input type="text" value={nuevaCompra.producto_servicio} onChange={e => setNuevaCompra({...nuevaCompra, producto_servicio: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Guía / Factura</label>
                  <input type="text" value={nuevaCompra.guia_factura} onChange={e => setNuevaCompra({...nuevaCompra, guia_factura: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" value={nuevaCompra.monto} onChange={e => setNuevaCompra({...nuevaCompra, monto: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Comentario</label>
                  <input type="text" value={nuevaCompra.comentario} onChange={e => setNuevaCompra({...nuevaCompra, comentario: e.target.value})} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarCompra(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarCompra} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}