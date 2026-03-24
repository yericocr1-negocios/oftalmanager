'use client'
import { useState } from 'react'
import Sidebar from '../../components/Sidebar'

const movimientosIniciales = [
  { id: 1, fecha: '2024-01-15', hora: '09:30', cliente: 'Juan Perez', concepto: 'Venta - Lentes', sucursal: 'Lima', numero: 'OP-001', metodo: 'yape', tipo: 'ingreso', monto: 350 },
  { id: 2, fecha: '2024-01-15', hora: '10:15', cliente: 'Maria Lopez', concepto: 'Consulta General', sucursal: 'Lima', numero: 'OP-002', metodo: 'efectivo', tipo: 'ingreso', monto: 120 },
  { id: 3, fecha: '2024-01-15', hora: '11:00', cliente: 'Proveedor Optico', concepto: 'Compra monturas', sucursal: 'Lima', numero: 'OP-003', metodo: 'transferencia', tipo: 'egreso', monto: 800 },
  { id: 4, fecha: '2024-01-15', hora: '15:00', cliente: 'Ana Flores', concepto: 'Cirugia Catarata', sucursal: 'Lima', numero: 'OP-004', metodo: 'transferencia', tipo: 'ingreso', monto: 2500 },
]

const cobrarIniciales = [
  { id: 1, cliente: 'Juan Perez', empresa: '', tipo: 'paciente', dni: '12345678', telefono: '999888777', tipoIngreso: 'lentes', descripcion: 'Lentes progresivos', total: 850, pagado: 400, cuotas: 2, estado: 'parcial', fechaVenta: '2024-01-10', fechaVencimiento: '2024-02-10', vendedor: 'Luis', sede: 'Lima', comprobante: 'boleta', numeroComp: 'B001-00123' },
  { id: 2, cliente: 'Empresa Vision SAC', empresa: 'Vision SAC', tipo: 'empresa', dni: '20123456789', telefono: '01-234-5678', tipoIngreso: 'consulta', descripcion: 'Consultas corporativas', total: 2400, pagado: 0, cuotas: 3, estado: 'pendiente', fechaVenta: '2024-01-12', fechaVencimiento: '2024-01-30', vendedor: 'Ana', sede: 'Lima', comprobante: 'factura', numeroComp: 'F001-00045' },
]

const pagarIniciales = [
  { id: 1, proveedor: 'Laboratorio Optico SA', empresa: 'Lab Optico', ruc: '20567890123', tipoProveedor: 'laboratorio', producto: 'Lunas progresivas', cantidad: 50, costoUnitario: 45, total: 2250, pagado: 1000, estado: 'parcial', fechaCompra: '2024-01-05', fechaVencimiento: '2024-02-05', sede: 'Lima', numeroFactura: 'F001-00234' },
  { id: 2, proveedor: 'Importadora Monturas Peru', empresa: 'IMP Peru', ruc: '20456789012', tipoProveedor: 'monturas', producto: 'Monturas titanio', cantidad: 30, costoUnitario: 85, total: 2550, pagado: 0, estado: 'pendiente', fechaCompra: '2024-01-08', fechaVencimiento: '2024-01-25', sede: 'Arequipa', numeroFactura: 'F002-00089' },
]

export default function Finanzas() {
  const [tab, setTab] = useState('caja')
  const [movimientos, setMovimientos] = useState(movimientosIniciales)
  const [cobrar, setCobrar] = useState(cobrarIniciales)
  const [pagar, setPagar] = useState(pagarIniciales)
  const [mostrarMov, setMostrarMov] = useState(false)
  const [mostrarCobrar, setMostrarCobrar] = useState(false)
  const [mostrarPagar, setMostrarPagar] = useState(false)

  const [nuevoMov, setNuevoMov] = useState({ cliente: '', concepto: '', sucursal: '', numero: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0 })
  const [nuevoCobrar, setNuevoCobrar] = useState({ cliente: '', empresa: '', tipo: 'paciente', dni: '', telefono: '', tipoIngreso: 'consulta', descripcion: '', total: 0, cuotas: 1, fechaVencimiento: '', vendedor: '', sede: '', comprobante: 'boleta', numeroComp: '' })
  const [nuevoPagar, setNuevoPagar] = useState({ proveedor: '', empresa: '', ruc: '', tipoProveedor: 'laboratorio', producto: '', cantidad: 0, costoUnitario: 0, fechaVencimiento: '', sede: '', numeroFactura: '' })

  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0)
  const egresos = movimientos.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0)
  const totalCobrar = cobrar.reduce((sum, c) => sum + (c.total - c.pagado), 0)
  const totalPagar = pagar.reduce((sum, c) => sum + (c.total - c.pagado), 0)

  const estadoColor = {
    pendiente: 'bg-yellow-900 text-yellow-400',
    parcial: 'bg-blue-900 text-blue-400',
    pagado: 'bg-green-900 text-green-400',
    vencido: 'bg-red-900 text-red-400',
  }

  const guardarMov = () => {
    const ahora = new Date()
    setMovimientos([...movimientos, { ...nuevoMov, id: movimientos.length + 1, fecha: ahora.toISOString().split('T')[0], hora: ahora.toTimeString().slice(0, 5) }])
    setMostrarMov(false)
    setNuevoMov({ cliente: '', concepto: '', sucursal: '', numero: '', metodo: 'efectivo', tipo: 'ingreso', monto: 0 })
  }

  const guardarCobrar = () => {
    setCobrar([...cobrar, { ...nuevoCobrar, id: cobrar.length + 1, pagado: 0, estado: 'pendiente', fechaVenta: new Date().toISOString().split('T')[0] }])
    setMostrarCobrar(false)
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
            <p className="text-sm text-gray-400">Control financiero completo</p>
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
              <p className="text-xs text-gray-400 mb-1">Ingresos hoy</p>
              <p className="text-2xl font-bold text-green-400">S/ {ingresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Egresos hoy</p>
              <p className="text-2xl font-bold text-red-400">S/ {egresos.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Por cobrar</p>
              <p className="text-2xl font-bold text-yellow-400">S/ {totalCobrar.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Por pagar</p>
              <p className="text-2xl font-bold text-orange-400">S/ {totalPagar.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            {['caja', 'cobrar', 'pagar'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 rounded-lg text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'caja' ? 'Caja' : t === 'cobrar' ? 'Cuentas por cobrar' : 'Cuentas por pagar'}
              </button>
            ))}
          </div>

          {tab === 'caja' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Dia / Hora</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Concepto</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Sucursal</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">N° Operacion</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Metodo</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => (
                    <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-4 py-3 text-xs text-gray-400">{m.fecha} {m.hora}</td>
                      <td className="px-4 py-3 text-sm">{m.cliente || '-'}</td>
                      <td className="px-4 py-3 text-sm">{m.concepto}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{m.sucursal || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{m.numero || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300 capitalize">{m.metodo}</td>
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
            </div>
          )}

          {tab === 'cobrar' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Descripcion</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Total</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Pagado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Pendiente</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Vence</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Estado</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cobrar.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{c.cliente}</p>
                        <p className="text-xs text-gray-400">{c.dni}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 capitalize">{c.tipo}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.descripcion}</td>
                      <td className="px-4 py-3 text-sm font-medium">S/ {c.total}</td>
                      <td className="px-4 py-3 text-sm text-green-400">S/ {c.pagado}</td>
                      <td className="px-4 py-3 text-sm text-yellow-400">S/ {c.total - c.pagado}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{c.fechaVencimiento}</td>
                      <td className="px-4 py-3">
                        <span className={'text-xs px-2 py-1 rounded-full ' + estadoColor[c.estado]}>{c.estado}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-blue-400 hover:text-blue-300 text-xs mr-2">Registrar pago</button>
                        <button className="text-green-400 hover:text-green-300 text-xs">WhatsApp</button>
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
                    <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagar.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{c.proveedor}</p>
                        <p className="text-xs text-gray-400">{c.ruc}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 capitalize">{c.tipoProveedor}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.producto}</td>
                      <td className="px-4 py-3 text-sm font-medium">S/ {c.total}</td>
                      <td className="px-4 py-3 text-sm text-green-400">S/ {c.pagado}</td>
                      <td className="px-4 py-3 text-sm text-yellow-400">S/ {c.total - c.pagado}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{c.fechaVencimiento}</td>
                      <td className="px-4 py-3">
                        <span className={'text-xs px-2 py-1 rounded-full ' + estadoColor[c.estado]}>{c.estado}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-blue-400 hover:text-blue-300 text-xs mr-2">Registrar pago</button>
                        <button className="text-gray-400 hover:text-gray-300 text-xs">Ver detalle</button>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Sucursal</label>
                  <input type="text" value={nuevoMov.sucursal} onChange={(e) => setNuevoMov({...nuevoMov, sucursal: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">N° Operacion</label>
                  <input type="text" value={nuevoMov.numero} onChange={(e) => setNuevoMov({...nuevoMov, numero: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
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

      {mostrarCobrar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-auto py-8">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva cuenta por cobrar</h3>
              <button onClick={() => setMostrarCobrar(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre del cliente</label>
                  <input type="text" onChange={(e) => setNuevoCobrar({...nuevoCobrar, cliente: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo de cliente</label>
                  <select onChange={(e) => setNuevoCobrar({...nuevoCobrar, tipo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="paciente">Paciente</option>
                    <option value="empresa">Empresa</option>
                    <option value="optica">Optica</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">DNI / RUC</label>
                  <input type="text" onChange={(e) => setNuevoCobrar({...nuevoCobrar, dni: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Telefono</label>
                  <input type="text" onChange={(e) => setNuevoCobrar({...nuevoCobrar, telefono: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo de ingreso</label>
                  <select onChange={(e) => setNuevoCobrar({...nuevoCobrar, tipoIngreso: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="consulta">Consulta</option>
                    <option value="lentes">Lentes</option>
                    <option value="cirugia">Cirugia</option>
                    <option value="tratamiento">Tratamiento</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Comprobante</label>
                  <select onChange={(e) => setNuevoCobrar({...nuevoCobrar, comprobante: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="boleta">Boleta</option>
                    <option value="factura">Factura</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Descripcion</label>
                <input type="text" onChange={(e) => setNuevoCobrar({...nuevoCobrar, descripcion: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Total S/</label>
                  <input type="number" onChange={(e) => setNuevoCobrar({...nuevoCobrar, total: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">N° cuotas</label>
                  <input type="number" defaultValue={1} onChange={(e) => setNuevoCobrar({...nuevoCobrar, cuotas: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha vencimiento</label>
                  <input type="date" onChange={(e) => setNuevoCobrar({...nuevoCobrar, fechaVencimiento: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarCobrar(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarCobrar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
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