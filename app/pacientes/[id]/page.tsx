'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Sidebar from '../../../components/Sidebar'

const campoVacio = { esferico: '', cilindro: '', eje: '', av_cc: '', dip: '', altura: '' }

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  dni: string
  telefono: string
  email: string
  ciudad: string
  direccion: string
  genero: string
  encargado: string
  status: string
}

export default function PerfilPaciente({ params }: { params: { id: string } }) {
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [tab, setTab] = useState('datos')
  const [cargando, setCargando] = useState(true)
  const [compras, setCompras] = useState([])
  const [doctor, setDoctor] = useState('')
  const [fecha, setFecha] = useState('')
  const [tipoPrescripcion, setTipoPrescripcion] = useState('')
  const [razonConsulta, setRazonConsulta] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [sintomatologia, setSintomatologia] = useState('')
  const [tratamiento, setTratamiento] = useState('')
  const [historiaOcular, setHistoriaOcular] = useState('')
  const [historialFamiliar, setHistorialFamiliar] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [antecedentes, setAntecedentes] = useState<string[]>([])
  const [otroAntecedente, setOtroAntecedente] = useState('')
  const [adicionMedia, setAdicionMedia] = useState('')
  const [lejosOD, setLejosOD] = useState({...campoVacio})
  const [lejosOI, setLejosOI] = useState({...campoVacio})
  const [cercaOD, setCercaOD] = useState({...campoVacio})
  const [cercaOI, setCercaOI] = useState({...campoVacio})
  const [interOD, setInterOD] = useState({...campoVacio})
  const [interOI, setInterOI] = useState({...campoVacio})

  const antecedentesOpciones = ['Catarata', 'Glaucoma', 'Traumatismo ocular', 'Hipertension', 'Diabetes melitus', 'Otro']

  const toggleAntecedente = (opcion: string) => {
    if (antecedentes.includes(opcion)) {
      setAntecedentes(antecedentes.filter(a => a !== opcion))
    } else {
      setAntecedentes([...antecedentes, opcion])
    }
  }

  useEffect(() => {
    const id = window.location.pathname.split('/').pop()
    cargarPaciente(id)
    cargarCompras(id)
  }, [])

  const cargarPaciente = async (id) => {
    setCargando(true)
    const { data } = await supabase.from('pacientes').select('*').eq('id', id).single()
    setPaciente(data)
    setCargando(false)
  }

  const cargarCompras = async (id) => {
    const { data } = await supabase.from('ventas').select('*, ventas_detalle(*)').eq('paciente_id', id).order('created_at', { ascending: false })
    setCompras(data || [])
  }

  const cambiarEstadoVenta = async (ventaId, nuevoEstado) => {
    await supabase.from('ventas').update({ estado: nuevoEstado }).eq('id', ventaId)
    setCompras(compras.map(v => v.id === ventaId ? { ...v, estado: nuevoEstado } : v))
  }

  const escapeCSV = (val) => {
    const str = String(val === null || val === undefined ? '' : val)
    if (str.includes(';') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"'
    return str
  }

  const descargar = () => {
    if (!paciente) return
    let headers, rows, filename

    if (tab === 'datos') {
      headers = ['Campo', 'Valor']
      rows = [
        ['Nombres', paciente.nombres],
        ['Apellidos', paciente.apellidos],
        ['DNI/RUC', paciente.dni || ''],
        ['Telefono', paciente.telefono || ''],
        ['Email', paciente.email || ''],
        ['Ciudad', paciente.ciudad || ''],
        ['Direccion', paciente.direccion || ''],
        ['Encargado', paciente.encargado || ''],
        ['Status', paciente.status || ''],
      ]
      filename = 'datos-' + paciente.nombres + '.csv'
    } else if (tab === 'historia') {
      headers = ['Campo', 'Valor']
      rows = [
        ['Doctor', doctor],
        ['Fecha', fecha],
        ['Tipo prescripcion', tipoPrescripcion],
        ['Razon consulta', razonConsulta],
        ['Sintomatologia', sintomatologia],
        ['Diagnostico', diagnostico],
        ['Tratamiento', tratamiento],
        ['Historia ocular', historiaOcular],
        ['Historial familiar', historialFamiliar],
        ['Comentarios', comentarios],
        ['Antecedentes', antecedentes.join(', ')],
        ['OD Lejos - Esferico', lejosOD.esferico],
        ['OD Lejos - Cilindro', lejosOD.cilindro],
        ['OD Lejos - Eje', lejosOD.eje],
        ['OD Lejos - AV', lejosOD.av_cc],
        ['OI Lejos - Esferico', lejosOI.esferico],
        ['OI Lejos - Cilindro', lejosOI.cilindro],
        ['OI Lejos - Eje', lejosOI.eje],
        ['OI Lejos - AV', lejosOI.av_cc],
      ]
      filename = 'historia-' + paciente.nombres + '.csv'
    } else if (tab === 'compras') {
      headers = ['Fecha', 'Productos', 'Metodo pago', 'Total', 'Estado']
      rows = compras.map(v => [
        new Date(v.created_at).toLocaleDateString('es-PE'),
        v.ventas_detalle?.map(d => d.cantidad + 'x ' + (d.nombre_producto || 'Producto')).join(' | ') || '',
        v.metodo_pago || '',
        v.total || 0,
        v.estado || ''
      ])
      filename = 'compras-' + paciente.nombres + '.csv'
    } else {
      headers = ['Historial de citas']
      rows = [['Sin citas registradas']]
      filename = 'citas-' + paciente.nombres + '.csv'
    }

    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(escapeCSV).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const InputCampo = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <input type="text" placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-center" />
  )

  const FilaOjo = ({ ojo, data, setData, conAdicion }: { ojo: string, data: any, setData: any, conAdicion: boolean }) => (
    <tr className="border-b border-gray-700">
      <td className="px-3 py-2 text-xs text-gray-400 font-medium whitespace-nowrap">{ojo}</td>
      <td className="px-1 py-2"><InputCampo label="+/-" value={data.esferico} onChange={(v) => setData({...data, esferico: v})} /></td>
      <td className="px-1 py-2"><InputCampo label="+/-" value={data.cilindro} onChange={(v) => setData({...data, cilindro: v})} /></td>
      <td className="px-1 py-2"><InputCampo label="°" value={data.eje} onChange={(v) => setData({...data, eje: v})} /></td>
      <td className="px-1 py-2"><InputCampo label="20/" value={data.av_cc} onChange={(v) => setData({...data, av_cc: v})} /></td>
      <td className="px-1 py-2"><InputCampo label="mm" value={data.dip} onChange={(v) => setData({...data, dip: v})} /></td>
      <td className="px-1 py-2"><InputCampo label="mm" value={data.altura} onChange={(v) => setData({...data, altura: v})} /></td>
      {conAdicion && <td className="px-1 py-2"><InputCampo label="+/-" value={adicionMedia} onChange={setAdicionMedia} /></td>}
    </tr>
  )

  const TablaVision = ({ titulo, od, setOd, oi, setOi, conAdicion }: { titulo: string, od: any, setOd: any, oi: any, setOi: any, conAdicion: boolean }) => (
    <div className="mb-4 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-4 py-2 bg-gray-700 border-b border-gray-600">
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

  if (cargando) return (
    <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
      <p className="text-gray-400">Cargando perfil...</p>
    </div>
  )

  if (!paciente) return (
    <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
      <p className="text-gray-400">Paciente no encontrado</p>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/pacientes" className="text-gray-400 hover:text-white text-sm">← Clientes</a>
            <span className="text-gray-600">/</span>
            <h2 className="text-lg font-semibold">{paciente.nombres} {paciente.apellidos}</h2>
          </div>
          <button onClick={descargar} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
            ⬇ Descargar {tab === 'datos' ? 'datos' : tab === 'historia' ? 'historia' : tab === 'compras' ? 'compras' : 'citas'}
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-6 mb-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
              {paciente.nombres[0]}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{paciente.nombres} {paciente.apellidos}</h3>
              <div className="flex gap-6 mt-2">
                <p className="text-sm text-gray-400">DNI: <span className="text-white">{paciente.dni || '-'}</span></p>
                <p className="text-sm text-gray-400">Tel: <span className="text-white">{paciente.telefono || '-'}</span></p>
                <p className="text-sm text-gray-400">Ciudad: <span className="text-white">{paciente.ciudad || '-'}</span></p>
              </div>
            </div>
            <a href="/consulta" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Nueva consulta
            </a>
          </div>

          <div className="flex gap-3 mb-6">
            {['datos', 'historia', 'compras', 'citas'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 rounded-lg text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'datos' ? 'Datos' : t === 'historia' ? 'Historia Clinica' : t === 'compras' ? 'Compras' : 'Citas'}
              </button>
            ))}
          </div>

          {tab === 'datos' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Datos personales</h3>
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombres</label>
                  <input type="text" defaultValue={paciente.nombres} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Apellidos</label>
                  <input type="text" defaultValue={paciente.apellidos} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">DNI / RUC</label>
                  <input type="text" defaultValue={paciente.dni || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Telefono</label>
                  <input type="text" defaultValue={paciente.telefono || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" defaultValue={paciente.email || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" defaultValue={paciente.ciudad || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Direccion</label>
                  <input type="text" defaultValue={paciente.direccion || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Guardar cambios</button>
            </div>
          )}

          {tab === 'historia' && (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Informacion general</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Doctor / Optometra</label>
                    <input type="text" value={doctor} onChange={(e) => setDoctor(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Tipo de prescripcion</label>
                    <select value={tipoPrescripcion} onChange={(e) => setTipoPrescripcion(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
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

              <TablaVision titulo="Vision de Lejos" od={lejosOD} setOd={setLejosOD} oi={lejosOI} setOi={setLejosOI} conAdicion={true} />
              <TablaVision titulo="Vision de Cerca" od={cercaOD} setOd={setCercaOD} oi={cercaOI} setOi={setCercaOI} conAdicion={false} />
              <TablaVision titulo="Vision Intermedia" od={interOD} setOd={setInterOD} oi={interOI} setOi={setInterOI} conAdicion={false} />

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold">Historia clinica</h3>
                {[
                  { label: 'Razon de la consulta', value: razonConsulta, set: setRazonConsulta },
                  { label: 'Sintomatologia', value: sintomatologia, set: setSintomatologia },
                  { label: 'Diagnostico', value: diagnostico, set: setDiagnostico },
                  { label: 'Tratamiento', value: tratamiento, set: setTratamiento },
                  { label: 'Historia ocular', value: historiaOcular, set: setHistoriaOcular },
                  { label: 'Historial familiar ocular', value: historialFamiliar, set: setHistorialFamiliar },
                  { label: 'Comentarios', value: comentarios, set: setComentarios },
                ].map((campo) => (
                  <div key={campo.label}>
                    <label className="text-xs text-gray-400 mb-1 block">{campo.label}</label>
                    <textarea value={campo.value} onChange={(e) => campo.set(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20" />
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Antecedentes</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {antecedentesOpciones.map((op) => (
                    <button key={op} onClick={() => toggleAntecedente(op)} className={'px-4 py-2 rounded-lg text-sm transition-all ' + (antecedentes.includes(op) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}>
                      {op}
                    </button>
                  ))}
                </div>
                {antecedentes.includes('Otro') && (
                  <input type="text" placeholder="Describe el antecedente..." value={otroAntecedente} onChange={(e) => setOtroAntecedente(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                )}
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
                Guardar historia clinica
              </button>
            </div>
          )}

          {tab === 'compras' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold">Historial de compras</h3>
                <span className="text-sm text-gray-400">{compras.length} compras</span>
              </div>
              {compras.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-4xl mb-4">🛒</p>
                  <p>No hay compras registradas aun</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Fecha</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Productos</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Metodo pago</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Total</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compras.map((v) => (
                      <tr key={v.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-6 py-4 text-sm text-gray-300">{new Date(v.created_at).toLocaleDateString('es-PE')}</td>
                        <td className="px-6 py-4">
                          {v.ventas_detalle && v.ventas_detalle.length > 0 ? (
                            <div className="space-y-1">
                              {v.ventas_detalle.map((d, i) => (
                                <p key={i} className="text-xs text-gray-200">
                                  {d.cantidad}x <span className="text-white font-medium">{d.nombre_producto || 'Producto'}</span> — S/ {d.precio_unitario}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">{v.notas || '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 capitalize">{v.metodo_pago || '-'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-green-400">S/ {v.total}</td>
                        <td className="px-6 py-4">
                          <select
                            value={v.estado}
                            onChange={(e) => cambiarEstadoVenta(v.id, e.target.value)}
                            className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' +
                              (v.estado === 'pagado' ? 'bg-green-600' : v.estado === 'anulado' ? 'bg-red-600' : 'bg-orange-500')}
                          >
                            <option value="pagado">Pagado</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="anulado">No pago</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'citas' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Historial de citas</h3>
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-4">📅</p>
                <p>No hay citas registradas aun</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}