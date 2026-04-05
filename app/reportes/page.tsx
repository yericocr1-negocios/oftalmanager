'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase, getEmpresaId } from '../../lib/supabase'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

interface DetalleItem {
  nombre: string
  ventas: number
  monto: number
}

export default function Reportes() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [ventasDia, setVentasDia] = useState<{dia: string, ventas: number, fecha: string}[]>([])
  const [ventasMes, setVentasMes] = useState<{mes: string, ventas: number}[]>([])
  const [ventasEsp, setVentasEsp] = useState<any[]>([])
  const [cajaSemana, setCajaSemana] = useState<any[]>([])
  const [cajaMes, setCajaMes] = useState<{mes: string, ventas: number}[]>([])
  const [modoDia, setModoDia] = useState('dia')
  const [modoDetalle, setModoDetalle] = useState('vendedor')
  const [totalIngresos, setTotalIngresos] = useState(0)
  const [totalVentas, setTotalVentas] = useState(0)
  const [ticketPromedio, setTicketPromedio] = useState(0)
  const [totalClientes, setTotalClientes] = useState(0)

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    const eid = await getEmpresaId()
    cargarDatos(eid)
  }

  const cargarDatos = async (eid: string|null) => {
    setCargando(true)

    const hoy = new Date()
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - 6)

    // Cargar caja (para graficos de dia y mes)
    let sedeIds: string[] = []
    if (eid) {
      const { data: sedes } = await supabase.from('sedes').select('id').eq('empresa_id', eid)
      sedeIds = sedes?.map((s: any) => s.id) || []
    }

    let cajaData: any[] = []
    if (sedeIds.length > 0) {
      const { data } = await supabase.from('caja').select('*').eq('tipo', 'ingreso').in('sede_id', sedeIds)
      cajaData = data || []
    } else if (!eid) {
      const { data } = await supabase.from('caja').select('*').eq('tipo', 'ingreso')
      cajaData = data || []
    }

    // Grafico por dia (ultimos 7 dias desde caja)
    const diasSemana = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy)
      d.setDate(hoy.getDate() - i)
      const diaStr = d.toISOString().split('T')[0]
      const nombre = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'][d.getDay()]
      const total = cajaData.filter((m: any) => m.fecha?.startsWith(diaStr)).reduce((sum: number, m: any) => sum + (m.monto || 0), 0)
      diasSemana.push({ dia: nombre, ventas: total, fecha: diaStr })
    }
    setVentasDia(diasSemana)
    setTotalIngresos(cajaData.reduce((sum: number, m: any) => sum + (m.monto || 0), 0))

    // Grafico por mes desde caja
    const ventasPorMesCaja = meses.map(mes => {
      const mesIndex = meses.indexOf(mes)
      const total = cajaData.filter((m: any) => {
        if (!m.fecha) return false
        const fecha = new Date(m.fecha)
        return fecha.getMonth() === mesIndex
      }).reduce((sum: number, m: any) => sum + (m.monto || 0), 0)
      return { mes, ventas: total }
    })
    setCajaMes(ventasPorMesCaja)

    // Ventas especializadas
    const espQuery = supabase.from('ventas_especializadas').select('*')
    if (eid) espQuery.eq('empresa_id', eid)
    const { data: espData } = await espQuery
    const esp = espData || []
    setVentasEsp(esp)
    setTotalVentas(esp.length)
    setTicketPromedio(esp.length > 0 ? Math.round(esp.reduce((sum: number, v: any) => sum + (v.monto || 0), 0) / esp.length) : 0)

    const ventasPorMes = meses.map(mes => ({
      mes,
      ventas: esp.filter((v: any) => v.mes === mes).reduce((sum: number, v: any) => sum + (v.monto || 0), 0)
    }))
    setVentasMes(ventasPorMes)

    // Total clientes
    if (eid) {
      const { count } = await supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('empresa_id', eid)
      setTotalClientes(count || 0)
    }

    setCargando(false)
  }

  const getDetalleData = (): DetalleItem[] => {
    const acumulado: Record<string, DetalleItem> = {}
    ventasEsp.forEach((v: any) => {
      let key = ''
      if (modoDetalle === 'ciudad') key = v.ciudad || 'Sin ciudad'
      else if (modoDetalle === 'doctor') key = v.facturado_por || 'Sin doctor'
      else if (modoDetalle === 'cliente') key = v.cliente || 'Sin cliente'
      else key = v.vendedor || 'Sin vendedor'
      if (!acumulado[key]) acumulado[key] = { nombre: key, ventas: 0, monto: 0 }
      acumulado[key].ventas++
      acumulado[key].monto += v.monto || 0
    })
    return Object.values(acumulado).sort((a, b) => b.monto - a.monto).slice(0, 6)
  }

  const detalleData = getDetalleData()
  const maxDetalle = detalleData.length > 0 ? Math.max(...detalleData.map(d => d.monto)) : 1

  const datosGrafico = modoDia === 'dia' ? ventasDia : cajaMes.filter(m => m.ventas > 0)
  const maxGrafico = datosGrafico.length > 0 ? Math.max(...datosGrafico.map((v: any) => v.ventas), 1) : 1

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex items-center gap-3">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
          <div>
            <h2 className="text-base md:text-lg font-semibold">Reportes</h2>
            <p className="text-xs md:text-sm text-gray-400">Datos en tiempo real desde Caja y Ventas</p>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {cargando ? (
            <div className="text-center text-gray-400 py-12">Cargando reportes...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                {[
                  { label: 'Total ingresos caja', value: 'S/ ' + totalIngresos.toLocaleString(), color: 'text-green-400', icon: '💰' },
                  { label: 'Ventas especializadas', value: totalVentas.toString(), color: 'text-blue-400', icon: '🛒' },
                  { label: 'Ticket promedio', value: 'S/ ' + ticketPromedio.toLocaleString(), color: 'text-purple-400', icon: '🎫' },
                  { label: 'Total clientes', value: totalClientes.toString(), color: 'text-yellow-400', icon: '👥' },
                ].map((card) => (
                  <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-5">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-gray-400">{card.label}</p>
                      <span className="text-base md:text-xl">{card.icon}</span>
                    </div>
                    <p className={'text-lg md:text-2xl font-bold ' + card.color}>{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="font-semibold text-sm md:text-base">
                      Ingresos {modoDia === 'dia' ? 'ultimos 7 dias' : 'por mes'} (Caja)
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={() => setModoDia('dia')} className={'px-2 md:px-3 py-1 rounded-lg text-xs ' + (modoDia === 'dia' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400')}>7 dias</button>
                      <button onClick={() => setModoDia('mes')} className={'px-2 md:px-3 py-1 rounded-lg text-xs ' + (modoDia === 'mes' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400')}>Por mes</button>
                    </div>
                  </div>
                  {datosGrafico.length === 0 || datosGrafico.every((v: any) => v.ventas === 0) ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <p className="text-2xl mb-2">📊</p>
                      <p>No hay ingresos en Caja para mostrar</p>
                    </div>
                  ) : (
                    <div className="flex items-end gap-1 md:gap-2 h-36 md:h-44">
                      {datosGrafico.map((v: any, i: number) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <p className="text-xs text-gray-500 hidden md:block truncate w-full text-center">S/{(v.ventas||0).toLocaleString()}</p>
                          <div
                            className="w-full bg-blue-600 rounded-t-md transition-all hover:bg-blue-500"
                            style={{ height: (v.ventas||0) > 0 ? Math.max(((v.ventas||0) / maxGrafico * 100), 5) + '%' : '2px', opacity: (v.ventas||0) > 0 ? 1 : 0.2 }}
                          ></div>
                          <p className="text-xs text-gray-400 truncate w-full text-center">{modoDia === 'dia' ? v.dia : v.mes?.slice(0,3)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-sm md:text-base">
                      Por {modoDetalle === 'ciudad' ? 'ciudad' : modoDetalle === 'doctor' ? 'doctor' : modoDetalle === 'cliente' ? 'cliente' : 'vendedor'}
                    </h3>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {['vendedor', 'ciudad', 'doctor', 'cliente'].map(modo => (
                        <button key={modo} onClick={() => setModoDetalle(modo)} className={'px-2 py-1 rounded-lg text-xs ' + (modoDetalle === modo ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400')}>
                          {modo.charAt(0).toUpperCase() + modo.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {detalleData.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <p className="text-2xl mb-2">📋</p>
                      <p>No hay datos disponibles</p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {detalleData.map((d, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs md:text-sm mb-1">
                            <span className="truncate mr-2 font-medium">{d.nombre}</span>
                            <span className="text-green-400 flex-shrink-0">S/ {d.monto.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: (d.monto / maxDetalle * 100) + '%' }}></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{d.ventas} {d.ventas === 1 ? 'venta' : 'ventas'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
                <h3 className="font-semibold mb-4 text-sm md:text-base">Ventas especializadas por mes</h3>
                {ventasMes.every(m => m.ventas === 0) ? (
                  <div className="text-center text-gray-500 text-sm py-6">
                    <p>No hay ventas especializadas registradas</p>
                  </div>
                ) : (
                  <>
                    <div className="md:hidden space-y-2">
                      {ventasMes.filter(m => m.ventas > 0).map((m) => (
                        <div key={m.mes} className="flex justify-between items-center py-1">
                          <span className="text-sm">{m.mes}</span>
                          <span className="text-green-400 font-bold text-sm">S/ {m.ventas.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <table className="w-full hidden md:table">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 text-xs text-gray-400 uppercase">Mes</th>
                          <th className="text-left py-3 text-xs text-gray-400 uppercase">Ingresos</th>
                          <th className="text-left py-3 text-xs text-gray-400 uppercase">Participacion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventasMes.filter(m => m.ventas > 0).map((m) => {
                          const totalAnio = ventasMes.reduce((s, x) => s + x.ventas, 0)
                          const maxMes = Math.max(...ventasMes.map(x => x.ventas), 1)
                          return (
                            <tr key={m.mes} className="border-b border-gray-800 hover:bg-gray-800">
                              <td className="py-3 text-sm">{m.mes}</td>
                              <td className="py-3 text-sm text-green-400 font-bold">S/ {m.ventas.toLocaleString()}</td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: (m.ventas / maxMes * 100) + '%' }}></div>
                                  </div>
                                  <span className="text-xs text-gray-400 w-8">{Math.round(m.ventas / Math.max(totalAnio, 1) * 100)}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}