'use client'
import { useState } from 'react'

const horarios = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
]

const doctores = [
  { id: 1, nombre: 'Dr. Garcia', especialidad: 'Refraccion y Contactologia' },
  { id: 2, nombre: 'Dra. Torres', especialidad: 'Retina y Glaucoma' },
  { id: 3, nombre: 'Dr. Mendoza', especialidad: 'Cirugia de Catarata' },
]

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function LandingCitas() {
  const [paso, setPaso] = useState(1)
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState('')
  const [mesActual, setMesActual] = useState(new Date())
  const [form, setForm] = useState({ nombres: '', apellidos: '', dni: '', telefono: '', email: '', motivo: '' })
  const [confirmado, setConfirmado] = useState(false)

  const hoy = new Date()

  const getDiasDelMes = () => {
    const year = mesActual.getFullYear()
    const month = mesActual.getMonth()
    const primerDia = new Date(year, month, 1).getDay()
    const diasEnMes = new Date(year, month + 1, 0).getDate()
    const dias = []
    for (let i = 0; i < primerDia; i++) dias.push(null)
    for (let i = 1; i <= diasEnMes; i++) dias.push(new Date(year, month, i))
    return dias
  }

  const esPasado = (fecha) => {
    if (!fecha) return true
    const hoyStr = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    return fecha < hoyStr || fecha.getDay() === 0
  }

  const confirmar = () => {
    if (!form.nombres || !form.apellidos || !form.telefono) {
      alert('Por favor completa los campos obligatorios')
      return
    }
    setConfirmado(true)
  }

  if (confirmado) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-green-400 mb-4">Cita confirmada</h1>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 text-left">
            <p className="text-sm text-gray-400 mb-1">Paciente</p>
            <p className="font-semibold mb-4">{form.nombres} {form.apellidos}</p>
            <p className="text-sm text-gray-400 mb-1">Doctor</p>
            <p className="font-semibold mb-4">{doctorSeleccionado.nombre}</p>
            <p className="text-sm text-gray-400 mb-1">Fecha y hora</p>
            <p className="font-semibold mb-4">{fechaSeleccionada.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las {horaSeleccionada}</p>
            <p className="text-sm text-gray-400 mb-1">Telefono de contacto</p>
            <p className="font-semibold">{form.telefono}</p>
          </div>
          <p className="text-gray-400 text-sm mb-6">Te enviaremos un recordatorio por WhatsApp antes de tu cita.</p>
          <button onClick={() => { setPaso(1); setConfirmado(false); setDoctorSeleccionado(null); setFechaSeleccionada(null); setHoraSeleccionada(''); setForm({ nombres: '', apellidos: '', dni: '', telefono: '', email: '', motivo: '' }) }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
            Agendar otra cita
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-400">👁 OFTALMANAGER</h1>
        <p className="text-sm text-gray-400">Reserva tu cita en segundos</p>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3, 4].map((p) => {
            return (
              <div key={p} className="flex items-center gap-3">
                <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ' + (paso >= p ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400')}>
                  {p}
                </div>
                {p < 4 && <div className={'h-px w-12 ' + (paso > p ? 'bg-blue-600' : 'bg-gray-700')}></div>}
              </div>
            )
          })}
          <div className="ml-2 text-sm text-gray-400">
            {paso === 1 ? 'Elige tu doctor' : paso === 2 ? 'Elige fecha y hora' : paso === 3 ? 'Tus datos' : 'Confirmar'}
          </div>
        </div>

        {paso === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Elige tu doctor</h2>
            <p className="text-gray-400 mb-6">Selecciona el especialista que deseas consultar</p>
            <div className="space-y-4">
              {doctores.map((doc) => {
                return (
                  <button
                    key={doc.id}
                    onClick={() => { setDoctorSeleccionado(doc); setPaso(2) }}
                    className="w-full bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-5 text-left transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                        {doc.nombre[4]}
                      </div>
                      <div>
                        <p className="font-semibold">{doc.nombre}</p>
                        <p className="text-sm text-gray-400">{doc.especialidad}</p>
                      </div>
                      <div className="ml-auto text-gray-400">→</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {paso === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Elige fecha y hora</h2>
            <p className="text-gray-400 mb-6">Doctor: {doctorSeleccionado.nombre}</p>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1))} className="text-gray-400 hover:text-white px-3 py-1 rounded">←</button>
                <h3 className="font-semibold">{meses[mesActual.getMonth()]} {mesActual.getFullYear()}</h3>
                <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1))} className="text-gray-400 hover:text-white px-3 py-1 rounded">→</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {diasSemana.map((d) => <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDiasDelMes().map((dia, i) => {
                  if (!dia) return <div key={i}></div>
                  const pasado = esPasado(dia)
                  const seleccionado = fechaSeleccionada && dia.toDateString() === fechaSeleccionada.toDateString()
                  return (
                    <button
                      key={i}
                      onClick={() => { if (!pasado) setFechaSeleccionada(dia) }}
                      className={'text-center py-2 rounded-lg text-sm transition-all ' + (seleccionado ? 'bg-blue-600 text-white' : pasado ? 'text-gray-700 cursor-not-allowed' : 'text-white hover:bg-gray-800')}
                    >
                      {dia.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            {fechaSeleccionada && (
              <div>
                <h3 className="font-medium mb-3 text-gray-300">Horarios disponibles</h3>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {horarios.map((h) => {
                    return (
                      <button
                        key={h}
                        onClick={() => setHoraSeleccionada(h)}
                        className={'py-2 rounded-lg text-sm transition-all ' + (horaSeleccionada === h ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-800 hover:border-blue-500 text-gray-300')}
                      >
                        {h}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setPaso(1)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg text-sm">
                Atras
              </button>
              <button
                onClick={() => { if (fechaSeleccionada && horaSeleccionada) setPaso(3); else alert('Elige una fecha y hora') }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Tus datos</h2>
            <p className="text-gray-400 mb-6">Completa tu informacion para confirmar la cita</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombres *</label>
                  <input type="text" value={form.nombres} onChange={(e) => setForm({...form, nombres: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Apellidos *</label>
                  <input type="text" value={form.apellidos} onChange={(e) => setForm({...form, apellidos: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">DNI</label>
                  <input type="text" value={form.dni} onChange={(e) => setForm({...form, dni: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Telefono *</label>
                  <input type="text" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Motivo de consulta</label>
                <textarea value={form.motivo} onChange={(e) => setForm({...form, motivo: e.target.value})} placeholder="Describe brevemente el motivo de tu consulta..." className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setPaso(2)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg text-sm">
                Atras
              </button>
              <button onClick={() => setPaso(4)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium">
                Continuar
              </button>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Confirmar cita</h2>
            <p className="text-gray-400 mb-6">Revisa los datos antes de confirmar</p>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Doctor</span>
                <span className="font-medium">{doctorSeleccionado.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Especialidad</span>
                <span className="font-medium">{doctorSeleccionado.especialidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fecha</span>
                <span className="font-medium">{fechaSeleccionada.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hora</span>
                <span className="font-medium">{horaSeleccionada}</span>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Paciente</span>
                  <span className="font-medium">{form.nombres} {form.apellidos}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Telefono</span>
                <span className="font-medium">{form.telefono}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPaso(3)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg text-sm">
                Atras
              </button>
              <button onClick={confirmar} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm font-bold">
                Confirmar cita
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
