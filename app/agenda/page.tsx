'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const EMPRESA_ID = 'b2711600-fbf7-4f11-b699-8024e36c7cf5'
const SEDE_ID = 'd976f6cb-01f1-4962-a728-1a1012ffc305'

const colores = {
  confirmada: 'bg-green-900 text-green-400',
  programada: 'bg-blue-900 text-blue-400',
  en_atencion: 'bg-orange-900 text-orange-400',
  no_vino: 'bg-red-900 text-red-400',
}

export default function Agenda() {
  const [citas, setCitas] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrar, setMostrar] = useState(false)
  const [filtroDoctor, setFiltroDoctor] = useState('todos')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [mostrarClientes, setMostrarClientes] = useState(false)
  const [nueva, setNueva] = useState({
    doctor: '', especialidad: '', fecha: '', hora: '', duracion: 30, notas: ''
  })

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    const hoy = new Date().toISOString().split('T')[0]
    const { data: citasData } = await supabase
      .from('citas')
      .select('*, pacientes(nombres, apellidos)')
      .gte('fecha', hoy)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })
    setCitas(citasData || [])

    const { data: clientesData } = await supabase
      .from('pacientes')
      .select('id, nombres, apellidos, telefono')
      .order('nombres')
    setClientes(clientesData || [])
    setCargando(false)
  }

  const clientesFiltrados = clientes.filter(c =>
    (c.nombres + ' ' + c.apellidos).toLowerCase().includes(busquedaCliente.toLowerCase())
  )

  const cambiarEstado = async (id, estado) => {
    await supabase.from('citas').update({ estado }).eq('id', id)
    setCitas(citas.map(c => c.id === id ? { ...c, estado } : c))
  }

  const guardarCita = async () => {
    if (!nueva.doctor) { alert('Ingresa el doctor'); return }
    if (!nueva.fecha) { alert('Ingresa la fecha'); return }
    if (!nueva.hora) { alert('Ingresa la hora'); return }

    const { data, error } = await supabase.from('citas').insert([{
      empresa_id: EMPRESA_ID,
      sede_id: SEDE_ID,
      paciente_id: clienteSeleccionado ? clienteSeleccionado.id : null,
      doctor: nueva.doctor,
      especialidad: nueva.especialidad,
      fecha: nueva.fecha,
      hora: nueva.hora,
      duracion: nueva.duracion,
      estado: 'programada',
      notas: nueva.notas,
    }]).select('*, pacientes(nombres, apellidos)').single()

    if (error) { alert('Error: ' + error.message); return }
    setCitas([...citas, data])
    setMostrar(false)
    setNueva({ doctor: '', especialidad: '', fecha: '', hora: '', duracion: 30, notas: '' })
    setClienteSeleccionado(null)
    setBusquedaCliente('')
  }

  const doctores = [...new Set(citas.map(c => c.doctor).filter(Boolean))]

  const citasFiltradas = filtroDoctor === 'todos'
    ? citas
    : citas.filter(c => c.doctor === filtroDoctor)

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white">☰</button>
            <div>
              <h2 className="text-lg font-semibold">Agenda</h2>
              <p className="text-sm text-gray-400">{citasFiltradas.length} citas</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <a href="/citas" target="_blank" className="bg-gray-700 hover:bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm hidden md:block">
              🔗 Link pacientes
            </a>
            <button onClick={() => setMostrar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">
              + Nueva cita
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              { label: 'Total citas', value: citas.length, color: 'text-white' },
              { label: 'Confirmadas', value: citas.filter(c => c.estado === 'confirmada').length, color: 'text-green-400' },
              { label: 'En atencion', value: citas.filter(c => c.estado === 'en_atencion').length, color: 'text-orange-400' },
              { label: 'No vinieron', value: citas.filter(c => c.estado === 'no_vino').length, color: 'text-red-400' },
            ].map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className={'text-2xl font-bold ' + card.color}>{card.value}</p>
              </div>
            ))}
          </div>

          {doctores.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {['todos', ...doctores].map((doc) => (
                <button key={doc} onClick={() => setFiltroDoctor(doc)} className={'px-3 py-1 rounded-lg text-xs transition-all ' + (filtroDoctor === doc ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                  {doc === 'todos' ? 'Todos' : doc}
                </button>
              ))}
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-800">
              <h3 className="font-medium text-sm md:text-base">Proximas citas</h3>
            </div>
            {cargando ? (
              <div className="text-center text-gray-400 py-12">Cargando citas...</div>
            ) : citasFiltradas.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-4">📅</p>
                <p className="text-sm">No hay citas programadas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {citasFiltradas.map((cita) => (
                  <div key={cita.id} className="px-4 md:px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-all">
                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                      <div className="text-center w-14 md:w-16 flex-shrink-0">
                        <p className="text-sm md:text-lg font-bold text-blue-400">{cita.hora?.slice(0,5)}</p>
                        <p className="text-xs text-gray-500">{cita.fecha}</p>
                      </div>
                      <div className="w-px h-10 bg-gray-700 hidden md:block"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {cita.pacientes ? cita.pacientes.nombres + ' ' + cita.pacientes.apellidos : 'Sin paciente'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{cita.doctor} {cita.especialidad ? '— ' + cita.especialidad : ''}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <select
                        value={cita.estado}
                        onChange={(e) => cambiarEstado(cita.id, e.target.value)}
                        className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer ' + colores[cita.estado]}
                      >
                        <option value="programada">Programada</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="en_atencion">En atencion</option>
                        <option value="no_vino">No vino</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mostrar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva cita</h3>
              <button onClick={() => setMostrar(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Paciente</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
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
                  <div className="mt-1 bg-blue-900 rounded px-2 py-1 flex justify-between items-center">
                    <p className="text-xs text-blue-300">{clienteSeleccionado.nombres} {clienteSeleccionado.apellidos}</p>
                    <button onClick={() => setClienteSeleccionado(null)} className="text-blue-400 text-xs">X</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Doctor</label>
                  <input type="text" value={nueva.doctor} onChange={(e) => setNueva({...nueva, doctor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Especialidad</label>
                  <input type="text" value={nueva.especialidad} onChange={(e) => setNueva({...nueva, especialidad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
                  <input type="date" value={nueva.fecha} onChange={(e) => setNueva({...nueva, fecha: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Hora</label>
                  <input type="time" value={nueva.hora} onChange={(e) => setNueva({...nueva, hora: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Notas</label>
                <textarea value={nueva.notas} onChange={(e) => setNueva({...nueva, notas: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrar(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarCita} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar cita</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}