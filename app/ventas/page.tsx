'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const menu = [
  { icon: '🏠', label: 'Dashboard', href: '/' },
  { icon: '👤', label: 'Pacientes', href: '/pacientes' },
  { icon: '📅', label: 'Agenda', href: '/agenda' },
  { icon: '💰', label: 'Ventas diarias', href: '/ventas' },
  { icon: '📦', label: 'Inventario', href: '/inventario' },
  { icon: '💳', label: 'Finanzas', href: '/finanzas' },
  { icon: '📊', label: 'Reportes', href: '/reportes' },
  { icon: '⚙️', label: 'Config', href: '/configuracion' },
]

const EMPRESA_ID = 'b2711600-fbf7-4f11-b699-8024e36c7cf5'
const SEDE_ID = 'd976f6cb-01f1-4962-a728-1a1012ffc305'

const productosDisponibles = [
  { id: 1, nombre: 'Consulta General', precio: 80, categoria: 'Servicio' },
  { id: 2, nombre: 'Consulta Especializada', precio: 120, categoria: 'Servicio' },
  { id: 3, nombre: 'Consulta de Contactologia', precio: 100, categoria: 'Servicio' },
  { id: 4, nombre: 'Topografia Corneal', precio: 150, categoria: 'Examen' },
  { id: 5, nombre: 'Campo Visual', precio: 120, categoria: 'Examen' },
  { id: 6, nombre: 'OCT Retina', precio: 200, categoria: 'Examen' },
  { id: 7, nombre: 'Ecografia Ocular', precio: 180, categoria: 'Examen' },
  { id: 8, nombre: 'Montura Ray-Ban', precio: 350, categoria: 'Montura' },
  { id: 9, nombre: 'Montura Oakley', precio: 420, categoria: 'Montura' },
  { id: 10, nombre: 'Montura Economica', precio: 80, categoria: 'Montura' },
  { id: 11, nombre: 'Luna Antireflex Simple', precio: 180, categoria: 'Luna' },
  { id: 12, nombre: 'Luna Antireflex Premium', precio: 280, categoria: 'Luna' },
  { id: 13, nombre: 'Luna Fotocrom', precio: 320, categoria: 'Luna' },
  { id: 14, nombre: 'Luna Blue Cut', precio: 250, categoria: 'Luna' },
  { id: 15, nombre: 'Lente de Contacto Diario', precio: 85, categoria: 'Contacto' },
  { id: 16, nombre: 'Lente de Contacto Mensual', precio: 150, categoria: 'Contacto' },
  { id: 17, nombre: 'Solucion para Lentes', precio: 35, categoria: 'Contacto' },
  { id: 18, nombre: 'Cirugia Catarata', precio: 2500, categoria: 'Cirugia' },
  { id: 19, nombre: 'Cirugia Lasik', precio: 3500, categoria: 'Cirugia' },
  { id: 20, nombre: 'Cirugia Pterigion', precio: 1200, categoria: 'Cirugia' },
  { id: 21, nombre: 'Colirio Lubricante', precio: 35, categoria: 'Medicamento' },
  { id: 22, nombre: 'Gotas Antiinflamatorias', precio: 55, categoria: 'Medicamento' },
  { id: 23, nombre: 'Vitaminas Oculares', precio: 80, categoria: 'Medicamento' },
]

const categorias = ['Servicio', 'Examen', 'Montura', 'Luna', 'Contacto', 'Cirugia', 'Medicamento']

export default function VentasDiarias() {
  const [carrito, setCarrito] = useState([])
  const [paciente, setPaciente] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [mostrarEspecializada, setMostrarEspecializada] = useState(false)
  const [cuotas, setCuotas] = useState(false)
  const [numeroCuotas, setNumeroCuotas] = useState(2)
  const [guardando, setGuardando] = useState(false)

  const [ventaEsp, setVentaEsp] = useState({
    ciudad: '', vendedor: '', optica: '', codigo: '', monto: 0,
    cantidad: 1, facturadoPor: '', fecha: '', guia: '', factura: '',
    comentarios: '', pago: 'directo', cuotas: 1,
    doctor: '', comprobante: 'boleta', descuento: 0,
    laboratorio: '', fechaEntrega: '', observaciones: ''
  })

  const productosFiltrados = productosDisponibles.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro
    return coincideBusqueda && coincideCategoria
  })

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find(item => item.id === producto.id)
    if (existente) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
  }

  const quitarDelCarrito = (id) => setCarrito(carrito.filter(item => item.id !== id))

  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const total = subtotal

  const cobrar = async () => {
    if (carrito.length === 0) return alert('Agrega productos al carrito')
    if (!paciente) return alert('Ingresa el nombre del paciente')
    setGuardando(true)

    const { data: ventaData, error: ventaError } = await supabase
      .from('ventas')
      .insert([{
        empresa_id: EMPRESA_ID,
        sede_id: SEDE_ID,
        subtotal: subtotal,
        total: total,
        metodo_pago: metodoPago,
        estado: 'pagado',
        notas: 'Paciente: ' + paciente,
        tipo_comprobante: 'boleta',
      }])
      .select()
      .single()

    if (ventaError) {
      alert('Error al guardar: ' + ventaError.message)
      setGuardando(false)
      return
    }

    for (const item of carrito) {
      await supabase.from('ventas_detalle').insert([{
        venta_id: ventaData.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.precio * item.cantidad,
      }])
    }

    setGuardando(false)
    const telefono = prompt('Telefono para WhatsApp (opcional, sin +51):')
    if (telefono) {
      const mensaje = encodeURIComponent('Hola ' + paciente + ', gracias por tu compra en OFTALMANAGER. Total: S/ ' + total)
      window.open('https://wa.me/51' + telefono + '?text=' + mensaje, '_blank')
    }
    alert('Venta registrada correctamente')
    setCarrito([])
    setPaciente('')
  }

  const enviarWhatsApp = () => {
    const telefono = prompt('Ingresa el telefono del cliente (sin +51):')
    if (telefono) {
      const mensaje = encodeURIComponent('Hola, le contactamos desde OFTALMANAGER. En que podemos ayudarle?')
      window.open('https://wa.me/51' + telefono + '?text=' + mensaje, '_blank')
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">OFTALMANAGER</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) => (
            <a key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 text-sm">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Ventas diarias</h2>
            <p className="text-sm text-gray-400">POS y registro de ventas</p>
          </div>
          <div className="flex gap-3">
            <button onClick={enviarWhatsApp} className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
              💬 WhatsApp
            </button>
            <button onClick={() => setMostrarEspecializada(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
              + Venta especializada
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['todos', ...categorias].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={'px-3 py-1 rounded-lg text-xs transition-all ' + (categoriaFiltro === cat ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}
                >
                  {cat === 'todos' ? 'Todos' : cat}
                </button>
              ))}
            </div>

            {categorias.filter(cat => categoriaFiltro === 'todos' || cat === categoriaFiltro).map((cat) => {
              const prods = productosFiltrados.filter(p => p.categoria === cat)
              if (prods.length === 0) return null
              return (
                <div key={cat} className="mb-6">
                  <h3 className="text-xs text-gray-400 uppercase mb-3">{cat}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {prods.map((producto) => (
                      <button
                        key={producto.id}
                        onClick={() => agregarAlCarrito(producto)}
                        className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 text-left transition-all"
                      >
                        <p className="text-sm font-medium">{producto.nombre}</p>
                        <p className="text-blue-400 font-bold mt-1">S/ {producto.precio}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold mb-3">Detalle de venta</h3>
              <input
                type="text"
                placeholder="Nombre del paciente..."
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex-1 overflow-auto p-4">
              {carrito.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  Haz click en un producto para agregarlo
                </div>
              ) : (
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.nombre}</p>
                        <p className="text-xs text-gray-400">S/ {item.precio} x {item.cantidad}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-sm font-bold">S/ {item.precio * item.cantidad}</span>
                        <button onClick={() => quitarDelCarrito(item.id)} className="text-red-400 hover:text-red-300 text-lg">x</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>S/ {subtotal}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2">
                  <span>Total</span>
                  <span className="text-green-400">S/ {total}</span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Metodo de pago</p>
                <div className="grid grid-cols-3 gap-2">
                  {['efectivo', 'tarjeta', 'yape'].map((metodo) => (
                    <button
                      key={metodo}
                      onClick={() => setMetodoPago(metodo)}
                      className={'py-2 rounded-lg text-xs font-medium transition-all ' + (metodoPago === metodo ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}
                    >
                      {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3 flex items-center gap-3">
                <input type="checkbox" id="cuotas" checked={cuotas} onChange={(e) => setCuotas(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="cuotas" className="text-sm text-gray-300">Pago en cuotas</label>
                {cuotas && (
                  <input
                    type="number"
                    min={2}
                    max={24}
                    value={numeroCuotas}
                    onChange={(e) => setNumeroCuotas(Number(e.target.value))}
                    className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  />
                )}
                {cuotas && <span className="text-xs text-gray-400">x S/ {Math.round(total / numeroCuotas)}</span>}
              </div>

              <button
                onClick={cobrar}
                disabled={guardando}
                className={'w-full text-white py-3 rounded-lg font-bold transition-all ' + (guardando ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700')}
              >
                {guardando ? 'Guardando...' : 'Cobrar S/ ' + total}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mostrarEspecializada && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-auto py-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Registro de venta especializada</h3>
              <button onClick={() => setMostrarEspecializada(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" onChange={(e) => setVentaEsp({...ventaEsp, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Vendedor</label>
                  <input type="text" onChange={(e) => setVentaEsp({...ventaEsp, vendedor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Optica / Cliente</label>
                  <input type="text" onChange={(e) => setVentaEsp({...ventaEsp, optica: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Codigo de producto</label>
                  <input type="text" onChange={(e) => setVentaEsp({...ventaEsp, codigo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto de venta S/</label>
                  <input type="number" onChange={(e) => setVentaEsp({...ventaEsp, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cantidad</label>
                  <input type="number" defaultValue={1} onChange={(e) => setVentaEsp({...ventaEsp, cantidad: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Facturado por</label>
                  <input type="text" onChange={(e) => setVentaEsp({...ventaEsp, facturadoPor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha de venta</label>
                  <input type="date" onChange={(e) => setVentaEsp({...ventaEsp, fecha: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha de entrega</label>
                  <input type="date" onChange={(e) => setVentaEsp({...ventaEsp, fechaEntrega: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">N° de Guia</label>
                  <input type="text" onChange={(e) => setVentaEsp({...ventaEsp, guia: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">N° de Factura</label>
                  <input type="text" onChange={(e) => setVentaEsp({...ventaEsp, factura: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Comprobante</label>
                  <select onChange={(e) => setVentaEsp({...ventaEsp, comprobante: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="boleta">Boleta</option>
                    <option value="factura">Factura</option>
                    <option value="ticket">Ticket</option>
                    <option value="ninguno">Sin comprobante</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Doctor responsable</label>
                  <input type="text" onChange={(e) => setVentaEsp({...ventaEsp, doctor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Laboratorio</label>
                  <input type="text" onChange={(e) => setVentaEsp({...ventaEsp, laboratorio: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Descuento S/</label>
                  <input type="number" defaultValue={0} onChange={(e) => setVentaEsp({...ventaEsp, descuento: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Forma de pago</label>
                  <select onChange={(e) => setVentaEsp({...ventaEsp, pago: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="directo">Directo / Contado</option>
                    <option value="cuotas">Cuotas</option>
                    <option value="credito">Credito</option>
                  </select>
                </div>
                {ventaEsp.pago === 'cuotas' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Numero de cuotas</label>
                    <input type="number" min={2} defaultValue={2} onChange={(e) => setVentaEsp({...ventaEsp, cuotas: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Comentarios</label>
                <textarea onChange={(e) => setVentaEsp({...ventaEsp, comentarios: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Observaciones adicionales</label>
                <textarea onChange={(e) => setVentaEsp({...ventaEsp, observaciones: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-16" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarEspecializada(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const { error } = await supabase.from('ventas').insert([{
                    empresa_id: EMPRESA_ID,
                    sede_id: SEDE_ID,
                    subtotal: ventaEsp.monto,
                    total: ventaEsp.monto - ventaEsp.descuento,
                    metodo_pago: 'efectivo',
                    estado: 'pagado',
                    notas: ventaEsp.comentarios,
                    tipo_comprobante: ventaEsp.comprobante,
                    numero_comprobante: ventaEsp.factura,
                  }])
                  if (error) { alert('Error: ' + error.message); return }
                  alert('Venta especializada registrada correctamente')
                  setMostrarEspecializada(false)
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium"
              >
                Registrar venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
