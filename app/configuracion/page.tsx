'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase, getEmpresaId } from '../../lib/supabase'

export default function Configuracion() {
  const [tab, setTab] = useState('empresa')
  const [doctores, setDoctores] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mostrarNuevoDoctor, setMostrarNuevoDoctor] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState(null)
  const [empresa, setEmpresa] = useState({ nombre: '', email: '', ruc: '', telefono: '', direccion: '', ciudad: '' })
  const [sedes, setSedes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [guardandoEmpresa, setGuardandoEmpresa] = useState(false)
  const [nuevoDoctor, setNuevoDoctor] = useState({ nombres: '', apellidos: '', especialidad: '', telefono: '', email: '', activo: true })
  const [mostrarNuevaSede, setMostrarNuevaSede] = useState(false)
  const [nuevaSede, setNuevaSede] = useState({ nombre: '', ciudad: '', direccion: '', telefono: '', email: '' })

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    const eid = await getEmpresaId()
    setEmpresaId(eid)
    cargarEmpresa(eid)
    cargarSedes(eid)
    cargarUsuarios(eid)
  }

  useEffect(() => {
    if (tab === 'doctores' && empresaId) cargarDoctores(empresaId)
  }, [tab, empresaId])

  const cargarEmpresa = async (eid) => {
    if (!eid) return
    const { data } = await supabase.from('empresas').select('*').eq('id', eid).single()
    if (data) setEmpresa({ nombre: data.nombre || '', email: data.email || '', ruc: data.ruc || '', telefono: data.telefono || '', direccion: data.direccion || '', ciudad: data.ciudad || '' })
  }

  const cargarSedes = async (eid) => {
    if (!eid) return
    const { data } = await supabase.from('sedes').select('*').eq('empresa_id', eid).order('nombre')
    setSedes(data || [])
  }

  const cargarUsuarios = async (eid) => {
    if (!eid) return
    const { data } = await supabase.from('usuarios_empresas').select('*, auth.users(email)').eq('empresa_id', eid)
    setUsuarios(data || [])
  }

  const cargarDoctores = async (eid) => {
    setCargando(true)
    const query = supabase.from('doctores').select('*').order('nombres')
    if (eid) query.eq('empresa_id', eid)
    const { data } = await query
    setDoctores(data || [])
    setCargando(false)
  }

  const guardarEmpresa = async () => {
    if (!empresaId) return
    setGuardandoEmpresa(true)
    const { error } = await supabase.from('empresas').update(empresa).eq('id', empresaId)
    setGuardandoEmpresa(false)
    if (error) { alert('Error: ' + error.message); return }
    alert('Datos guardados correctamente')
  }

  const guardarDoctor = async () => {
    if (!nuevoDoctor.nombres || !nuevoDoctor.apellidos) { alert('Nombres y apellidos son obligatorios'); return }
    const { error } = await supabase.from('doctores').insert([{ ...nuevoDoctor, empresa_id: empresaId }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarNuevoDoctor(false)
    setNuevoDoctor({ nombres: '', apellidos: '', especialidad: '', telefono: '', email: '', activo: true })
    cargarDoctores(empresaId)
  }

  const guardarSede = async () => {
    if (!nuevaSede.nombre) { alert('El nombre es obligatorio'); return }
    const { error } = await supabase.from('sedes').insert([{ ...nuevaSede, empresa_id: empresaId, activo: true }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarNuevaSede(false)
    setNuevaSede({ nombre: '', ciudad: '', direccion: '', telefono: '', email: '' })
    cargarSedes(empresaId)
  }

  const toggleActivo = async (id, activo) => {
    await supabase.from('doctores').update({ activo: !activo }).eq('id', id)
    setDoctores(doctores.map(d => d.id === id ? { ...d, activo: !activo } : d))
  }

  const eliminarDoctor = async (id) => {
    if (!confirm('¿Eliminar este doctor?')) return
    await supabase.from('doctores').delete().eq('id', id)
    setDoctores(doctores.filter(d => d.id !== id))
  }

  const tabs = ['empresa', 'doctores', 'sedes', 'usuarios', 'permisos']

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
            <div>
              <h2 className="text-base md:text-lg font-semibold">Configuracion</h2>
              <p className="text-xs md:text-sm text-gray-400 hidden md:block">Empresa, sedes, doctores y usuarios</p>
            </div>
          </div>
          <div className="flex gap-2">
            {tab === 'doctores' && <button onClick={() => setMostrarNuevoDoctor(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Doctor</button>}
            {tab === 'sedes' && <button onClick={() => setMostrarNuevaSede(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm">+ Sede</button>}
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm transition-all whitespace-nowrap ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'empresa' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-6">Datos de la empresa</h3>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre de la empresa</label>
                  <input type="text" value={empresa.nombre} onChange={(e) => setEmpresa({...empresa, nombre: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">RUC</label>
                  <input type="text" value={empresa.ruc} onChange={(e) => setEmpresa({...empresa, ruc: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" value={empresa.email} onChange={(e) => setEmpresa({...empresa, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Telefono</label>
                  <input type="text" value={empresa.telefono} onChange={(e) => setEmpresa({...empresa, telefono: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" value={empresa.ciudad} onChange={(e) => setEmpresa({...empresa, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Direccion</label>
                  <input type="text" value={empresa.direccion} onChange={(e) => setEmpresa({...empresa, direccion: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button onClick={guardarEmpresa} disabled={guardandoEmpresa} className={'text-white px-4 py-2 rounded-lg text-sm ' + (guardandoEmpresa ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700')}>
                  {guardandoEmpresa ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          )}

          {tab === 'doctores' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-800">
                <h3 className="font-medium text-sm md:text-base">Doctores y optometras</h3>
                <p className="text-xs text-gray-400 mt-1">Apareceran como opciones al agendar citas</p>
              </div>
              {cargando ? (
                <div className="text-center text-gray-400 py-12">Cargando...</div>
              ) : doctores.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-4xl mb-4">👨‍⚕️</p>
                  <p className="text-sm mb-4">No hay doctores registrados</p>
                  <button onClick={() => setMostrarNuevoDoctor(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Agregar doctor</button>
                </div>
              ) : (
                <div>
                  <div className="md:hidden divide-y divide-gray-800">
                    {doctores.map((d) => (
                      <div key={d.id} className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">{d.nombres[0]}</div>
                          <div>
                            <p className="text-sm font-medium">{d.nombres} {d.apellidos}</p>
                            <p className="text-xs text-gray-400">{d.especialidad || 'Sin especialidad'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleActivo(d.id, d.activo)} className="text-blue-400 text-xs">{d.activo ? 'Desactivar' : 'Activar'}</button>
                          <button onClick={() => eliminarDoctor(d.id)} className="text-red-400 text-xs">🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <table className="w-full hidden md:table">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Doctor</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Especialidad</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Telefono</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Estado</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctores.map((d) => (
                        <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">{d.nombres[0]}</div>
                              <div>
                                <p className="text-sm font-medium">{d.nombres} {d.apellidos}</p>
                                <p className="text-xs text-gray-400">{d.email || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{d.especialidad || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{d.telefono || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={'text-xs px-2 py-1 rounded-full ' + (d.activo ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400')}>
                              {d.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex gap-3">
                            <button onClick={() => toggleActivo(d.id, d.activo)} className="text-blue-400 hover:text-blue-300 text-xs">{d.activo ? 'Desactivar' : 'Activar'}</button>
                            <button onClick={() => eliminarDoctor(d.id)} className="text-red-400 hover:text-red-300 text-xs">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'sedes' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-800">
                <h3 className="font-medium">Sedes registradas</h3>
              </div>
              {sedes.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-sm mb-4">No hay sedes registradas</p>
                  <button onClick={() => setMostrarNuevaSede(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Agregar sede</button>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {sedes.map((s) => (
                    <div key={s.id} className="p-4 md:px-6 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{s.nombre}</p>
                        <p className="text-xs text-gray-400">{s.direccion || '-'} • {s.ciudad || '-'}</p>
                        <p className="text-xs text-gray-400">{s.telefono || ''}</p>
                      </div>
                      <span className={'text-xs px-2 py-1 rounded-full ' + (s.activo ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400')}>
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'usuarios' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-800">
                <h3 className="font-medium">Usuarios del sistema</h3>
                <p className="text-xs text-gray-400 mt-1">Para agregar usuarios contacta al administrador</p>
              </div>
              {usuarios.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-sm">No hay usuarios registrados</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {usuarios.map((u) => (
                    <div key={u.id} className="p-4 md:px-6 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">A</div>
                        <div>
                          <p className="text-sm font-medium">Usuario {u.rol}</p>
                          <p className="text-xs text-gray-400">{u.rol}</p>
                        </div>
                      </div>
                      <span className={'text-xs px-2 py-1 rounded-full ' + (u.activo ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400')}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'permisos' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
              <h3 className="font-semibold mb-6">Permisos por rol</h3>
              <div className="space-y-4">
                {[
                  { rol: 'Admin', permisos: ['Dashboard', 'Clientes', 'Agenda', 'Ventas', 'Control ventas', 'Inventario', 'Finanzas', 'Reportes', 'Config'] },
                  { rol: 'Doctor', permisos: ['Dashboard', 'Clientes', 'Agenda'] },
                  { rol: 'Vendedor', permisos: ['Dashboard', 'Clientes', 'Ventas', 'Control ventas', 'Inventario'] },
                  { rol: 'Recepcion', permisos: ['Dashboard', 'Clientes', 'Agenda'] },
                ].map((r) => (
                  <div key={r.rol} className="border border-gray-800 rounded-xl p-4">
                    <p className="font-medium mb-3 text-sm">{r.rol}</p>
                    <div className="flex flex-wrap gap-2">
                      {r.permisos.map((p) => (
                        <span key={p} className="bg-blue-900 text-blue-400 text-xs px-2 py-1 rounded-full">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {mostrarNuevoDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo doctor</h3>
              <button onClick={() => setMostrarNuevoDoctor(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombres</label>
                  <input type="text" value={nuevoDoctor.nombres} onChange={(e) => setNuevoDoctor({...nuevoDoctor, nombres: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Apellidos</label>
                  <input type="text" value={nuevoDoctor.apellidos} onChange={(e) => setNuevoDoctor({...nuevoDoctor, apellidos: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Especialidad</label>
                <input type="text" value={nuevoDoctor.especialidad} onChange={(e) => setNuevoDoctor({...nuevoDoctor, especialidad: e.target.value})} placeholder="ej: Oftalmologia, Optometria..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Telefono</label>
                  <input type="text" value={nuevoDoctor.telefono} onChange={(e) => setNuevoDoctor({...nuevoDoctor, telefono: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" value={nuevoDoctor.email} onChange={(e) => setNuevoDoctor({...nuevoDoctor, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarNuevoDoctor(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarDoctor} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarNuevaSede && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva sede</h3>
              <button onClick={() => setMostrarNuevaSede(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
                <input type="text" value={nuevaSede.nombre} onChange={(e) => setNuevaSede({...nuevaSede, nombre: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" value={nuevaSede.ciudad} onChange={(e) => setNuevaSede({...nuevaSede, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Telefono</label>
                  <input type="text" value={nuevaSede.telefono} onChange={(e) => setNuevaSede({...nuevaSede, telefono: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Direccion</label>
                <input type="text" value={nuevaSede.direccion} onChange={(e) => setNuevaSede({...nuevaSede, direccion: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input type="email" value={nuevaSede.email} onChange={(e) => setNuevaSede({...nuevaSede, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarNuevaSede(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarSede} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar sede</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}