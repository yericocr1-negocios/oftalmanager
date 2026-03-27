'use client'
import { useState, useEffect } from 'react'
import { supabase, getEmpresaId, getSedeId } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const getMesActual = () => meses[new Date().getMonth()]

export default function VentasDiarias() {
  const [empresaId, setEmpresaId] = useState<string|null>(null)
  const [sedeId, setSedeId] = useState<string|null>(null)
  const [carrito, setCarrito] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [mostrarClientes, setMostrarClientes] = useState(false)
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [mostrarEspecializada, setMostrarEspecializada] = useState(false)
  const [mostrarNuevoProducto, setMostrarNuevoProducto] = useState(false)
  const [cuotas, setCuotas] = useState(false)
  const [numeroCuotas, setNumeroCuotas] = useState(2)
  const [guardando, setGuardando] = useState(false)
  const [guardandoEsp, setGuardandoEsp] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [mostrarCarrito, setMostrarCarrito] = useState(false)
  const [clienteEsp, setClienteEsp] = useState<any>(null)
  const [busquedaClienteEsp, setBusquedaClienteEsp] = useState('')
  const [mostrarClientesEsp, setMostrarClientesEsp] = useState(false)
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: 0, categoria: '' })
  const [ventaEsp, setVentaEsp] = useState({
    mes: getMesActual(), cliente: '', ruc_dni: '', ciudad: '', vendedor: '',
    monto: 0, cantidad: 1, facturado_por: '', fecha_venta: '',
    guia_factura: '', comentarios: '', tipo_pago: 'directo',
    num_cuotas: 0, fechas_pago: '', status: 'verde'
  })

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    const eid = await getEmpresaId()
    const sid = await getSedeId()
    setEmpresaId(eid)
    setSedeId(sid)
    cargarClientes(eid)
    cargarProductos(eid)
  }

  const cargarClientes = async (eid: string|null) => {
    const query = supabase.from('pacientes').select('id, nombres, apellidos, dni, telefono, ciudad').order('nombres')
    if (eid) query.eq('empresa_id', eid)
    const { data } = await query
    setClientes(data || [])
  }

  const cargarProductos = async (eid: string|null) => {
    const query = supabase.from('productos').select('*').order('categoria').order('nombre')
    if (eid) query.eq('empresa_id', eid)
    const { data } = await query
    setProductos(data || [])
    const cats = [...new Set((data || []).map((p: any) => p.categoria).filter(Boolean))] as string[]
    setCategorias(cats)
  }

  const guardarNuevoProducto = async () => {
    if (!nuevoProducto.nombre) { alert('El nombre es obligatorio'); return }
    const { data, error } = await supabase.from('productos').insert([{
      nombre: nuevoProducto.nombre,
      precio: nuevoProducto.precio,
      categoria: nuevoProducto.categoria || 'General',
      empresa_id: empresaId,
      stock: 0, minimo: 0, costo: 0, margen: 0, unidad: 'unidad'
    }]).select().single()
    if (error) { alert('Error: ' + error.message); return }
    setProductos([...productos, data])
    if (data.categoria && !categorias.includes(data.categoria)) setCategorias([...categorias, data.categoria])
    setMostrarNuevoProducto(false)
    setNuevoProducto({ nombre: '', precio: 0, categoria: '' })
  }

  const eliminarProducto = async (id: string) => {
    if (!confirm('¿Eliminar este producto del catalogo?')) return
    await supabase.from('productos').delete().eq('id', id)
    setProductos(productos.filter(p => p.id !== id))
  }

  const clientesFiltrados = clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    (c.dni || '').includes(busquedaCliente)
  )

  const clientesEspFiltrados = clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(busquedaClienteEsp.toLowerCase()) ||
    (c.dni || '').includes(busquedaClienteEsp)
  )

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro
    return coincideBusqueda && coincideCategoria
  })

  const agregarAlCarrito = (producto: any) => {
    const existente = carrito.find(item => item.id === producto.id)
    if (existente) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
    setMostrarCarrito(true)
  }

  const quitarDelCarrito = (id: string) => setCarrito(carrito.filter(item => item.id !== id))
  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const total = subtotal

  const generarFechasCuotas = (numCuotas: number) => {
    const fechas = []
    const hoy = new Date()
    for (let i = 1; i <= numCuotas; i++) {
      const fecha = new Date(hoy)
      fecha.setMonth(fecha.getMonth() + i)
      fechas.push(fecha.toISOString().split('T')[0])
    }
    return fechas
  }

  const cobrar = async () => {
    if (carrito.length === 0) return alert('Agrega productos al carrito')
    if (!clienteSeleccionado && !busquedaCliente) return alert('Ingresa o selecciona un cliente')
    if (!empresaId || !sedeId) return alert('Error: no se encontro la empresa')
    setGuardando(true)

    const nombreCliente = clienteSeleccionado
      ? clienteSeleccionado.nombres + ' ' + clienteSeleccionado.apellidos
      : busquedaCliente

    const { data: ventaData, error } = await supabase.from('ventas').insert([{
      empresa_id: empresaId, sede_id: sedeId,
      paciente_id: clienteSeleccionado ? clienteSeleccionado.id : null,
      subtotal, total, metodo_pago: metodoPago,
      estado: 'pagado', notas: nombreCliente,
      tipo_comprobante: 'boleta', cliente_nombre: nombreCliente,
      num_cuotas: cuotas ? numeroCuotas : 0,
    }]).select().single()

    if (error) { alert('Error: ' + error.message); setGuardando(false); return }

    for (const item of carrito) {
      await supabase.from('ventas_detalle').insert([{
        venta_id: ventaData.id, cantidad: item.cantidad,
        precio_unitario: item.precio, subtotal: item.precio * item.cantidad,
        nombre_producto: item.nombre,
      }])
    }

    await supabase.from('caja').insert([{
      sede_id: sedeId, tipo: 'ingreso',
      concepto: 'Venta - ' + carrito.map((i: any) => i.nombre).join(', '),
      monto: total, metodo_pago: metodoPago,
      venta_id: ventaData.id, cliente_nombre: nombreCliente,
      fecha: new Date().toISOString(),
    }])

    if (cuotas && numeroCuotas > 1) {
      const fechas = generarFechasCuotas(numeroCuotas)
      const montoCuota = Math.round(total / numeroCuotas)
      for (let i = 0; i < numeroCuotas; i++) {
        await supabase.from('cuotas_pago').insert([{
          venta_id: ventaData.id, empresa_id: empresaId,
          cliente_nombre: nombreCliente, numero_cuota: i + 1,
          monto: montoCuota, fecha_vencimiento: fechas[i], estado: 'pendiente',
        }])
      }
    }

    setGuardando(false)
    alert('Venta registrada correctamente')
    setCarrito([])
    setClienteSeleccionado(null)
    setBusquedaCliente('')
    setMostrarCarrito(false)
  }

  const registrarVentaEspecializada = async () => {
    if (!ventaEsp.cliente && !clienteEsp) return alert('Ingresa el nombre del cliente')
    if (!ventaEsp.monto) return alert('Ingresa el monto')
    if (!empresaId || !sedeId) return alert('Error: no se encontro la empresa')
    setGuardandoEsp(true)

    const nombreCliente = clienteEsp ? clienteEsp.nombres + ' ' + clienteEsp.apellidos : ventaEsp.cliente
    const rucDni = clienteEsp ? (clienteEsp.dni || ventaEsp.ruc_dni) : ventaEsp.ruc_dni
    const ciudad = clienteEsp ? (clienteEsp.ciudad || ventaEsp.ciudad) : ventaEsp.ciudad

    await supabase.from('ventas_especializadas').insert([{
      empresa_id: empresaId, sede_id: sedeId,
      paciente_id: clienteEsp ? clienteEsp.id : null,
      mes: ventaEsp.mes, cliente: nombreCliente, ruc_dni: rucDni,
      ciudad, vendedor: ventaEsp.vendedor, monto: ventaEsp.monto,
      cantidad: ventaEsp.cantidad, facturado_por: ventaEsp.facturado_por,
      fecha_venta: ventaEsp.fecha_venta || new Date().toISOString().split('T')[0],
      guia_factura: ventaEsp.guia_factura, comentarios: ventaEsp.comentarios,
      tipo_pago: ventaEsp.tipo_pago, num_cuotas: ventaEsp.num_cuotas,
      fechas_pago: ventaEsp.fechas_pago, status: ventaEsp.status,
    }])

    await supabase.from('caja').insert([{
      sede_id: sedeId, tipo: 'ingreso',
      concepto: 'Venta especializada - ' + nombreCliente,
      monto: ventaEsp.monto, metodo_pago: 'efectivo',
      cliente_nombre: nombreCliente, fecha: new Date().toISOString(),
    }])

    setGuardandoEsp(false)
    alert('Venta especializada registrada')
    setMostrarEspecializada(false)
    setVentaEsp({ mes: getMesActual(), cliente: '', ruc_dni: '', ciudad: '', vendedor: '', monto: 0, cantidad: 1, facturado_por: '', fecha_venta: '', guia_factura: '', comentarios: '', tipo_pago: 'directo', num_cuotas: 0, fechas_pago: '', status: 'verde' })
    setClienteEsp(null)
    setBusquedaClienteEsp('')
  }

  const categoriasUnicas = ['todos', ...categorias]

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
            <div>
              <h2 className="text-base md:text-lg font-semibold">Ventas diarias</h2>
              <p className="text-xs md:text-sm text-gray-400">POS</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMostrarNuevoProducto(true)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs hidden md:block">+ Producto</button>
            <button onClick={() => setMostrarEspecializada(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Venta especializada</button>
            {carrito.length > 0 && (
              <button onClick={() => setMostrarCarrito(true)} className="md:hidden bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold">
                🛒 {carrito.length} — S/ {total}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto p-3 md:p-6">
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {categoriasUnicas.map((cat) => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={'px-3 py-1 rounded-lg text-xs transition-all whitespace-nowrap ' + (categoriaFiltro === cat ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                  {cat === 'todos' ? 'Todos' : cat}
                </button>
              ))}
            </div>

            {productos.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-4">📦</p>
                <p className="text-sm mb-4">No hay productos en el catalogo</p>
                <button onClick={() => setMostrarNuevoProducto(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Agregar primer producto</button>
              </div>
            ) : (
              categorias.filter(cat => categoriaFiltro === 'todos' || cat === categoriaFiltro).map((cat) => {
                const prods = productosFiltrados.filter(p => p.categoria === cat)
                if (prods.length === 0) return null
                return (
                  <div key={cat} className="mb-4 md:mb-6">
                    <h3 className="text-xs text-gray-400 uppercase mb-2 md:mb-3">{cat}</h3>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {prods.map((producto: any) => (
                        <div key={producto.id} className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-3 md:p-4 transition-all">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs md:text-sm font-medium leading-tight flex-1">{producto.nombre}</p>
                            <button onClick={() => eliminarProducto(producto.id)} className="text-gray-600 hover:text-red-400 text-xs ml-1 flex-shrink-0">✕</button>
                          </div>
                          <p className="text-blue-400 font-bold text-sm mb-2">S/ {producto.precio}</p>
                          <button onClick={() => agregarAlCarrito(producto)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded-lg">
                            + Agregar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}

            {categoriaFiltro === 'todos' && productosFiltrados.filter(p => !p.categoria).length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs text-gray-400 uppercase mb-2">Sin categoria</h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {productosFiltrados.filter(p => !p.categoria).map((producto: any) => (
                    <div key={producto.id} className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-3 md:p-4 transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs md:text-sm font-medium leading-tight flex-1">{producto.nombre}</p>
                        <button onClick={() => eliminarProducto(producto.id)} className="text-gray-600 hover:text-red-400 text-xs ml-1">✕</button>
                      </div>
                      <p className="text-blue-400 font-bold text-sm mb-2">S/ {producto.precio}</p>
                      <button onClick={() => agregarAlCarrito(producto)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded-lg">+ Agregar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex w-80 bg-gray-900 border-l border-gray-800 flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold mb-3 text-sm">Detalle de venta</h3>
              <div className="relative">
                <input type="text" placeholder="Buscar cliente..." value={clienteSeleccionado ? clienteSeleccionado.nombres + ' ' + clienteSeleccionado.apellidos : busquedaCliente} onChange={(e) => { setBusquedaCliente(e.target.value); setClienteSeleccionado(null); setMostrarClientes(true) }} onFocus={() => setMostrarClientes(true)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                {mostrarClientes && busquedaCliente && (
                  <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-10 max-h-48 overflow-auto">
                    {clientesFiltrados.slice(0, 5).map(c => (
                      <button key={c.id} onClick={() => { setClienteSeleccionado(c); setBusquedaCliente(''); setMostrarClientes(false) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                        <p>{c.nombres} {c.apellidos}</p>
                        <p className="text-xs text-gray-400">{c.dni || 'Sin DNI'}</p>
                      </button>
                    ))}
                    <button onClick={() => setMostrarClientes(false)} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs text-blue-400 border-t border-gray-700">+ Usar nombre sin registrar</button>
                  </div>
                )}
              </div>
              {clienteSeleccionado && (
                <div className="mt-2 bg-blue-900 rounded-lg p-2 flex justify-between items-center">
                  <p className="text-xs text-blue-300">{clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</p>
                  <button onClick={() => setClienteSeleccionado(null)} className="text-blue-400 text-xs">X</button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4">
              {carrito.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">Haz click en un producto</div>
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
                        <button onClick={() => quitarDelCarrito(item.id)} className="text-red-400 text-lg">x</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-800">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span className="text-green-400">S/ {total}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['efectivo', 'tarjeta', 'yape'].map((metodo) => (
                  <button key={metodo} onClick={() => setMetodoPago(metodo)} className={'py-2 rounded-lg text-xs font-medium ' + (metodoPago === metodo ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400')}>
                    {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <input type="checkbox" id="cuotas" checked={cuotas} onChange={(e) => setCuotas(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="cuotas" className="text-sm text-gray-300">Cuotas</label>
                {cuotas && <input type="number" min={2} max={24} value={numeroCuotas} onChange={(e) => setNumeroCuotas(Number(e.target.value))} className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />}
              </div>
              <button onClick={cobrar} disabled={guardando} className={'w-full text-white py-3 rounded-lg font-bold ' + (guardando ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700')}>
                {guardando ? 'Guardando...' : 'Cobrar S/ ' + total}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mostrarNuevoProducto && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo producto al catalogo</h3>
              <button onClick={() => setMostrarNuevoProducto(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nombre del producto / servicio</label>
                <input type="text" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Precio S/</label>
                  <input type="number" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({...nuevoProducto, precio: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
                  <input type="text" value={nuevoProducto.categoria} onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} placeholder="ej: Servicio, Luna..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarNuevoProducto(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarNuevoProducto} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50 md:hidden">
          <div className="bg-gray-900 border-t border-gray-700 rounded-t-2xl p-6 w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Carrito</h3>
              <button onClick={() => setMostrarCarrito(false)} className="text-gray-400 text-xl">X</button>
            </div>
            <div className="relative mb-4">
              <input type="text" placeholder="Buscar cliente..." value={clienteSeleccionado ? clienteSeleccionado.nombres + ' ' + clienteSeleccionado.apellidos : busquedaCliente} onChange={(e) => { setBusquedaCliente(e.target.value); setClienteSeleccionado(null); setMostrarClientes(true) }} onFocus={() => setMostrarClientes(true)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              {mostrarClientes && busquedaCliente && (
                <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-10 max-h-40 overflow-auto">
                  {clientesFiltrados.slice(0, 5).map(c => (
                    <button key={c.id} onClick={() => { setClienteSeleccionado(c); setBusquedaCliente(''); setMostrarClientes(false) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">{c.nombres} {c.apellidos}</button>
                  ))}
                </div>
              )}
            </div>
            {clienteSeleccionado && (
              <div className="mb-3 bg-blue-900 rounded-lg p-2 flex justify-between items-center">
                <p className="text-xs text-blue-300">{clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</p>
                <button onClick={() => setClienteSeleccionado(null)} className="text-blue-400 text-xs">X</button>
              </div>
            )}
            <div className="space-y-2 mb-4">
              {carrito.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.nombre}</p>
                    <p className="text-xs text-gray-400">S/ {item.precio} x {item.cantidad}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold text-sm">S/ {item.precio * item.cantidad}</span>
                    <button onClick={() => quitarDelCarrito(item.id)} className="text-red-400 text-lg">x</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span className="text-green-400">S/ {total}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['efectivo', 'tarjeta', 'yape'].map((metodo) => (
                <button key={metodo} onClick={() => setMetodoPago(metodo)} className={'py-2 rounded-lg text-xs font-medium ' + (metodoPago === metodo ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400')}>
                  {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <input type="checkbox" checked={cuotas} onChange={(e) => setCuotas(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-gray-300">Cuotas</span>
              {cuotas && <input type="number" min={2} value={numeroCuotas} onChange={(e) => setNumeroCuotas(Number(e.target.value))} className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white" />}
            </div>
            <button onClick={cobrar} disabled={guardando} className={'w-full text-white py-4 rounded-lg font-bold text-lg ' + (guardando ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700')}>
              {guardando ? 'Guardando...' : 'Cobrar S/ ' + total}
            </button>
          </div>
        </div>
      )}

      {mostrarEspecializada && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Venta especializada</h3>
              <button onClick={() => setMostrarEspecializada(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Mes</label>
                  <select value={ventaEsp.mes} onChange={(e) => setVentaEsp({...ventaEsp, mes: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    {meses.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                  <div className="relative">
                    <input type="text" placeholder="Buscar cliente registrado..." value={clienteEsp ? clienteEsp.nombres + ' ' + clienteEsp.apellidos : busquedaClienteEsp} onChange={(e) => { setBusquedaClienteEsp(e.target.value); setClienteEsp(null); setMostrarClientesEsp(true); setVentaEsp({...ventaEsp, cliente: e.target.value}) }} onFocus={() => setMostrarClientesEsp(true)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                    {mostrarClientesEsp && busquedaClienteEsp && (
                      <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-20 max-h-36 overflow-auto">
                        {clientesEspFiltrados.slice(0, 5).map((c: any) => (
                          <button key={c.id} onClick={() => { setClienteEsp(c); setBusquedaClienteEsp(''); setMostrarClientesEsp(false); setVentaEsp({...ventaEsp, cliente: c.nombres + ' ' + c.apellidos, ruc_dni: c.dni || '', ciudad: c.ciudad || ''}) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs">
                            <p>{c.nombres} {c.apellidos}</p>
                            <p className="text-gray-400">{c.dni || '-'} — {c.ciudad || '-'}</p>
                          </button>
                        ))}
                        <button onClick={() => setMostrarClientesEsp(false)} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs text-blue-400 border-t border-gray-700">
                          + Usar "{busquedaClienteEsp}" sin registrar
                        </button>
                      </div>
                    )}
                  </div>
                  {clienteEsp && (
                    <div className="mt-1 bg-blue-900 rounded px-2 py-1 flex justify-between items-center">
                      <p className="text-xs text-blue-300">{clienteEsp.nombres} {clienteEsp.apellidos}</p>
                      <button onClick={() => setClienteEsp(null)} className="text-blue-400 text-xs">X</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">RUC / DNI</label>
                  <input type="text" value={ventaEsp.ruc_dni} onChange={(e) => setVentaEsp({...ventaEsp, ruc_dni: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" value={ventaEsp.ciudad} onChange={(e) => setVentaEsp({...ventaEsp, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Vendedor</label>
                  <input type="text" value={ventaEsp.vendedor} onChange={(e) => setVentaEsp({...ventaEsp, vendedor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" value={ventaEsp.monto} onChange={(e) => setVentaEsp({...ventaEsp, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Cantidad</label>
                  <input type="number" value={ventaEsp.cantidad} onChange={(e) => setVentaEsp({...ventaEsp, cantidad: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Facturado por</label>
                  <input type="text" value={ventaEsp.facturado_por} onChange={(e) => setVentaEsp({...ventaEsp, facturado_por: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha venta</label>
                  <input type="date" value={ventaEsp.fecha_venta} onChange={(e) => setVentaEsp({...ventaEsp, fecha_venta: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">N° Guia / Factura</label>
                  <input type="text" value={ventaEsp.guia_factura} onChange={(e) => setVentaEsp({...ventaEsp, guia_factura: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tipo de pago</label>
                  <select value={ventaEsp.tipo_pago} onChange={(e) => setVentaEsp({...ventaEsp, tipo_pago: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="directo">Directo</option>
                    <option value="credito">Credito</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Status</label>
                  <select value={ventaEsp.status} onChange={(e) => setVentaEsp({...ventaEsp, status: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="verde">Verde</option>
                    <option value="naranja">Naranja</option>
                    <option value="rojo">Rojo</option>
                  </select>
                </div>
              </div>
              {ventaEsp.tipo_pago === 'credito' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Numero de cuotas</label>
                    <input type="number" min={2} value={ventaEsp.num_cuotas || 2} onChange={(e) => setVentaEsp({...ventaEsp, num_cuotas: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Fechas de pago</label>
                    <input type="text" placeholder="ej: 01/04, 01/05" value={ventaEsp.fechas_pago} onChange={(e) => setVentaEsp({...ventaEsp, fechas_pago: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Comentarios</label>
                <textarea value={ventaEsp.comentarios} onChange={(e) => setVentaEsp({...ventaEsp, comentarios: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-16" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarEspecializada(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={registrarVentaEspecializada} disabled={guardandoEsp} className={'flex-1 text-white py-2 rounded-lg text-sm font-medium ' + (guardandoEsp ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700')}>
                {guardandoEsp ? 'Guardando...' : 'Registrar venta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}