'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase, getEmpresaId } from '../../lib/supabase'

export default function Inventario() {
  const [productos, setProductos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [tab, setTab] = useState('productos')
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [editandoCategoria, setEditandoCategoria] = useState<any>(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState<string|null>(null)
  const [cargando, setCargando] = useState(true)
  const [nuevoProducto, setNuevoProducto] = useState({
    codigo: '', nombre: '', categoria: '', stock: 0, minimo: 5, costo: 0, precio: 0, unidad: 'unidad'
  })

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    const eid = await getEmpresaId()
    setEmpresaId(eid)
    cargarDatos(eid)
  }

  const cargarDatos = async (eid: string|null) => {
    setCargando(true)
    const prodQuery = supabase.from('productos').select('*').order('nombre')
    if (eid) prodQuery.eq('empresa_id', eid)
    const { data: prodData } = await prodQuery
    setProductos(prodData || [])

    const catQuery = supabase.from('categorias_productos').select('*').order('nombre')
    if (eid) catQuery.eq('empresa_id', eid)
    const { data: catData } = await catQuery
    setCategorias(catData || [])
    setCargando(false)
  }

  const filtrados = productos.filter(p => {
    const coincideBusqueda = (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || (p.codigo || '').toLowerCase().includes(busqueda.toLowerCase())
    const coincideFiltro = filtro === 'todos' || (filtro === 'bajo' && (p.stock || 0) <= (p.minimo || 0)) || p.categoria === filtro
    return coincideBusqueda && coincideFiltro
  })

  const guardarProducto = async () => {
    if (!nuevoProducto.nombre) { alert('El nombre es obligatorio'); return }
    const margen = nuevoProducto.costo > 0 ? Math.round(((nuevoProducto.precio - nuevoProducto.costo) / nuevoProducto.costo) * 100) : 0
    const { data, error } = await supabase.from('productos').insert([{ ...nuevoProducto, empresa_id: empresaId, margen }]).select().single()
    if (error) { alert('Error: ' + error.message); return }
    setProductos([...productos, data])
    setMostrarNuevo(false)
    setNuevoProducto({ codigo: '', nombre: '', categoria: '', stock: 0, minimo: 5, costo: 0, precio: 0, unidad: 'unidad' })
  }

  const eliminarProducto = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    setProductos(productos.filter(p => p.id !== id))
    setProductoSeleccionado(null)
  }

  const guardarCategoria = async () => {
    if (!nuevaCategoria.trim()) return
    const { data, error } = await supabase.from('categorias_productos').insert([{ nombre: nuevaCategoria.trim(), empresa_id: empresaId }]).select().single()
    if (error) { alert('Error: ' + error.message); return }
    setCategorias([...categorias, data])
    setNuevaCategoria('')
  }

  const actualizarCategoria = async (id: string, nombre: string) => {
    if (!nombre.trim()) return
    await supabase.from('categorias_productos').update({ nombre: nombre.trim() }).eq('id', id)
    setCategorias(categorias.map(c => c.id === id ? { ...c, nombre: nombre.trim() } : c))
    setEditandoCategoria(null)
  }

  const eliminarCategoria = async (id: string) => {
    if (!confirm('¿Eliminar esta categoria?')) return
    await supabase.from('categorias_productos').delete().eq('id', id)
    setCategorias(categorias.filter(c => c.id !== id))
  }

  const escapeCSV = (val: any) => {
    const str = String(val === null || val === undefined ? '' : val)
    if (str.includes(';') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"'
    return str
  }

  const descargar = () => {
    const headers = ['Codigo','Nombre','Categoria','Stock','Costo','Precio','Margen']
    const rows = filtrados.map(p => [p.codigo || '', p.nombre, p.categoria || '', p.stock || 0, p.costo || 0, p.precio || 0, (p.margen || 0) + '%'])
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(escapeCSV).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventario.csv'
    a.click()
  }

  if (productoSeleccionado) {
    const p = productoSeleccionado
    return (
      <div className="flex h-screen bg-gray-950 text-white">
        <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setProductoSeleccionado(null)} className="text-gray-400 hover:text-white text-sm">← Volver</button>
            <button onClick={() => eliminarProducto(p.id)} className="text-red-400 hover:text-red-300 text-sm">🗑 Eliminar</button>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-8">
            <h2 className="text-xl md:text-3xl font-bold mb-1">{p.nombre}</h2>
            <p className="text-gray-400 text-sm mb-6">Codigo: {p.codigo || '-'}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { label: 'Categoria', value: p.categoria || '-' },
                { label: 'Stock actual', value: (p.stock || 0) + ' ' + (p.unidad || 'unidad') },
                { label: 'Stock minimo', value: (p.minimo || 0) + ' ' + (p.unidad || 'unidad') },
                { label: 'Precio venta', value: 'S/ ' + (p.precio || 0) },
                { label: 'Precio costo', value: 'S/ ' + (p.costo || 0) },
                { label: 'Margen', value: (p.margen || 0) + '%' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
            <div>
              <h2 className="text-base md:text-lg font-semibold">Inventario</h2>
              <p className="text-xs md:text-sm text-gray-400">{productos.length} productos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={descargar} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs hidden md:block">⬇ Descargar</button>
            <button onClick={() => setMostrarNuevo(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Nuevo</button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="flex gap-2 md:gap-3 mb-4 md:mb-6">
            {['productos', 'categorias'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'productos' ? 'Productos' : 'Categorias'}
              </button>
            ))}
          </div>

          {tab === 'productos' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 md:mb-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-4">
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-xl md:text-2xl font-bold">{productos.length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-4">
                  <p className="text-xs text-gray-400 mb-1">Stock bajo</p>
                  <p className="text-xl md:text-2xl font-bold text-red-400">{productos.filter(p => (p.stock||0) <= (p.minimo||0)).length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-4">
                  <p className="text-xs text-gray-400 mb-1">Valor total</p>
                  <p className="text-xl md:text-2xl font-bold text-green-400">S/ {productos.reduce((sum, p) => sum + (p.stock||0)*(p.costo||0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-4">
                  <p className="text-xs text-gray-400 mb-1">Categorias</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-400">{categorias.length}</p>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {['todos', 'bajo', ...categorias.map(c => c.nombre)].map((f) => (
                  <button key={f} onClick={() => setFiltro(f)} className={'px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ' + (filtro === f ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                    {f === 'todos' ? 'Todos' : f === 'bajo' ? '⚠ Stock bajo' : f}
                  </button>
                ))}
              </div>

              {cargando ? (
                <div className="text-center text-gray-400 py-12">Cargando inventario...</div>
              ) : filtrados.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-4xl mb-4">📦</p>
                  <p className="text-sm mb-4">No hay productos registrados</p>
                  <button onClick={() => setMostrarNuevo(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Agregar primer producto</button>
                </div>
              ) : (
                <>
                  <div className="md:hidden space-y-2">
                    {filtrados.map((p) => (
                      <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.nombre}</p>
                          <p className="text-xs text-gray-400">{p.codigo || '-'} • {p.categoria || '-'}</p>
                          <p className="text-xs mt-1">S/ {p.precio || 0} • <span className={(p.stock||0) <= (p.minimo||0) ? 'text-red-400' : 'text-green-400'}>Stock: {p.stock || 0}</span></p>
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button onClick={() => setProductoSeleccionado(p)} className="text-blue-400 text-xs">Ver</button>
                          <button onClick={() => eliminarProducto(p.id)} className="text-red-400 text-xs">🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Codigo</th>
                          <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Producto</th>
                          <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Categoria</th>
                          <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Stock</th>
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
                            <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.codigo || '-'}</td>
                            <td className="px-4 py-3 text-sm font-medium">{p.nombre}</td>
                            <td className="px-4 py-3 text-sm text-gray-300">{p.categoria || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={'text-sm font-bold ' + ((p.stock||0) <= (p.minimo||0) ? 'text-red-400' : 'text-green-400')}>{p.stock || 0}</span>
                              <span className="text-xs text-gray-500"> {p.unidad || 'unidad'}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">S/ {p.costo || 0}</td>
                            <td className="px-4 py-3 text-sm font-medium">S/ {p.precio || 0}</td>
                            <td className="px-4 py-3 text-sm text-green-400">{p.margen || 0}%</td>
                            <td className="px-4 py-3">
                              {(p.stock||0) <= (p.minimo||0) ? (
                                <span className="bg-red-900 text-red-400 text-xs px-2 py-1 rounded-full">Stock bajo</span>
                              ) : (
                                <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">OK</span>
                              )}
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                              <button onClick={() => setProductoSeleccionado(p)} className="text-blue-400 hover:text-blue-300 text-xs">Ver</button>
                              <button onClick={() => eliminarProducto(p.id)} className="text-red-400 hover:text-red-300 text-xs">🗑</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'categorias' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-4 md:mb-6">Categorias</h3>
              <div className="flex gap-3 mb-4 md:mb-6">
                <input type="text" placeholder="Nueva categoria..." value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && guardarCategoria()} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                <button onClick={guardarCategoria} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Agregar</button>
              </div>
              {categorias.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-sm">No hay categorias. Agrega una arriba.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorias.map((cat) => (
                    <div key={cat.id} className="bg-gray-800 border border-gray-700 rounded-xl p-3 md:p-4 flex justify-between items-center">
                      {editandoCategoria?.id === cat.id ? (
                        <input
                          type="text"
                          value={editandoCategoria.nombre}
                          onChange={(e) => setEditandoCategoria({...editandoCategoria, nombre: e.target.value})}
                          onKeyDown={(e) => e.key === 'Enter' && actualizarCategoria(cat.id, editandoCategoria.nombre)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 mr-2"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <p className="font-medium text-sm">{cat.nombre}</p>
                          <p className="text-xs text-gray-400">{productos.filter(p => p.categoria === cat.nombre).length} productos</p>
                        </div>
                      )}
                      <div className="flex gap-2 flex-shrink-0">
                        {editandoCategoria?.id === cat.id ? (
                          <>
                            <button onClick={() => actualizarCategoria(cat.id, editandoCategoria.nombre)} className="text-green-400 hover:text-green-300 text-xs">✓ Guardar</button>
                            <button onClick={() => setEditandoCategoria(null)} className="text-gray-400 hover:text-gray-300 text-xs">✕</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditandoCategoria({id: cat.id, nombre: cat.nombre})} className="text-blue-400 hover:text-blue-300 text-xs">✏</button>
                            <button onClick={() => eliminarCategoria(cat.id)} className="text-red-400 hover:text-red-300 text-xs">🗑</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mostrarNuevo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo producto</h3>
              <button onClick={() => setMostrarNuevo(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Codigo</label>
                  <input type="text" value={nuevoProducto.codigo} onChange={(e) => setNuevoProducto({...nuevoProducto, codigo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
                  <input type="text" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
                  <select value={nuevoProducto.categoria} onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Unidad</label>
                  <select value={nuevoProducto.unidad} onChange={(e) => setNuevoProducto({...nuevoProducto, unidad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="unidad">Unidad</option>
                    <option value="par">Par</option>
                    <option value="frasco">Frasco</option>
                    <option value="caja">Caja</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Stock inicial</label>
                  <input type="number" value={nuevoProducto.stock} onChange={(e) => setNuevoProducto({...nuevoProducto, stock: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Stock minimo</label>
                  <input type="number" value={nuevoProducto.minimo} onChange={(e) => setNuevoProducto({...nuevoProducto, minimo: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Precio costo S/</label>
                  <input type="number" value={nuevoProducto.costo} onChange={(e) => setNuevoProducto({...nuevoProducto, costo: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Precio venta S/</label>
                  <input type="number" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({...nuevoProducto, precio: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarNuevo(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarProducto} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}