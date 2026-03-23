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

const productosIniciales = [
  { id: 1, codigo: 'MON-001', nombre: 'Montura Ray-Ban RB3025', categoria: 'Montura', familia: 'Lentes', modelo: 'RB3025', material: 'Metal', color: 'Dorado', talla: 'M', stock: 12, minimo: 5, costo: 180, precio: 350, margen: 94, unidad: 'unidad', codigoBarras: '7501234567890', codigoOSCE: '', detraccion: false, foto: '' },
  { id: 2, codigo: 'MON-002', nombre: 'Montura Oakley OX8046', categoria: 'Montura', familia: 'Lentes', modelo: 'OX8046', material: 'Acetato', color: 'Negro', talla: 'L', stock: 3, minimo: 5, costo: 200, precio: 420, margen: 110, unidad: 'unidad', codigoBarras: '7501234567891', codigoOSCE: '', detraccion: false, foto: '' },
  { id: 3, codigo: 'LUN-001', nombre: 'Luna Antireflex Simple', categoria: 'Luna', familia: 'Lunas', modelo: 'AR Simple', material: 'Policarbonato', color: 'Transparente', talla: 'Universal', stock: 25, minimo: 10, costo: 80, precio: 180, margen: 125, unidad: 'par', codigoBarras: '', codigoOSCE: '', detraccion: false, foto: '' },
  { id: 4, codigo: 'LUN-002', nombre: 'Luna Antireflex Premium', categoria: 'Luna', familia: 'Lunas', modelo: 'AR Premium', material: 'Trivex', color: 'Transparente', talla: 'Universal', stock: 8, minimo: 10, costo: 120, precio: 280, margen: 133, unidad: 'par', codigoBarras: '', codigoOSCE: '', detraccion: false, foto: '' },
  { id: 5, codigo: 'INS-001', nombre: 'Colirio Lubricante', categoria: 'Insumo', familia: 'Medicamentos', modelo: 'Lubricante', material: 'Liquido', color: '-', talla: '10ml', stock: 30, minimo: 15, costo: 15, precio: 35, margen: 133, unidad: 'frasco', codigoBarras: '', codigoOSCE: '', detraccion: false, foto: '' },
]

const categoriasIniciales = ['Montura', 'Luna', 'Insumo', 'Servicio', 'Cirugia', 'Medicamento']

export default function Inventario() {
  const [productos, setProductos] = useState(productosIniciales)
  const [categorias, setCategorias] = useState(categoriasIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [tab, setTab] = useState('productos')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [nuevoProducto, setNuevoProducto] = useState({
    codigo: '', nombre: '', categoria: '', familia: '', modelo: '', material: '',
    color: '', talla: '', stock: 0, minimo: 5, costo: 0, precio: 0, margen: 0,
    unidad: 'unidad', codigoBarras: '', codigoOSCE: '', detraccion: false, foto: ''
  })

  const filtrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideFiltro = filtro === 'todos' || (filtro === 'bajo' && p.stock <= p.minimo) || p.categoria === filtro
    return coincideBusqueda && coincideFiltro
  })

  const stockBajo = productos.filter(p => p.stock <= p.minimo).length

  const guardarProducto = () => {
    const margen = nuevoProducto.costo > 0 ? Math.round(((nuevoProducto.precio - nuevoProducto.costo) / nuevoProducto.costo) * 100) : 0
    setProductos([...productos, { ...nuevoProducto, id: productos.length + 1, margen }])
    setMostrarNuevo(false)
    setNuevoProducto({ codigo: '', nombre: '', categoria: '', familia: '', modelo: '', material: '', color: '', talla: '', stock: 0, minimo: 5, costo: 0, precio: 0, margen: 0, unidad: 'unidad', codigoBarras: '', codigoOSCE: '', detraccion: false, foto: '' })
  }

  if (productoSeleccionado) {
    const p = productoSeleccionado
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
        <div className="flex-1 overflow-auto p-8">
          <button onClick={() => setProductoSeleccionado(null)} className="text-gray-400 hover:text-white text-sm mb-6">← Volver al inventario</button>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex items-start gap-8">
              <div className="w-48 h-48 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                {p.foto ? <img src={p.foto} className="w-full h-full object-cover rounded-xl" /> : (
                  <div className="text-center">
                    <p className="text-4xl mb-2">📦</p>
                    <p className="text-xs text-gray-500">Sin foto</p>
                    <button className="mt-2 text-xs text-blue-400 hover:text-blue-300">Subir foto</button>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-1">{p.nombre}</h2>
                <p className="text-gray-400 text-sm mb-6">Codigo: {p.codigo}</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Categoria', value: p.categoria },
                    { label: 'Familia', value: p.familia },
                    { label: 'Modelo', value: p.modelo },
                    { label: 'Material', value: p.material },
                    { label: 'Color', value: p.color },
                    { label: 'Talla', value: p.talla },
                    { label: 'Stock actual', value: p.stock + ' ' + p.unidad },
                    { label: 'Stock minimo', value: p.minimo + ' ' + p.unidad },
                    { label: 'Unidad de medida', value: p.unidad },
                    { label: 'Precio de venta', value: 'S/ ' + p.precio },
                    { label: 'Precio costo', value: 'S/ ' + p.costo },
                    { label: 'Margen de ganancia', value: p.margen + '%' },
                    { label: 'Codigo de barras', value: p.codigoBarras || '-' },
                    { label: 'Codigo OSCE', value: p.codigoOSCE || '-' },
                    { label: 'Detraccion', value: p.detraccion ? 'Si' : 'No' },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Editar producto</button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Ajustar stock</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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

      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Inventario</h2>
            <p className="text-sm text-gray-400">{productos.length} productos registrados</p>
          </div>
          <button onClick={() => setMostrarNuevo(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            + Nuevo producto
          </button>
        </div>

        <div className="p-8">
          <div className="flex gap-3 mb-6">
            {['productos', 'categorias'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={'px-4 py-2 rounded-lg text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}
              >
                {t === 'productos' ? 'Productos' : 'Categorias'}
              </button>
            ))}
          </div>

          {tab === 'productos' && (
            <div>
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
                  <p className="text-xs text-gray-400 mb-1">Valor inventario</p>
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
                    <p className="text-sm text-red-400">{stockBajo} productos por debajo del minimo</p>
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
                {['todos', 'bajo', ...categorias].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={'px-3 py-2 rounded-lg text-xs transition-all ' + (filtro === f ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}
                  >
                    {f === 'todos' ? 'Todos' : f === 'bajo' ? '⚠ Stock bajo' : f}
                  </button>
                ))}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Codigo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Producto</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Categoria</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Stock</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Material</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Costo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Precio</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Margen</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Estado</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((p) => (
                      <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.codigo}</td>
                        <td className="px-4 py-3 text-sm font-medium">{p.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{p.categoria}</td>
                        <td className="px-4 py-3">
                          <span className={'text-sm font-bold ' + (p.stock <= p.minimo ? 'text-red-400' : 'text-green-400')}>{p.stock}</span>
                          <span className="text-xs text-gray-500"> {p.unidad}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{p.material}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">S/ {p.costo}</td>
                        <td className="px-4 py-3 text-sm font-medium">S/ {p.precio}</td>
                        <td className="px-4 py-3 text-sm text-green-400">{p.margen}%</td>
                        <td className="px-4 py-3">
                          {p.stock <= p.minimo ? (
                            <span className="bg-red-900 text-red-400 text-xs px-2 py-1 rounded-full">Stock bajo</span>
                          ) : (
                            <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">OK</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setProductoSeleccionado(p)} className="text-blue-400 hover:text-blue-300 text-xs">Ver mas</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'categorias' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Categorias de productos</h3>
              </div>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Nueva categoria..."
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => { if (nuevaCategoria) { setCategorias([...categorias, nuevaCategoria]); setNuevaCategoria('') } }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Agregar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {categorias.map((cat) => (
                  <div key={cat} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{cat}</p>
                      <p className="text-xs text-gray-400">{productos.filter(p => p.categoria === cat).length} productos</p>
                    </div>
                    <button
                      onClick={() => setCategorias(categorias.filter(c => c !== cat))}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {mostrarNuevo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-auto py-8">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo producto</h3>
              <button onClick={() => setMostrarNuevo(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Codigo</label>
                  <input type="text" onChange={(e) => setNuevoProducto({...nuevoProducto, codigo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre del producto</label>
                  <input type="text" onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
                  <select onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Familia</label>
                  <input type="text" onChange={(e) => setNuevoProducto({...nuevoProducto, familia: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Modelo</label>
                  <input type="text" onChange={(e) => setNuevoProducto({...nuevoProducto, modelo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Material</label>
                  <input type="text" onChange={(e) => setNuevoProducto({...nuevoProducto, material: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Color</label>
                  <input type="text" onChange={(e) => setNuevoProducto({...nuevoProducto, color: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Talla</label>
                  <input type="text" onChange={(e) => setNuevoProducto({...nuevoProducto, talla: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Stock inicial</label>
                  <input type="number" onChange={(e) => setNuevoProducto({...nuevoProducto, stock: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Stock minimo</label>
                  <input type="number" defaultValue={5} onChange={(e) => setNuevoProducto({...nuevoProducto, minimo: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Precio costo S/</label>
                  <input type="number" onChange={(e) => setNuevoProducto({...nuevoProducto, costo: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Precio venta S/</label>
                  <input type="number" onChange={(e) => setNuevoProducto({...nuevoProducto, precio: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Unidad de medida</label>
                  <select onChange={(e) => setNuevoProducto({...nuevoProducto, unidad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="unidad">Unidad</option>
                    <option value="par">Par</option>
                    <option value="frasco">Frasco</option>
                    <option value="caja">Caja</option>
                    <option value="kit">Kit</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Codigo de barras</label>
                  <input type="text" onChange={(e) => setNuevoProducto({...nuevoProducto, codigoBarras: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Codigo OSCE</label>
                  <input type="text" onChange={(e) => setNuevoProducto({...nuevoProducto, codigoOSCE: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="detraccion" onChange={(e) => setNuevoProducto({...nuevoProducto, detraccion: e.target.checked})} className="w-4 h-4" />
                <label htmlFor="detraccion" className="text-sm text-gray-300">Aplica detraccion</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarNuevo(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">
                Cancelar
              </button>
              <button onClick={guardarProducto} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                Guardar producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
