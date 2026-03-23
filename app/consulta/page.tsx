'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

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

const campoVacio = { esferico: '', cilindro: '', eje: '', av_cc: '', dip: '', altura: '' }

export default function Consulta() {
  const [grabando, setGrabando] = useState(false)
  const [doctor, setDoctor] = useState('')
  const [fecha, setFecha] = useState('')
  const [tipoPrescripcion, setTipoPrescripcion] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [adicionMedia, setAdicionMedia] = useState('')
  const [dipCerca, setDipCerca] = useState('')

  const [lejosOD, setLejosOD] = useState({...campoVacio})
  const [lejosOI, setLejosOI] = useState({...campoVacio})
  const [cercaOD, setCercaOD] = useState({...campoVacio})
  const [cercaOI, setCercaOI] = useState({...campoVacio})
  const [interOD, setInterOD] = useState({...campoVacio})
  const [interOI, setInterOI] = useState({...campoVacio})

  const dictar = () => {
    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = 'es-PE'
    recognition.continuous = false
    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript
      setComentarios(prev => prev + ' ' + texto)
    }
    recognition.start()
    setGrabando(true)
    setTimeout(() => setGrabando(false), 5000)
  }

  const guardar = async () => {
    if (!doctor) {
      alert('Ingresa el nombre del doctor')
      return
    }
    if (!fecha) {
      alert('Ingresa la fecha de prescripcion')
      return
    }

    const consulta = {
      fecha_consulta: fecha,
      especialidad: 'refraccion',
      motivo_consulta: tipoPrescripcion,
      observaciones: comentarios,
      esfera_od: lejosOD.esferico || null,
      cilindro_od: lejosOD.cilindro || null,
      eje_od: lejosOD.eje || null,
      av_od_cc: lejosOD.av_cc || null,
      esfera_oi: lejosOI.esferico || null,
      cilindro_oi: lejosOI.cilindro || null,
      eje_oi: lejosOI.eje || null,
      av_oi_cc: lejosOI.av_cc || null,
    }

    const { error } = await supabase
      .from('historias_clinicas')
      .insert([consulta])

    if (error) {
      alert('Error al guardar: ' + error.message)
    } else {
      alert('Consulta guardada correctamente')
    }
  }
  const InputCampo = ({ label, value, onChange }) => (
    <input
      type="text"
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-center"
    />
  )

  const FilaOjo = ({ ojo, data, setData, conAdicion }) => (
    <tr className="border-b border-gray-700">
      <td className="px-3 py-2 text-xs text-gray-400 font-medium whitespace-nowrap">{ojo}</td>
      <td className="px-1 py-2 w-20"><InputCampo label="+/-" value={data.esferico} onChange={(v) => setData({...data, esferico: v})} /></td>
      <td className="px-1 py-2 w-20"><InputCampo label="+/-" value={data.cilindro} onChange={(v) => setData({...data, cilindro: v})} /></td>
      <td className="px-1 py-2 w-16"><InputCampo label="°" value={data.eje} onChange={(v) => setData({...data, eje: v})} /></td>
      <td className="px-1 py-2 w-20"><InputCampo label="20/" value={data.av_cc} onChange={(v) => setData({...data, av_cc: v})} /></td>
      <td className="px-1 py-2 w-16"><InputCampo label="mm" value={data.dip} onChange={(v) => setData({...data, dip: v})} /></td>
      <td className="px-1 py-2 w-16"><InputCampo label="mm" value={data.altura} onChange={(v) => setData({...data, altura: v})} /></td>
      {conAdicion && (
        <td className="px-1 py-2 w-20"><InputCampo label="+/-" value={adicionMedia} onChange={setAdicionMedia} /></td>
      )}
    </tr>
  )

  const TablaVision = ({ titulo, od, setOd, oi, setOi, conAdicion }) => (
    <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h4 className="text-sm font-medium text-blue-400">{titulo}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-3 py-2 text-left text-xs text-gray-500"></th>
              <th className="px-1 py-2 text-center text-xs text-gray-400">Esferico</th>
              <th className="px-1 py-2 text-center text-xs text-gray-400">Cilindro</th>
              <th className="px-1 py-2 text-center text-xs text-gray-400">Eje</th>
              <th className="px-1 py-2 text-center text-xs text-gray-400">A.V C/c</th>
              <th className="px-1 py-2 text-center text-xs text-gray-400">DIP</th>
              <th className="px-1 py-2 text-center text-xs text-gray-400">Altura</th>
              {conAdicion && <th className="px-1 py-2 text-center text-xs text-gray-400">Adicion</th>}
            </tr>
          </thead>
          <tbody>
            <FilaOjo ojo="Ojo Derecho" data={od} setData={setOd} conAdicion={conAdicion} />
            <FilaOjo ojo="Ojo Izquierdo" data={oi} setData={setOi} conAdicion={conAdicion} />
          </tbody>
        </table>
      </div>
    </div>
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
            <h2 className="text-lg font-semibold">Nueva Consulta</h2>
            <p className="text-sm text-gray-400">Ficha de prescripcion optica</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={dictar}
              className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (grabando ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600')}
            >
              {grabando ? '🔴 Grabando...' : '🎤 Dictar comentarios'}
            </button>
            <button onClick={guardar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Guardar consulta
            </button>
          </div>
        </div>

        <div className="p-8">

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-4">Informacion general</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Doctor / Optometra</label>
                <input
                  type="text"
                  placeholder="Nombre del doctor"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fecha de prescripcion</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tipo de prescripcion</label>
                <select
                  value={tipoPrescripcion}
                  onChange={(e) => setTipoPrescripcion(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="monofocal">Monofocal</option>
                  <option value="bifocal">Bifocal</option>
                  <option value="progresivo">Progresivo</option>
                  <option value="ocupacional">Ocupacional</option>
                  <option value="solar">Solar</option>
                </select>
              </div>
            </div>
          </div>

          <TablaVision
            titulo="Vision de Lejos"
            od={lejosOD} setOd={setLejosOD}
            oi={lejosOI} setOi={setLejosOI}
            conAdicion={true}
          />

          <TablaVision
            titulo="Vision de Cerca"
            od={cercaOD} setOd={setCercaOD}
            oi={cercaOI} setOi={setCercaOI}
            conAdicion={false}
          />

          <TablaVision
            titulo="Vision Intermedia"
            od={interOD} setOd={setInterOD}
            oi={interOI} setOi={setInterOI}
            conAdicion={false}
          />

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium">Comentarios</label>
              <button
                onClick={dictar}
                className={'flex items-center gap-2 px-3 py-1 rounded-lg text-xs transition-all ' + (grabando ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600')}
              >
                {grabando ? '🔴 Grabando...' : '🎤 Dictar'}
              </button>
            </div>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Observaciones, recomendaciones, notas del doctor..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-28"
            />
          </div>

        </div>
      </div>
    </div>
  )
}
