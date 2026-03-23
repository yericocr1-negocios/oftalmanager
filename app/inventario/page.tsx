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

const productos = [
  { id: 1, codigo: 'MON-001', nombre: 'Montura Ray-Ban RB3025', categoria: 'Montura', stock: 12, minimo: 5, costo: 180, precio: 350, margen: 94 },
  { id: 2, codigo: 'MON-002', nombre: 'Montura Oakley OX8046', categoria: 'Montura', stock: 3, minimo: 5, costo: 200, precio: 420, margen: 110 },
  { id: 3, codigo: 'LUN-001', nombre: 'Luna Antireflex Simple', categoria: 'Luna', stock: 25, minimo: 10, costo: 80, precio: 180, margen: 125 },
  { id: 4, codigo: 'LUN-002', nombre: 'Luna Antireflex Premium', categoria: 'Luna', stock: 8, minimo: 10, costo: 120, precio: 280, margen: 133 },
  { id: 5, codigo: 'LUN-003', nombre: 'Luna Fotocrom', categoria: 'Luna', stock: 2, minimo: 5, costo: 150, precio: 320, margen: 113 },
  { id: 6, codigo: 'INS-001', nombre: 'Colirio Lubricante', categoria: 'Insumo', stock: 30, minimo: 15, costo: 15, precio: 35, margen: 133 },
  { id: 7, codigo: 'INS-002', nombre: 'Gotas Antiinflamatorias', categoria: 'Insumo', stock: 4, minimo: 10, costo: 25, precio: 55, margen: 120 },
]

export default function Inventario() {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [mostrar, setMostrar] = useState(false)
  const [nuevoProducto, setNuevoProducto] = useState({ codigo: '', nombre: '', categoria: 'Montura', stock: 0, minimo: 5, costo: 0, precio: 0 })

  const filtrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideFiltro = filtro === 'todos' || (filtro === 'bajo' && p.stock <= p.minimo) || p.categoria === filtro
    return coincideBusqueda && coincideFiltro
  })

  const stockBajo = productos.filter(p => p.stock <= p.minimo).length

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

      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Inventario</h2>
            <p className="text-sm text-gray-400">{productos.length} productos registrados</p>
          </div>
          <button onClick={() => setMostrar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            + Nuevo producto
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Total productos</p>
              <p className="text-2xl font-bold">{productos.length}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Stock bajo</p>
              <p className="text-2xl font-bold text-red-400">{stockBajo}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Valor del inventario</p>
              <p className="text-2xl font-bold text-green-400">S/ {productos.reduce((sum, p) => sum + p.stock * p.costo, 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Margen promedio</p>
              <p className="text-2xl font-bold text-blue-400">{Math.round(productos.reduce((sum, p) => sum + p.margen, 0) / productos.length)}%</p>
            </div>
          </div>

          {stockBajo > 0 && (
            <div className="bg-red-900 border border-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium text-red-300">Stock bajo detectado</p>
                <p className="text-sm text-red-400">{stockBajo} productos tienen stock por debajo del minimo</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Buscar producto o codigo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            {['todos', 'bajo', 'Montura', 'Luna', 'Insumo'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={'px-3 py-2 rounded-lg text-xs transition-all ' + (filtro === f ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}
              >
                {f === 'todos' ? 'Todos' : f === 'bajo' ? 'Stock bajo' : f}
              </button>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Codigo</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Producto</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Categoria</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Stock</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Costo</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Precio</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Margen</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">{p.codigo}</td>
                    <td className="px-6 py-4 text-sm font-medium">{p.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{p.categoria}</td>
                    <td className="px-6 py-4">
                      <span className={'text-sm font-bold ' + (p.stock <= p.minimo ? 'text-red-400' : 'text-green-400')}>
                        {p.stock}
                      </span>
                      <span className="text-xs text-gray-500"> / min {p.minimo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">S/ {p.costo}</td>
                    <td className="px-6 py-4 text-sm font-medium">S/ {p.precio}</td>
                    <td className="px-6 py-4 text-sm text-green-400">{p.margen}%</td>
                    <td className="px-6 py-4">
                      {p.stock <= p.minimo ? (
                        <span className="bg-red-900 text-red-400 text-xs px-2 py-1 rounded-full">Stock bajo</span>
                      ) : (
                        <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {mostrar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo producto</h3>
              <button onClick={() => setMostrar(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Codigo</label>
                  <input type="text" placeholder="MON-001" onChange={(e) => setNuevoProducto({...nuevoProducto, codigo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
                  <select onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option>Montura</option>
                    <option>Luna</option>
                    <option>Insumo</option>
                    <option>Servicio</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nombre del producto</label>
                <input type="text" placeholder="Nombre del producto" onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Costo S/</label>
                  <input type="number" placeholder="0" onChange={(e) => setNuevoProducto({...nuevoProducto, costo: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Precio S/</label>
                  <input type="number" placeholder="0" onChange={(e) => setNuevoProducto({...nuevoProducto, precio: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Stock inicial</label>
                  <input type="number" placeholder="0" onChange={(e) => setNuevoProducto({...nuevoProducto, stock: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Stock minimo</label>
                <input type="number" placeholder="5" onChange={(e) => setNuevoProducto({...nuevoProducto, minimo: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrar(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">
                Cancelar
              </button>
              <button onClick={() => { alert('Producto guardado! (conectar a Supabase)'); setMostrar(false) }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                Guardar producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}