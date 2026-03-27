'use client'
import { useState, useEffect } from 'react'
import { supabase, getEmpresaId } from '../lib/supabase'
import Sidebar from '../components/Sidebar'

export default function Home() {
  const [ventasHoy, setVentasHoy] = useState(0)
  const [ventasMes, setVentasMes] = useState(0)
  const [clientesTotal, setClientesTotal] = useState(0)
  const [ultimasVentas, setUltimasVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState(null)

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    setCargando(true)
    const eid = await getEmpresaId()
    setEmpresaId(eid)

    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString()

    const { data: ventasHoyData } = await supabase
      .from('caja').select('monto').eq('tipo', 'ingreso').gte('fecha', inicioHoy)
    setVentasHoy(ventasHoyData?.reduce((sum, v) => sum + v.monto, 0) || 0)

    const { data: ventasMesData } = await supabase
      .from('caja').select('monto').eq('tipo', 'ingreso').gte('fecha', inicioMes)
    setVentasMes(ventasMesData?.reduce((sum, v) => sum + v.monto, 0) || 0)

    const { data: clientesData } = await supabase
      .from('pacientes').select('id', { count: 'exact' })
    setClientesTotal(clientesData?.length || 0)

    const { data: ultimasData } = await supabase
      .from('caja').select('*').eq('tipo', 'ingreso')
      .order('fecha', { ascending: false }).limit(5)
    setUltimasVentas(ultimasData || [])

    setCargando(false)
  }

  const accesos = [
    { label: 'Nuevo cliente', href: '/pacientes', color: 'bg-blue-600 hover:bg-blue-700', icon: '👤' },
    { label: 'Nueva cita', href: '/agenda', color: 'bg-purple-600 hover:bg-purple-700', icon: '📅' },
    { label: 'Nueva venta', href: '/ventas', color: 'bg-green-600 hover:bg-green-700', icon: '💰' },
    { label: 'Control ventas', href: '/control-ventas', color: 'bg-pink-600 hover:bg-pink-700', icon: '📊' },
  ]

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white">☰</button>
            <div>
              <h2 className="text-base md:text-lg font-semibold">Dashboard</h2>
              <p className="text-xs md:text-sm text-gray-400">Bienvenido a OFTALMANAGER</p>
            </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }} className="text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800">
            Cerrar sesion
          </button>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[
              { label: 'Ventas hoy', value: 'S/ ' + ventasHoy.toLocaleString(), icon: '💰', color: 'text-green-400' },
              { label: 'Ingresos mes', value: 'S/ ' + ventasMes.toLocaleString(), icon: '📈', color: 'text-blue-400' },
              { label: 'Total clientes', value: clientesTotal.toString(), icon: '👤', color: 'text-orange-400' },
              { label: 'Mi empresa', value: empresaId ? '✓ Activo' : 'Sin empresa', icon: '🏥', color: empresaId ? 'text-green-400' : 'text-red-400' },
            ].map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5">
                <div className="flex justify-between items-start mb-2 md:mb-3">
                  <p className="text-xs text-gray-400">{card.label}</p>
                  <span className="text-lg md:text-xl">{card.icon}</span>
                </div>
                <p className={'text-xl md:text-2xl font-bold ' + card.color}>
                  {cargando ? '...' : card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5">
              <h3 className="font-semibold mb-4 text-sm md:text-base">Accesos rapidos</h3>
              <div className="grid grid-cols-2 gap-3">
                {accesos.map((btn) => (
                  <a key={btn.label} href={btn.href} className={'text-white text-xs md:text-sm px-3 md:px-4 py-3 rounded-lg text-center transition-all flex flex-col items-center gap-1 ' + btn.color}>
                    <span className="text-xl">{btn.icon}</span>
                    <span>{btn.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5">
              <h3 className="font-semibold mb-4 text-sm md:text-base">Ultimos ingresos</h3>
              {cargando ? (
                <p className="text-gray-400 text-sm">Cargando...</p>
              ) : ultimasVentas.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No hay ventas registradas aun</p>
              ) : (
                <div className="space-y-3">
                  {ultimasVentas.map((v) => (
                    <div key={v.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-xs md:text-sm font-medium">{v.cliente_nombre || 'Cliente'}</p>
                        <p className="text-xs text-gray-400">{v.concepto || '-'}</p>
                      </div>
                      <span className="text-green-400 font-bold text-sm">S/ {v.monto}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}