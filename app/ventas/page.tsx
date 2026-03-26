'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const EMPRESA_ID = 'b2711600-fbf7-4f11-b699-8024e36c7cf5'
const SEDE_ID = 'd976f6cb-01f1-4962-a728-1a1012ffc305'
const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

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
const getMesActual = () => meses[new Date().getMonth()]

export default function VentasDiarias() {
  const [carrito, setCarrito] = useState([])
  const [clientes, setClientes] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [mostrarClientes, setMostrarClientes] = useState(false)
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [mostrarEspecializada, setMostrarEspecializada] = useState(false)
  const [cuotas, setCuotas] = useState(false)
  const [numeroCuotas, setNumeroCuotas] = useState(2)
  const [guardando, setGuardando] = useState(false)
  const [guardandoEsp, setGuardandoEsp] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [mostrarCarrito, setMostrarCarrito] = useState(false)
  const [clienteEsp, setClienteEsp] = useState(null)
  const [busquedaClienteEsp, setBusquedaClienteEsp] = useState('')
  const [mostrarClientesEsp, setMostrarClientesEsp] = useState(false)
  const [ventaEsp, setVentaEsp] = useState({
    mes: getMesActual(), cliente: '', ruc_dni: '', ciudad: '', vendedor: '',
    monto: 0, cantidad: 1, facturado_por: '', fecha_venta: '',
    guia_factura: '', comentarios: '', tipo_pago: 'directo',
    num_cuotas: 0, fechas_pago: '', status: 'verde'
  })

  useEffect(() => { cargarClientes() }, [])

  const cargarClientes = async () => {
    const { data } = await supabase.from('pacientes').select('id, nombres, apellidos, dni, telefono, ciudad').order('nombres')
    setClientes(data || [])
  }

  const clientesFiltrados = clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    (c.dni || '').includes(busquedaCliente)
  )

  const clientesEspFiltrados = clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(busquedaClienteEsp.toLowerCase()) ||
    (c.dni || '').includes(busquedaClienteEsp)
  )

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
    setMostrarCarrito(true)
  }

  const quitarDelCarrito = (id) => setCarrito(carrito.filter(item => item.id !== id))
  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const total = subtotal

  const generarFechasCuotas = (numCuotas) => {
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
    setGuardando(true)

    const nombreCliente = clienteSeleccionado
      ? clienteSeleccionado.nombres + ' ' + clienteSeleccionado.apellidos
      : busquedaCliente

    const { data: ventaData, error } = await supabase
      .from('ventas')
      .insert([{
        empresa_id: EMPRESA_ID, sede_id: SEDE_ID,
        paciente_id: clienteSeleccionado ? clienteSeleccionado.id : null,
        subtotal, total, metodo_pago: metodoPago,
        estado: 'pagado', notas: nombreCliente,
        tipo_comprobante: 'boleta', cliente_nombre: nombreCliente,
        num_cuotas: cuotas ? numeroCuotas : 0,
      }])
      .select().single()

    if (error) { alert('Error: ' + error.message); setGuardando(false); return }

    for (const item of carrito) {
      await supabase.from('ventas_detalle').insert([{
        venta_id: ventaData.id, cantidad: item.cantidad,
        precio_unitario: item.precio, subtotal: item.precio * item.cantidad,
        nombre_producto: item.nombre,
      }])
    }

    await supabase.from('caja').insert([{
      sede_id: SEDE_ID, tipo: 'ingreso',
      concepto: 'Venta - ' + carrito.map(i => i.nombre).join(', '),
      monto: total, metodo_pago: metodoPago,
      venta_id: ventaData.id, cliente_nombre: nombreCliente,
      fecha: new Date().toISOString(),
    }])

    if (cuotas && numeroCuotas > 1) {
      const fechas = generarFechasCuotas(numeroCuotas)
      const montoCuota = Math.round(total / numeroCuotas)
      for (let i = 0; i < numeroCuotas; i++) {
        await supabase.from('cuotas_pago').insert([{
          venta_id: ventaData.id, empresa_id: EMPRESA_ID,
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
    setGuardandoEsp(true)

    const nombreCliente = clienteEsp ? clienteEsp.nombres + ' ' + clienteEsp.apellidos : ventaEsp.cliente
    const rucDni = clienteEsp ? (clienteEsp.dni || ventaEsp.ruc_dni) : ventaEsp.ruc_dni
    const ciudad = clienteEsp ? (clienteEsp.ciudad || ventaEsp.ciudad) : ventaEsp.ciudad
    const fechasCuotas = ventaEsp.tipo_pago === 'credito' && ventaEsp.num_cuotas > 1 ? generarFechasCuotas(ventaEsp.num_cuotas).join(', ') : ''

    const { error } = await supabase.from('ventas_especializadas').insert([{
      empresa_id: EMPRESA_ID, sede_id: SEDE_ID,
      paciente_id: clienteEsp ? clienteEsp.id : null,
      mes: ventaEsp.mes, cliente: nombreCliente, ruc_dni: rucDni,
      ciudad, vendedor: ventaEsp.vendedor, monto: ventaEsp.monto,
      cantidad: ventaEsp.cantidad, facturado_por: ventaEsp.facturado_por,
      fecha_venta: ventaEsp.fecha_venta || new Date().toISOString().split('T')[0],
      guia_factura: ventaEsp.guia_factura, comentarios: ventaEsp.comentarios,
      tipo_pago: ventaEsp.tipo_pago, num_cuotas: ventaEsp.num_cuotas,
      fechas_pago: ventaEsp.fechas_pago || fechasCuotas, status: ventaEsp.status,
    }])

    if (error) { alert('Error: ' + error.message); setGuardandoEsp(false); return }

    await supabase.from('caja').insert([{
      sede_id: SEDE_ID, tipo: 'ingreso',
      concepto: 'Venta especializada - ' + nombreCliente,
      monto: ventaEsp.monto, metodo_pago: 'efectivo',
      cliente_nombre: nombreCliente, fecha: new Date().toISOString(),
    }])

    if (ventaEsp.tipo_pago === 'credito' && ventaEsp.num_cuotas > 1) {
      const fechas = generarFechasCuotas(ventaEsp.num_cuotas)
      const montoCuota = Math.round(ventaEsp.monto / ventaEsp.num_cuotas)
      for (let i = 0; i < ventaEsp.num_cuotas; i++) {
        await supabase.from('cuotas_pago').insert([{
          empresa_id: EMPRESA_ID, cliente_nombre: nombreCliente,
          numero_cuota: i + 1, monto: montoCuota,
          fecha_vencimiento: fechas[i], estado: 'pendiente',
        }])
      }
    }

    setGuardandoEsp(false)
    alert('Venta especializada registrada')
    setMostrarEspecializada(false)
    setVentaEsp({ mes: getMesActual(), cliente: '', ruc_dni: '', ciudad: '', vendedor: '', monto: 0, cantidad: 1, facturado_por: '', fecha_venta: '', guia_factura: '', comentarios: '', tipo_pago: 'directo', num_cuotas: 0, fechas_pago: '', status: 'verde' })
    setClienteEsp(null)
    setBusquedaClienteEsp('')
  }

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
            <button onClick={() => setMostrarEspecializada(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">
              + Especializada
            </button>
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
              {['todos', ...categorias].map((cat) => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={'px-3 py-1 rounded-lg text-xs transition-all whitespace-nowrap ' + (categoriaFiltro === cat ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                  {cat === 'todos' ? 'Todos' : cat}
                </button>
              ))}
            </div>
            {categorias.filter(cat => categoriaFiltro === 'todos' || cat === categoriaFiltro).map((cat) => {
              const prods = productosFiltrados.filter(p => p.categoria === cat)
              if (prods.length === 0) return null
              return (
                <div key={cat} className="mb-4 md:mb-6">
                  <h3 className="text-xs text-gray-400 uppercase mb-2 md:mb-3">{cat}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3">
                    {prods.map((producto) => (
                      <button key={producto.id} onClick={() => agregarAlCarrito(producto)} className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-3 md:p-4 text-left transition-all">
                        <p className="text-xs md:text-sm font-medium leading-tight">{producto.nombre}</p>
                        <p className="text-blue-400 font-bold mt-1 text-sm">S/ {producto.precio}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden md:flex w-80 bg-gray-900 border-l border-gray-800 flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold mb-3 text-sm">Detalle de venta</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={clienteSeleccionado ? clienteSeleccionado.nombres + ' ' + clienteSeleccionado.apellidos : busquedaCliente}
                  onChange={(e) => { setBusquedaCliente(e.target.value); setClienteSeleccionado(null); setMostrarClientes(true) }}
                  onFocus={() => setMostrarClientes(true)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                {mostrarClientes && busquedaCliente && (
                  <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-10 max-h-48 overflow-auto">
                    {clientesFiltrados.slice(0, 5).map(c => (
                      <button key={c.id} onClick={() => { setClienteSeleccionado(c); setBusquedaCliente(''); setMostrarClientes(false) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                        <p>{c.nombres} {c.apellidos}</p>
                        <p className="text-xs text-gray-400">{c.dni || 'Sin DNI'}</p>
                      </button>
                    ))}
                    <button onClick={() => setMostrarClientes(false)} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs text-blue-400 border-t border-gray-700">
                      + Usar nombre sin registrar
                    </button>
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
              <div className="mb-3">
                <div className="grid grid-cols-3 gap-2">
                  {['efectivo', 'tarjeta', 'yape'].map((metodo) => (
                    <button key={metodo} onClick={() => setMetodoPago(metodo)} className={'py-2 rounded-lg text-xs font-medium ' + (metodoPago === metodo ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400')}>
                      {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3 flex items-center gap-3">
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

      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50 md:hidden">
          <div className="bg-gray-900 border-t border-gray-700 rounded-t-2xl p-6 w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Carrito</h3>
              <button onClick={() => setMostrarCarrito(false)} className="text-gray-400 text-xl">X</button>
            </div>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={clienteSeleccionado ? clienteSeleccionado.nombres + ' ' + clienteSeleccionado.apellidos : busquedaCliente}
                onChange={(e) => { setBusquedaCliente(e.target.value); setClienteSeleccionado(null); setMostrarClientes(true) }}
                onFocus={() => setMostrarClientes(true)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              {mostrarClientes && busquedaCliente && (
                <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-10 max-h-40 overflow-auto">
                  {clientesFiltrados.slice(0, 5).map(c => (
                    <button key={c.id} onClick={() => { setClienteSeleccionado(c); setBusquedaCliente(''); setMostrarClientes(false) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                      {c.nombres} {c.apellidos}
                    </button>
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
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={clienteEsp ? clienteEsp.nombres + ' ' + clienteEsp.apellidos : busquedaClienteEsp}
                      onChange={(e) => { setBusquedaClienteEsp(e.target.value); setClienteEsp(null); setMostrarClientesEsp(true); setVentaEsp({...ventaEsp, cliente: e.target.value}) }}
                      onFocus={() => setMostrarClientesEsp(true)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    {mostrarClientesEsp && busquedaClienteEsp && (
                      <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-20 max-h-36 overflow-auto">
                        {clientesEspFiltrados.slice(0, 4).map(c => (
                          <button key={c.id} onClick={() => { setClienteEsp(c); setBusquedaClienteEsp(''); setMostrarClientesEsp(false); setVentaEsp({...ventaEsp, cliente: c.nombres + ' ' + c.apellidos, ruc_dni: c.dni || '', ciudad: c.ciudad || ''}) }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-xs">
                            <p>{c.nombres} {c.apellidos}</p>
                            <p className="text-gray-400">{c.dni || '-'}</p>
                          </button>
                        ))}
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