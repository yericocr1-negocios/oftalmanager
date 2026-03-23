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

const citasIniciales = [
  { id: 1, hora: '08:00', paciente: 'Juan Perez', doctor: 'Dr. Garcia', especialidad: 'Refraccion', estado: 'confirmada', duracion: 30 },
  { id: 2, hora: '08:30', paciente: 'Maria Lopez', doctor: 'Dr. Garcia', especialidad: 'Catarata', estado: 'programada', duracion: 45 },
  { id: 3, hora: '09:15', paciente: 'Carlos Ramirez', doctor: 'Dra. Torres', especialidad: 'Glaucoma', estado: 'confirmada', duracion: 30 },
  { id: 4, hora: '10:00', paciente: 'Ana Flores', doctor: 'Dra. Torres', especialidad: 'Retina', estado: 'en_atencion', duracion: 60 },
  { id: 5, hora: '11:00', paciente: 'Luis Mendoza', doctor: 'Dr. Garcia', especialidad: 'Refraccion', estado: 'programada', duracion: 30 },
]

const colores: Record<string, string> = {
  confirmada: 'bg-green-900 text-green-400',
  programada: 'bg-blue-900 text-blue-400',
  en_atencion: 'bg-orange-900 text-orange-400',
  no_vino: 'bg-red-900 text-red-400',
}

const estadoLabel: Record<string, string> = {
  confirmada: 'Confirmada',
  programada: 'Programada',
  en_atencion: 'En atencion',
  no_vino: 'No vino',
}

export default function Agenda() {
  const [citas, setCitas] = useState(citasIniciales)
  const [mostrar, setMostrar] = useState(false)
  const [filtroDoctor, setFiltroDoctor] = useState('todos')
  const [especialidadOtro, setEspecialidadOtro] = useState(false)
  const [nuevaCita, setNuevaCita] = useState({
    paciente: '', doctor: 'Dr. Garcia', especialidad: '', hora: '', fecha: '', duracion: 30
  })

  const citasFiltradas = filtroDoctor === 'todos'
    ? citas
    : citas.filter(c => c.doctor === filtroDoctor)

  const cambiarEstado = (id: number, nuevoEstado: string) => {
    setCitas(citas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c))
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">OFTALMANAGER</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) => {
            return (
              <a href={item.href} key={item.label} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 text-sm">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Agenda</h2>
            <p className="text-sm text-gray-400">Citas del dia</p>
          </div>
          <div className="flex gap-3">
            <a href="/citas" target="_blank" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
              🔗 Link para pacientes
            </a>
            <button onClick={() => setMostrar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              + Nueva cita
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex gap-3 mb-6">
            {['todos', 'Dr. Garcia', 'Dra. Torres'].map((doc) => {
              return (
                <button
                  key={doc}
                  onClick={() => setFiltroDoctor(doc)}
                  className={'px-4 py-2 rounded-lg text-sm transition-all ' + (filtroDoctor === doc ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}
                >
                  {doc === 'todos' ? 'Todos los doctores' : doc}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total citas', value: citas.length, color: 'text-white' },
              { label: 'Confirmadas', value: citas.filter(c => c.estado === 'confirmada').length, color: 'text-green-400' },
              { label: 'En atencion', value: citas.filter(c => c.estado === 'en_atencion').length, color: 'text-orange-400' },
              { label: 'No vinieron', value: citas.filter(c => c.estado === 'no_vino').length, color: 'text-red-400' },
            ].map((card) => {
              return (
                <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                  <p className={'text-2xl font-bold ' + card.color}>{card.value}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="font-medium">Citas del dia</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {citasFiltradas.map((cita) => {
                return (
                  <div key={cita.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-16">
                        <p className="text-lg font-bold text-blue-400">{cita.hora}</p>
                        <p className="text-xs text-gray-500">{cita.duracion} min</p>
                      </div>
                      <div className="w-px h-12 bg-gray-700"></div>
                      <div>
                        <p className="font-medium text-sm">{cita.paciente}</p>
                        <p className="text-xs text-gray-400">{cita.doctor} — {cita.especialidad}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={cita.estado}
                        onChange={(e) => cambiarEstado(cita.id, e.target.value)}
                        className={'text-xs px-3 py-1 rounded-full border-0 cursor-pointer ' + colores[cita.estado]}
                      >
                        <option value="programada">Programada</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="en_atencion">En atencion</option>
                        <option value="no_vino">No vino</option>
                      </select>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {mostrar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva cita</h3>
              <button onClick={() => setMostrar(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Paciente</label>
                <input type="text" placeholder="Nombre del paciente..." onChange={(e) => setNuevaCita({...nuevaCita, paciente: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Doctor</label>
                  <select onChange={(e) => setNuevaCita({...nuevaCita, doctor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option>Dr. Garcia</option>
                    <option>Dra. Torres</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Especialidad</label>
                  <select onChange={(e) => setEspecialidadOtro(e.target.value === 'otro')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Seleccionar...</option>
                    <option value="refraccion">Refraccion</option>
                    <option value="catarata">Catarata</option>
                    <option value="retina">Retina</option>
                    <option value="glaucoma">Glaucoma</option>
                    <option value="otro">Otro</option>
                  </select>
                  {especialidadOtro && (
                    <input type="text" placeholder="Escribe la especialidad..." className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
                  <input type="date" onChange={(e) => setNuevaCita({...nuevaCita, fecha: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Hora</label>
                  <input type="time" onChange={(e) => setNuevaCita({...nuevaCita, hora: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrar(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">
                Cancelar
              </button>
              <button onClick={() => { setMostrar(false) }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                Guardar cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
