'use client'
import { useState } from 'react'

const menu = [
  { icon: '🏠', label: 'Dashboard', href: '/' },
  { icon: '👤', label: 'Pacientes', href: '/pacientes' },
  { icon: '📅', label: 'Agenda', href: '/agenda' },
  { icon: '💰', label: 'Ventas', href: '/ventas' },
  { icon: '📦', label: 'Inventario', href: '/inventario' },
  { icon: '💳', label: 'Finanzas', href: '/finanzas' },
  { icon: '📊', label: 'Reportes', href: '/reportes' },
  { icon: '⚙️', label: 'Config', href: '/configuracion' },
]

const productosDisponibles = [
  { id: 1, nombre: 'Consulta General', precio: 80, categoria: 'Servicio' },
  { id: 2, nombre: 'Consulta Especializada', precio: 120, categoria: 'Servicio' },
  { id: 3, nombre: 'Montura Ray-Ban', precio: 350, categoria: 'Montura' },
  { id: 4, nombre: 'Montura Oakley', precio: 420, categoria: 'Montura' },
  { id: 5, nombre: 'Luna Antireflex Simple', precio: 180, categoria: 'Luna' },
  { id: 6, nombre: 'Luna Antireflex Premium', precio: 280, categoria: 'Luna' },
  { id: 7, nombre: 'Luna Fotocrom', precio: 320, categoria: 'Luna' },
  { id: 8, nombre: 'Cirugia Catarata', precio: 2500, categoria: 'Cirugia' },
]

export default function Ventas() {
  const [carrito, setCarrito] = useState([])
  const [paciente, setPaciente] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [busqueda, setBusqueda] = useState('')

  const productosFiltrados = productosDisponibles.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  )

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find(item => item.id === producto.id)
    if (existente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
  }

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id))
  }

  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const total = subtotal

  const cobrar = () => {
    if (carrito.length === 0) return alert('Agrega productos al carrito')
    if (!paciente) return alert('Ingresa el nombre del paciente')
    alert('Venta registrada correctamente!')
    setCarrito([])
    setPaciente('')
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

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Ventas</h2>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {['Servicio', 'Montura', 'Luna', 'Cirugia'].map((cat) => (
            <div key={cat} className="mb-6">
              <h3 className="text-xs text-gray-400 uppercase mb-3">{cat}</h3>
              <div className="grid grid-cols-2 gap-3">
                {productosFiltrados.filter(p => p.categoria === cat).map((producto) => (
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
          ))}
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

            <div className="mb-4">
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

            <button
              onClick={cobrar}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all"
            >
              Cobrar S/ {total}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}