'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const menu = [
  { icon: '🏠', label: 'Dashboard', href: '/' },
  { icon: '👤', label: 'Clientes (pacientes)', href: '/pacientes' },
  { icon: '📅', label: 'Agenda', href: '/agenda' },
  { icon: '💰', label: 'Ventas diarias', href: '/ventas' },
  { icon: '📦', label: 'Inventario', href: '/inventario' },
  { icon: '💳', label: 'Finanzas', href: '/finanzas' },
  { icon: '📊', label: 'Reportes', href: '/reportes' },
  { icon: '⚙️', label: 'Config', href: '/configuracion' },
]

const statusColors = {
  verde: 'bg-green-500',
  naranja: 'bg-orange-500',
  rojo: 'bg-red-500',
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [nuevo, setNuevo] = useState({
    nombres: '', apellidos: '', dni: '', telefono: '', email: '', ciudad: '', direccion: '', genero: '', encargado: '', status: 'verde'
  })

  useEffect(() => {
    cargarPacientes()
  }, [])

  const cargarPacientes = async () => {
    setCargando(true)
    const { data } = await supabase
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false })
    setPacientes(data || [])
    setCargando(false)
  }

  const guardarPaciente = async () => {
    if (!nuevo.nombres || !nuevo.apellidos) {
      alert('Nombres y apellidos son obligatorios')
      return
    }
    const { error } = await supabase.from('pacientes').insert([nuevo])
    if (error) {
      alert('Error al guardar: ' + error.message)
    } else {
      alert('Cliente guardado correctamente')
      setMostrar(false)
      setNuevo({ nombres: '', apellidos: '', dni: '', telefono: '', email: '', ciudad: '', direccion: '', genero: '', encargado: '', status: 'verde' })
      cargarPacientes()
    }
  }

  const cambiarStatus = async (id, status) => {
    await supabase.from('pacientes').update({ status }).eq('id', id)
    setPacientes(pacientes.map(p => p.id === id ? { ...p, status } : p))
  }

  const filtrados = pacientes.filter(p =>
    (p.nombres + ' ' + p.apellidos).toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.dni || '').includes(busqueda) ||
    (p.telefono || '').includes(busqueda)
  )

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
            <h2 className="text-lg font-semibold">Clientes (pacientes)</h2>
            <p className="text-sm text-gray-400">{filtrados.length} clientes encontrados</p>
          </div>
          <button onClick={() => setMostrar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            + Nuevo cliente
          </button>
        </div>

        <div className="p-8">
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o telefono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-6"
          />

          {cargando ? (
            <div className="text-center text-gray-400 py-12">Cargando clientes...</div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Cliente</th>
                    <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">RUC/DNI</th>
                    <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Telefono</th>
                    <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Ciudad</th>
                    <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Encargado</th>
                    <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Status</th>
                    <th className="text-left px-6 py-4 text-xs text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                        No hay clientes registrados. Agrega el primero.
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((p) => (
                      <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                              {p.nombres[0]}
                            </div>
                            <span className="text-sm">{p.nombres} {p.apellidos}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{p.dni || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{p.telefono || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{p.ciudad || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{p.encargado || '-'}</td>
                        <td className="px-6 py-4">
                          <select
                            value={p.status || 'verde'}
                            onChange={(e) => cambiarStatus(p.id, e.target.value)}
                            className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' + (statusColors[p.status || 'verde'])}
                          >
                            <option value="verde">Verde</option>
                            <option value="naranja">Naranja</option>
                            <option value="rojo">Rojo</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <a href={'/pacientes/' + p.id} className="text-blue-400 hover:text-blue-300 text-sm mr-3">Ver</a>
                          <button className="text-gray-400 hover:text-gray-300 text-sm">Editar</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {mostrar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo cliente</h3>
              <button onClick={() => setMostrar(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombres</label>
                  <input type="text" value={nuevo.nombres} onChange={(e) => setNuevo({...nuevo, nombres: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Apellidos</label>
                  <input type="text" value={nuevo.apellidos} onChange={(e) => setNuevo({...nuevo, apellidos: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">DNI / RUC</label>
                  <input type="text" value={nuevo.dni} onChange={(e) => setNuevo({...nuevo, dni: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Telefono</label>
                  <input type="text" value={nuevo.telefono} onChange={(e) => setNuevo({...nuevo, telefono: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" value={nuevo.email} onChange={(e) => setNuevo({...nuevo, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" value={nuevo.ciudad} onChange={(e) => setNuevo({...nuevo, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Direccion</label>
                <input type="text" value={nuevo.direccion} onChange={(e) => setNuevo({...nuevo, direccion: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Encargado</label>
                  <input type="text" value={nuevo.encargado} onChange={(e) => setNuevo({...nuevo, encargado: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Status inicial</label>
                  <select value={nuevo.status} onChange={(e) => setNuevo({...nuevo, status: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="verde">Verde</option>
                    <option value="naranja">Naranja</option>
                    <option value="rojo">Rojo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrar(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">
                Cancelar
              </button>
              <button onClick={guardarPaciente} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                Guardar cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}