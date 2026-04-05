'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AgendarCita() {
  const [doctores, setDoctores] = useState<any[]>([])
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '',
    doctor: '', fecha: '', hora: '',
    comentarios: ''
  })

  useEffect(() => { cargarDoctores() }, [])

  const cargarDoctores = async () => {
    const { data } = await supabase.from('doctores').select('id, nombres, apellidos, especialidad').eq('activo', true)
    setDoctores(data || [])
  }

  const hoy = new Date().toISOString().split('T')[0]

  const enviar = async () => {
    if (!form.nombre) { alert('Ingresa tu nombre'); return }
    if (!form.fecha) { alert('Selecciona una fecha'); return }
    if (!form.hora) { alert('Selecciona una hora'); return }

    setEnviando(true)
    const { error } = await supabase.from('citas').insert([{
      estado: 'programada',
      doctor: form.doctor || 'Sin asignar',
      fecha: form.fecha,
      hora: form.hora,
      notas: `Cliente: ${form.nombre} | Tel: ${form.telefono || '-'} | Email: ${form.email || '-'} | Comentarios: ${form.comentarios || '-'}`,
    }])

    setEnviando(false)
    if (error) { alert('Error al enviar. Intenta de nuevo.'); return }
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-md text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-2xl font-bold text-white mb-2">¡Cita registrada!</h2>
          <p className="text-gray-400 mb-2">Tu solicitud fue enviada correctamente.</p>
          <p className="text-gray-400 text-sm mb-6">Nos comunicaremos contigo para confirmar tu cita.</p>
          <button onClick={() => { setEnviado(false); setForm({ nombre: '', telefono: '', email: '', doctor: '', fecha: '', hora: '', comentarios: '' }) }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
            Agendar otra cita
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">👁️ OFTALMANAGER</h1>
          <h2 className="text-xl font-semibold text-white mb-1">Agendar una cita</h2>
          <p className="text-gray-400 text-sm">Completa el formulario y te confirmaremos tu cita</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nombre completo *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} placeholder="Tu nombre y apellido" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Telefono</label>
              <input type="tel" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} placeholder="999 999 999" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="tu@email.com" autoCapitalize="none" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Doctor / Especialista</label>
            {doctores.length > 0 ? (
              <select value={form.doctor} onChange={(e) => setForm({...form, doctor: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">Seleccionar doctor (opcional)</option>
                {doctores.map(d => (
                  <option key={d.id} value={d.nombres + ' ' + d.apellidos}>
                    {d.nombres} {d.apellidos} {d.especialidad ? '— ' + d.especialidad : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input type="text" value={form.doctor} onChange={(e) => setForm({...form, doctor: e.target.value})} placeholder="Nombre del doctor (opcional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fecha *</label>
              <input type="date" value={form.fecha} min={hoy} onChange={(e) => setForm({...form, fecha: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Hora *</label>
              <input type="time" value={form.hora} onChange={(e) => setForm({...form, hora: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Comentarios</label>
            <textarea value={form.comentarios} onChange={(e) => setForm({...form, comentarios: e.target.value})} placeholder="Motivo de consulta, sintomas, observaciones..." rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          <button onClick={enviar} disabled={enviando} className={'w-full py-4 rounded-lg font-medium text-white text-base transition-all ' + (enviando ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800')}>
            {enviando ? 'Enviando...' : '📅 Agendar cita'}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">OFTALMANAGER — Sistema de gestion clinica</p>
      </div>
    </div>
  )
}