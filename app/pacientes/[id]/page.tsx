'use client'
import { useState, useEffect } from 'react'
import { supabase, getEmpresaId, getSedeId } from '../../../lib/supabase'
import Sidebar from '../../../components/Sidebar'

const campoVacio = { esferico: '', cilindro: '', eje: '', av_cc: '', dip: '', altura: '' }

const statusCuotaColors: Record<string, string> = {
  verde: 'bg-green-600',
  naranja: 'bg-orange-500',
  rojo: 'bg-red-600',
}

export default function PerfilPaciente({ params }: { params: { id: string } }) {
  const [paciente, setPaciente] = useState<any>(null)
  const [tab, setTab] = useState('datos')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [compras, setCompras] = useState<any[]>([])
  const [citas, setCitas] = useState<any[]>([])
  const [cuotasPaciente, setCuotasPaciente] = useState<any[]>([])
  const [doctores, setDoctores] = useState<any[]>([])
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState<string|null>(null)
  const [sedeId, setSedeId] = useState<string|null>(null)
  const [historiaId, setHistoriaId] = useState<string|null>(null)
  const [mostrarAgregarCompra, setMostrarAgregarCompra] = useState(false)
  const [guardandoCompra, setGuardandoCompra] = useState(false)
  const [nuevaCompra, setNuevaCompra] = useState({ concepto: '', monto: 0, metodo: 'efectivo' })
  const [doctor, setDoctor] = useState('')
  const [doctorTextoLibre, setDoctorTextoLibre] = useState(false)
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
  const [datosPaciente, setDatosPaciente] = useState({ nombres: '', apellidos: '', dni: '', telefono: '', email: '', ciudad: '', direccion: '' })

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
    iniciar(id)
  }, [])

  const iniciar = async (id: string | undefined) => {
    if (!id) return
    const eid = await getEmpresaId()
    const sid = await getSedeId()
    setEmpresaId(eid)
    setSedeId(sid)
    cargarPaciente(id)
    cargarCompras(id)
    cargarCitas(id)
    cargarHistoria(id)
    cargarDoctores(eid)
    cargarCuotasPaciente(id, eid)
  }

  const cargarDoctores = async (eid: string|null) => {
    const query = supabase.from('doctores').select('*').eq('activo', true).order('nombres')
    if (eid) query.eq('empresa_id', eid)
    const { data } = await query
    setDoctores(data || [])
  }

  const cargarPaciente = async (id: string) => {
    setCargando(true)
    const { data } = await supabase.from('pacientes').select('*').eq('id', id).single()
    setPaciente(data)
    if (data) setDatosPaciente({ nombres: data.nombres || '', apellidos: data.apellidos || '', dni: data.dni || '', telefono: data.telefono || '', email: data.email || '', ciudad: data.ciudad || '', direccion: data.direccion || '' })
    setCargando(false)
  }

  const cargarHistoria = async (id: string) => {
    const { data } = await supabase.from('historias_clinicas').select('*').eq('paciente_id', id).order('created_at', { ascending: false }).limit(1).single()
    if (data) {
      setHistoriaId(data.id)
      setDoctor(data.doctor || '')
      setFecha(data.fecha || '')
      setTipoPrescripcion(data.tipo_prescripcion || '')
      setRazonConsulta(data.razon_consulta || '')
      setSintomatologia(data.sintomatologia || '')
      setDiagnostico(data.diagnostico || '')
      setTratamiento(data.tratamiento || '')
      setHistoriaOcular(data.historia_ocular || '')
      setHistorialFamiliar(data.historial_familiar || '')
      setComentarios(data.comentarios || '')
      setAntecedentes(data.antecedentes || [])
      setOtroAntecedente(data.otro_antecedente || '')
      setAdicionMedia(data.adicion_media || '')
      setLejosOD(data.lejos_od || {...campoVacio})
      setLejosOI(data.lejos_oi || {...campoVacio})
      setCercaOD(data.cerca_od || {...campoVacio})
      setCercaOI(data.cerca_oi || {...campoVacio})
      setInterOD(data.inter_od || {...campoVacio})
      setInterOI(data.inter_oi || {...campoVacio})
    }
  }

  const cargarCompras = async (id: string) => {
    const { data } = await supabase.from('ventas').select('*, ventas_detalle(*)').eq('paciente_id', id).order('created_at', { ascending: false })
    setCompras(data || [])
  }

  const cargarCitas = async (id: string) => {
    const { data } = await supabase.from('citas').select('*').eq('paciente_id', id).order('fecha', { ascending: false })
    setCitas(data || [])
  }

  const cargarCuotasPaciente = async (id: string, eid: string|null) => {
    const query = supabase.from('cuotas_pago').select('*').order('created_at', { ascending: false })
    if (eid) query.eq('empresa_id', eid)
    const { data: pacienteData } = await supabase.from('pacientes').select('nombres, apellidos').eq('id', id).single()
    if (pacienteData) {
      const nombreCompleto = pacienteData.nombres + ' ' + pacienteData.apellidos
      query.ilike('cliente_nombre', '%' + pacienteData.nombres + '%')
    }
    const { data } = await query
    setCuotasPaciente(data || [])
  }

  const guardarDatosPaciente = async () => {
    const id = window.location.pathname.split('/').pop()
    const { error } = await supabase.from('pacientes').update(datosPaciente).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    alert('Datos guardados correctamente')
    setPaciente({ ...paciente, ...datosPaciente })
  }

  const guardarHistoria = async () => {
    const id = window.location.pathname.split('/').pop()
    setGuardando(true)
    const payload = {
      paciente_id: id, empresa_id: empresaId,
      doctor, fecha, tipo_prescripcion: tipoPrescripcion,
      razon_consulta: razonConsulta, sintomatologia, diagnostico,
      tratamiento, historia_ocular: historiaOcular,
      historial_familiar: historialFamiliar, comentarios,
      antecedentes, otro_antecedente: otroAntecedente,
      adicion_media: adicionMedia,
      lejos_od: lejosOD, lejos_oi: lejosOI,
      cerca_od: cercaOD, cerca_oi: cercaOI,
      inter_od: interOD, inter_oi: interOI,
      updated_at: new Date().toISOString(),
    }
    let error: any
    if (historiaId) {
      const { error: e } = await supabase.from('historias_clinicas').update(payload).eq('id', historiaId)
      error = e
    } else {
      const { data, error: e } = await supabase.from('historias_clinicas').insert([payload]).select().single()
      if (data) setHistoriaId(data.id)
      error = e
    }
    setGuardando(false)
    if (error) { alert('Error: ' + error.message); return }
    alert('Historia clinica guardada correctamente')
  }

  const guardarCompra = async () => {
    if (!nuevaCompra.concepto) { alert('Ingresa el concepto'); return }
    if (!nuevaCompra.monto) { alert('Ingresa el monto'); return }
    setGuardandoCompra(true)
    const id = window.location.pathname.split('/').pop()
    const nombreCliente = paciente.nombres + ' ' + paciente.apellidos

    const { data: ventaData, error } = await supabase.from('ventas').insert([{
      empresa_id: empresaId, sede_id: sedeId,
      paciente_id: id,
      subtotal: nuevaCompra.monto, total: nuevaCompra.monto,
      metodo_pago: nuevaCompra.metodo,
      estado: 'pagado', notas: nuevaCompra.concepto,
      cliente_nombre: nombreCliente,
    }]).select().single()

    if (error) { alert('Error: ' + error.message); setGuardandoCompra(false); return }

    await supabase.from('ventas_detalle').insert([{
      venta_id: ventaData.id, cantidad: 1,
      precio_unitario: nuevaCompra.monto,
      subtotal: nuevaCompra.monto,
      nombre_producto: nuevaCompra.concepto,
    }])

    await supabase.from('caja').insert([{
      sede_id: sedeId, tipo: 'ingreso',
      concepto: nuevaCompra.concepto,
      monto: nuevaCompra.monto,
      metodo_pago: nuevaCompra.metodo,
      cliente_nombre: nombreCliente,
      fecha: new Date().toISOString(),
    }])

    setGuardandoCompra(false)
    setMostrarAgregarCompra(false)
    setNuevaCompra({ concepto: '', monto: 0, metodo: 'efectivo' })
    cargarCompras(id!)
    alert('Compra registrada correctamente')
  }

  const cambiarEstadoVenta = async (ventaId: string, nuevoEstado: string) => {
    await supabase.from('ventas').update({ estado: nuevoEstado }).eq('id', ventaId)
    setCompras(compras.map(v => v.id === ventaId ? { ...v, estado: nuevoEstado } : v))
  }

  const editarCuotaInline = async (id: string, campo: string, valor: any) => {
    setCuotasPaciente(cuotasPaciente.map(c => c.id === id ? { ...c, [campo]: valor } : c))
    await supabase.from('cuotas_pago').update({ [campo]: valor }).eq('id', id)
  }

  const escapeCSV = (val: any) => {
    const str = String(val === null || val === undefined ? '' : val)
    if (str.includes(';') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"'
    return str
  }

  const descargar = () => {
    if (!paciente) return
    let headers: string[], rows: any[][], filename: string
    if (tab === 'datos') {
      headers = ['Campo', 'Valor']
      rows = Object.entries(datosPaciente).map(([k, v]) => [k, v])
      filename = 'datos-' + paciente.nombres + '.csv'
    } else if (tab === 'compras') {
      headers = ['Fecha', 'Productos', 'Metodo', 'Total', 'Estado']
      rows = compras.map(v => [new Date(v.created_at).toLocaleDateString('es-PE'), v.ventas_detalle?.map((d: any) => d.nombre_producto).join(', ') || '', v.metodo_pago || '', v.total || 0, v.estado || ''])
      filename = 'compras-' + paciente.nombres + '.csv'
    } else if (tab === 'citas') {
      headers = ['Fecha', 'Hora', 'Doctor', 'Especialidad', 'Estado']
      rows = citas.map(c => [c.fecha || '', c.hora?.slice(0,5) || '', c.doctor || '', c.especialidad || '', c.estado || ''])
      filename = 'citas-' + paciente.nombres + '.csv'
    } else {
      headers = ['Cliente', 'Ciudad', 'Cuota', 'Monto', 'Estado', 'Monto pagado', 'Fecha pagado', 'Sucursal']
      rows = cuotasPaciente.map(c => [c.cliente_nombre || '', c.ciudad || '', '#' + c.numero_cuota, c.monto || 0, c.color_estado || '', c.monto_pagado || 0, c.fecha_pagado || '', c.sucursal || ''])
      filename = 'cuotas-' + paciente.nombres + '.csv'
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
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white">☰</button>
            <a href="/pacientes" className="text-gray-400 hover:text-white text-sm">← Clientes</a>
            <span className="text-gray-600">/</span>
            <h2 className="text-sm md:text-lg font-semibold truncate">{paciente.nombres} {paciente.apellidos}</h2>
          </div>
          <button onClick={descargar} className="bg-gray-700 hover:bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">⬇ Descargar</button>
        </div>

        <div className="p-4 md:p-8">
          <div className="flex items-center gap-4 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl md:text-3xl font-bold flex-shrink-0">
              {paciente.nombres[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-2xl font-bold truncate">{paciente.nombres} {paciente.apellidos}</h3>
              <div className="flex flex-wrap gap-3 mt-2">
                <p className="text-xs md:text-sm text-gray-400">DNI: <span className="text-white">{paciente.dni || '-'}</span></p>
                <p className="text-xs md:text-sm text-gray-400">Tel: <span className="text-white">{paciente.telefono || '-'}</span></p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {['datos', 'historia', 'compras', 'citas', 'cuotas'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm transition-all whitespace-nowrap ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'datos' ? 'Datos' : t === 'historia' ? 'Historia' : t === 'compras' ? 'Compras' : t === 'citas' ? 'Citas' : 'Cuotas por cobrar'}
              </button>
            ))}
          </div>

          {tab === 'datos' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Datos personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {[
                  { label: 'Nombres', key: 'nombres' },
                  { label: 'Apellidos', key: 'apellidos' },
                  { label: 'DNI / RUC', key: 'dni' },
                  { label: 'Telefono', key: 'telefono' },
                  { label: 'Email', key: 'email' },
                  { label: 'Ciudad', key: 'ciudad' },
                ].map((campo) => (
                  <div key={campo.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{campo.label}</label>
                    <input type="text" value={datosPaciente[campo.key as keyof typeof datosPaciente]} onChange={(e) => setDatosPaciente({...datosPaciente, [campo.key]: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                ))}
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Direccion</label>
                  <input type="text" value={datosPaciente.direccion} onChange={(e) => setDatosPaciente({...datosPaciente, direccion: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={guardarDatosPaciente} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Guardar cambios</button>
            </div>
          )}

          {tab === 'historia' && (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Informacion general</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-400">Doctor / Optometra</label>
                      <button onClick={() => setDoctorTextoLibre(!doctorTextoLibre)} className="text-xs text-blue-400 hover:text-blue-300">
                        {doctorTextoLibre ? 'Elegir de lista' : 'Texto libre'}
                      </button>
                    </div>
                    {doctorTextoLibre || doctores.length === 0 ? (
                      <input type="text" value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Nombre del doctor..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                    ) : (
                      <select value={doctor} onChange={(e) => setDoctor(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                        <option value="">Seleccionar doctor...</option>
                        {doctores.map(d => (
                          <option key={d.id} value={d.nombres + ' ' + d.apellidos}>{d.nombres} {d.apellidos}</option>
                        ))}
                      </select>
                    )}
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
                    <textarea value={campo.value} onChange={(e) => campo.set(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20 resize-y" />
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

              <button onClick={guardarHistoria} disabled={guardando} className={'w-full py-3 rounded-lg font-medium text-white ' + (guardando ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700')}>
                {guardando ? 'Guardando...' : historiaId ? 'Actualizar historia clinica' : 'Guardar historia clinica'}
              </button>
            </div>
          )}

          {tab === 'compras' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold">Historial de compras</h3>
                <div className="flex gap-2">
                  <button onClick={() => setMostrarAgregarCompra(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs">+ Agregar compra</button>
                  <span className="text-sm text-gray-400 self-center">{compras.length} compras</span>
                </div>
              </div>
              {compras.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-4xl mb-4">🛒</p>
                  <p>No hay compras registradas</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Fecha</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Productos</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Metodo</th>
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
                              {v.ventas_detalle.map((d: any, i: number) => (
                                <p key={i} className="text-xs text-gray-200">{d.cantidad}x <span className="text-white font-medium">{d.nombre_producto || 'Producto'}</span></p>
                              ))}
                            </div>
                          ) : <span className="text-gray-500 text-xs">{v.notas || '-'}</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 capitalize hidden md:table-cell">{v.metodo_pago || '-'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-green-400">S/ {v.total}</td>
                        <td className="px-6 py-4">
                          <select value={v.estado} onChange={(e) => cambiarEstadoVenta(v.id, e.target.value)} className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' + (v.estado === 'pagado' ? 'bg-green-600' : v.estado === 'anulado' ? 'bg-red-600' : 'bg-orange-500')}>
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
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold">Historial de citas</h3>
                <span className="text-sm text-gray-400">{citas.length} citas</span>
              </div>
              {citas.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-4xl mb-4">📅</p>
                  <p>No hay citas registradas</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Fecha</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Hora</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Doctor</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase hidden md:table-cell">Especialidad</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.map((c) => (
                      <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-6 py-4 text-sm text-gray-300">{c.fecha}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{c.hora?.slice(0,5)}</td>
                        <td className="px-6 py-4 text-sm font-medium">{c.doctor || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-300 hidden md:table-cell">{c.especialidad || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={'text-xs px-2 py-1 rounded-full ' + (c.estado === 'confirmada' ? 'bg-green-900 text-green-400' : c.estado === 'en_atencion' ? 'bg-orange-900 text-orange-400' : c.estado === 'no_vino' ? 'bg-red-900 text-red-400' : 'bg-blue-900 text-blue-400')}>{c.estado}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'cuotas' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold">Cuotas por cobrar</h3>
                <span className="text-sm text-gray-400">{cuotasPaciente.length} cuotas</span>
              </div>
              {cuotasPaciente.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-4xl mb-4">💰</p>
                  <p className="text-sm">No hay cuotas registradas para este cliente</p>
                  <a href="/finanzas" className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Ir a Finanzas para agregar</a>
                </div>
              ) : (
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Ciudad</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Cuota</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Monto</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Estado</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Monto pagado</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Fecha pagado</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase">Sucursal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuotasPaciente.map((c) => (
                      <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">{c.cliente_nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{c.ciudad || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">#{c.numero_cuota}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-400">S/ {c.monto}</td>
                        <td className="px-4 py-3">
                          <select value={c.color_estado || 'verde'} onChange={(e) => editarCuotaInline(c.id, 'color_estado', e.target.value)} className={'text-xs px-2 py-1 rounded-full border-0 cursor-pointer text-white ' + statusCuotaColors[c.color_estado || 'verde']}>
                            <option value="verde">Verde</option>
                            <option value="naranja">Naranja</option>
                            <option value="rojo">Rojo</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={c.monto_pagado || 0} onChange={(e) => editarCuotaInline(c.id, 'monto_pagado', Number(e.target.value))} className="bg-transparent text-green-400 text-sm w-20 focus:outline-none border-b border-gray-700 focus:border-blue-500" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="date" value={c.fecha_pagado || ''} onChange={(e) => editarCuotaInline(c.id, 'fecha_pagado', e.target.value)} className="bg-transparent text-white text-xs focus:outline-none border-b border-gray-700 focus:border-blue-500" />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{c.sucursal || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {mostrarAgregarCompra && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Agregar compra rapida</h3>
              <button onClick={() => setMostrarAgregarCompra(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Concepto / Producto</label>
                <input type="text" value={nuevaCompra.concepto} onChange={(e) => setNuevaCompra({...nuevaCompra, concepto: e.target.value})} placeholder="ej: Consulta, Luna antireflex..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Monto S/</label>
                  <input type="number" value={nuevaCompra.monto} onChange={(e) => setNuevaCompra({...nuevaCompra, monto: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Metodo de pago</label>
                  <select value={nuevaCompra.metodo} onChange={(e) => setNuevaCompra({...nuevaCompra, metodo: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="efectivo">Efectivo</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarAgregarCompra(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarCompra} disabled={guardandoCompra} className={'flex-1 text-white py-2 rounded-lg text-sm font-medium ' + (guardandoCompra ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700')}>
                {guardandoCompra ? 'Guardando...' : 'Guardar compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}