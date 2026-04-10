'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase, getEmpresaId, getRol } from '../../lib/supabase'

const rolesDisponibles = ['admin', 'doctor', 'vendedor', 'recepcion']

const permisosModulos = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'pacientes', label: 'Clientes' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'ventas', label: 'Ventas diarias' },
  { key: 'control_ventas', label: 'Control ventas' },
  { key: 'inventario', label: 'Inventario' },
  { key: 'finanzas', label: 'Finanzas' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'contabilidad', label: 'Contabilidad' },
  { key: 'envios', label: 'Envíos' },
  { key: 'tributario', label: 'Tributario' },
  { key: 'configuracion', label: 'Configuracion' },
]

const permisosDefault: Record<string, string[]> = {
  admin: ['dashboard','pacientes','agenda','ventas','control_ventas','inventario','finanzas','reportes','contabilidad','envios','tributario','configuracion'],
  doctor: ['dashboard','pacientes','agenda'],
  vendedor: ['dashboard','pacientes','ventas','control_ventas','inventario'],
  recepcion: ['dashboard','pacientes','agenda'],
}

export default function Configuracion() {
  const [tab, setTab] = useState('empresa')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [empresaId, setEmpresaId] = useState<string|null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  // Empresa
  const [empresa, setEmpresa] = useState<any>(null)

  // Sedes
  const [sedes, setSedes] = useState<any[]>([])
  const [mostrarNuevaSede, setMostrarNuevaSede] = useState(false)
  const [nuevaSede, setNuevaSede] = useState({ nombre: '', ciudad: '', telefono: '', direccion: '', email: '' })

  // Doctores
  const [doctores, setDoctores] = useState<any[]>([])
  const [mostrarNuevoDoctor, setMostrarNuevoDoctor] = useState(false)
  const [nuevoDoctor, setNuevoDoctor] = useState({ nombres: '', apellidos: '', especialidad: '', telefono: '', email: '' })

  // Usuarios
  const [usuarios, setUsuarios] = useState<any[]>([])

  // Permisos
  const [permisosPorRol, setPermisosPorRol] = useState<Record<string, string[]>>(permisosDefault)
  const [rolEditando, setRolEditando] = useState('vendedor')

  useEffect(() => { iniciar() }, [])

  const iniciar = async () => {
    setCargando(true)
    const eid = await getEmpresaId()
    setEmpresaId(eid)
    if (!eid) { setCargando(false); return }

    const { data: emp } = await supabase.from('empresas').select('*').eq('id', eid).single()
    setEmpresa(emp)

    const { data: sedesData } = await supabase.from('sedes').select('*').eq('empresa_id', eid).order('nombre')
    setSedes(sedesData || [])

    const { data: doctoresData } = await supabase.from('doctores').select('*').eq('empresa_id', eid).order('nombres')
    setDoctores(doctoresData || [])

    const { data: usuariosData } = await supabase
      .from('usuarios_empresas')
      .select('*, auth_user:user_id(email)')
      .eq('empresa_id', eid)
    setUsuarios(usuariosData || [])

    if (emp?.permisos) setPermisosPorRol({ ...permisosDefault, ...emp.permisos })

    setCargando(false)
  }

  const guardarEmpresa = async () => {
    if (!empresa || !empresaId) return
    setGuardando(true)
    await supabase.from('empresas').update({
      nombre: empresa.nombre,
      ruc: empresa.ruc,
      email: empresa.email,
      telefono: empresa.telefono,
      direccion: empresa.direccion,
      ciudad: empresa.ciudad,
    }).eq('id', empresaId)
    setGuardando(false)
    alert('Datos guardados correctamente')
  }

  const guardarDoctor = async () => {
    if (!nuevoDoctor.nombres || !nuevoDoctor.apellidos) { alert('Nombres y apellidos son obligatorios'); return }
    const { error } = await supabase.from('doctores').insert([{ ...nuevoDoctor, empresa_id: empresaId, activo: true }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarNuevoDoctor(false)
    setNuevoDoctor({ nombres: '', apellidos: '', especialidad: '', telefono: '', email: '' })
    iniciar()
  }

  const eliminarDoctor = async (id: string) => {
    if (!confirm('¿Eliminar este doctor?')) return
    await supabase.from('doctores').delete().eq('id', id)
    setDoctores(doctores.filter(d => d.id !== id))
  }

  const toggleActivoDoctor = async (id: string, activo: boolean) => {
    await supabase.from('doctores').update({ activo: !activo }).eq('id', id)
    setDoctores(doctores.map(d => d.id === id ? { ...d, activo: !activo } : d))
  }

  const guardarSede = async () => {
    if (!nuevaSede.nombre) { alert('El nombre es obligatorio'); return }
    const { error } = await supabase.from('sedes').insert([{ ...nuevaSede, empresa_id: empresaId, activo: true }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarNuevaSede(false)
    setNuevaSede({ nombre: '', ciudad: '', telefono: '', direccion: '', email: '' })
    iniciar()
  }

  const cambiarRolUsuario = async (userId: string, nuevoRol: string) => {
    await supabase.from('usuarios_empresas').update({ rol: nuevoRol }).eq('user_id', userId).eq('empresa_id', empresaId)
    setUsuarios(usuarios.map(u => u.user_id === userId ? { ...u, rol: nuevoRol } : u))
  }

  const togglePermiso = (rol: string, modulo: string) => {
    const actual = permisosPorRol[rol] || []
    const nuevo = actual.includes(modulo) ? actual.filter(m => m !== modulo) : [...actual, modulo]
    setPermisosPorRol({ ...permisosPorRol, [rol]: nuevo })
  }

  const guardarPermisos = async () => {
    setGuardando(true)
    await supabase.from('empresas').update({ permisos: permisosPorRol }).eq('id', empresaId)
    setGuardando(false)
    alert('Permisos guardados correctamente')
  }

  const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500'

  if (cargando) return (
    <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
      <p className="text-gray-400">Cargando configuración...</p>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
            <div>
              <h2 className="text-lg font-semibold">Configuración</h2>
              <p className="text-sm text-gray-400">Empresa, sedes, doctores, usuarios y permisos</p>
            </div>
          </div>
          <div>
            {tab === 'doctores' && <button onClick={() => setMostrarNuevoDoctor(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Doctor</button>}
            {tab === 'sedes' && <button onClick={() => setMostrarNuevaSede(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Sede</button>}
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 flex-wrap">
            {['empresa','sedes','doctores','usuarios','permisos'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 rounded-lg text-sm transition-all capitalize whitespace-nowrap ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'empresa' ? '🏢 Empresa' : t === 'sedes' ? '📍 Sedes' : t === 'doctores' ? '👨‍⚕️ Doctores' : t === 'usuarios' ? '👥 Usuarios' : '🔐 Permisos'}
              </button>
            ))}
          </div>

          {/* ── EMPRESA ── */}
          {tab === 'empresa' && empresa && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
              <h3 className="font-semibold mb-6">Datos de la empresa</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Nombre de la empresa</label>
                    <input type="text" value={empresa.nombre || ''} onChange={e => setEmpresa({...empresa, nombre: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">RUC</label>
                    <input type="text" value={empresa.ruc || ''} onChange={e => setEmpresa({...empresa, ruc: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Email</label>
                    <input type="email" value={empresa.email || ''} onChange={e => setEmpresa({...empresa, email: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
                    <input type="text" value={empresa.telefono || ''} onChange={e => setEmpresa({...empresa, telefono: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                    <input type="text" value={empresa.ciudad || ''} onChange={e => setEmpresa({...empresa, ciudad: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Dirección</label>
                    <input type="text" value={empresa.direccion || ''} onChange={e => setEmpresa({...empresa, direccion: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <button onClick={guardarEmpresa} disabled={guardando} className={'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm ' + (guardando ? 'opacity-50' : '')}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          )}

          {/* ── SEDES ── */}
          {tab === 'sedes' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-medium">Sedes registradas</h3>
                <p className="text-xs text-gray-400 mt-1">{sedes.length} sede(s)</p>
              </div>
              {sedes.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-4xl mb-4">📍</p>
                  <p className="text-sm">No hay sedes registradas</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {sedes.map(s => (
                    <div key={s.id} className="p-4 md:px-6 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{s.nombre}</p>
                        <p className="text-xs text-gray-400">{s.direccion || '-'} • {s.ciudad || '-'} • {s.telefono || '-'}</p>
                      </div>
                      <span className={'text-xs px-2 py-1 rounded-full ' + (s.activo ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400')}>
                        {s.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DOCTORES ── */}
          {tab === 'doctores' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-medium">Doctores y optómetras</h3>
                <p className="text-xs text-gray-400 mt-1">Aparecen como opciones al agendar citas</p>
              </div>
              {doctores.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-4xl mb-4">👨‍⚕️</p>
                  <p className="text-sm mb-4">No hay doctores registrados</p>
                  <button onClick={() => setMostrarNuevoDoctor(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Agregar doctor</button>
                </div>
              ) : (
                <div>
                  <div className="md:hidden divide-y divide-gray-800">
                    {doctores.map(d => (
                      <div key={d.id} className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">{d.nombres?.[0]}</div>
                          <div>
                            <p className="text-sm font-medium">{d.nombres} {d.apellidos}</p>
                            <p className="text-xs text-gray-400">{d.especialidad || 'Sin especialidad'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={'text-xs px-2 py-1 rounded-full ' + (d.activo ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400')}>{d.activo ? 'Activo' : 'Inactivo'}</span>
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
                        <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Teléfono</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Email</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Estado</th>
                        <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctores.map(d => (
                        <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">{d.nombres?.[0]}</div>
                              <div>
                                <p className="text-sm font-medium">{d.nombres} {d.apellidos}</p>
                                <p className="text-xs text-gray-400">{d.email || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{d.especialidad || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{d.telefono || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{d.email || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={'text-xs px-2 py-1 rounded-full ' + (d.activo ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400')}>
                              {d.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex gap-3">
                            <button onClick={() => toggleActivoDoctor(d.id, d.activo)} className="text-blue-400 hover:text-blue-300 text-xs">
                              {d.activo ? 'Desactivar' : 'Activar'}
                            </button>
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

          {/* ── USUARIOS ── */}
          {tab === 'usuarios' && (
            <div className="space-y-4">
              <div className="bg-yellow-900 border border-yellow-700 rounded-xl p-4">
                <p className="text-yellow-400 text-sm font-medium mb-1">📋 Para agregar nuevos usuarios</p>
                <p className="text-yellow-300 text-xs">Ve a <strong>oftalmanager.com/admin</strong> → click en "+ Usuario" en tu empresa → copia el SQL → ejecútalo en Supabase SQL Editor.</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="font-medium">Usuarios del sistema</h3>
                  <p className="text-xs text-gray-400 mt-1">{usuarios.length} usuario(s)</p>
                </div>
                {usuarios.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">No hay usuarios</div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {usuarios.map(u => (
                      <div key={u.user_id} className="p-4 md:px-6 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                            {u.rol === 'admin' ? '👑' : u.rol === 'doctor' ? '👨‍⚕️' : u.rol === 'vendedor' ? '💼' : '📋'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.auth_user?.email || u.user_id}</p>
                            <p className="text-xs text-gray-400 capitalize">{u.rol}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={u.rol}
                            onChange={e => cambiarRolUsuario(u.user_id, e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          >
                            {rolesDisponibles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <span className={'text-xs px-2 py-1 rounded-full ' + (u.activo ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400')}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PERMISOS ── */}
          {tab === 'permisos' && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-300 mb-3">Selecciona el rol para editar sus permisos:</p>
                <div className="flex gap-2 flex-wrap">
                  {rolesDisponibles.map(r => (
                    <button key={r} onClick={() => setRolEditando(r)} className={'px-4 py-2 rounded-lg text-sm capitalize ' + (rolEditando === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}>
                      {r === 'admin' ? '👑' : r === 'doctor' ? '👨‍⚕️' : r === 'vendedor' ? '💼' : '📋'} {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-1 capitalize">Permisos — {rolEditando}</h3>
                <p className="text-xs text-gray-400 mb-4">Marca los módulos a los que este rol puede acceder</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {permisosModulos.map(mod => {
                    const activo = (permisosPorRol[rolEditando] || []).includes(mod.key)
                    const esAdmin = rolEditando === 'admin'
                    return (
                      <button
                        key={mod.key}
                        onClick={() => !esAdmin && togglePermiso(rolEditando, mod.key)}
                        className={'flex items-center gap-3 p-3 rounded-lg border transition-all ' + (activo ? 'border-blue-500 bg-blue-900' : 'border-gray-700 bg-gray-800') + (esAdmin ? ' opacity-70 cursor-not-allowed' : ' cursor-pointer hover:border-blue-400')}
                      >
                        <div className={'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ' + (activo ? 'bg-blue-500' : 'bg-gray-600')}>
                          {activo && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="text-sm">{mod.label}</span>
                        {esAdmin && <span className="text-xs text-gray-500 ml-auto">siempre</span>}
                      </button>
                    )
                  })}
                </div>
                {rolEditando !== 'admin' && (
                  <button onClick={guardarPermisos} disabled={guardando} className={'mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm ' + (guardando ? 'opacity-50' : '')}>
                    {guardando ? 'Guardando...' : 'Guardar permisos'}
                  </button>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="font-semibold mb-3 text-sm">Resumen de permisos por rol</h3>
                <div className="space-y-3">
                  {rolesDisponibles.map(r => (
                    <div key={r} className="flex items-start gap-3">
                      <span className="text-sm capitalize w-24 flex-shrink-0 pt-1">{r === 'admin' ? '👑' : r === 'doctor' ? '👨‍⚕️' : r === 'vendedor' ? '💼' : '📋'} {r}</span>
                      <div className="flex flex-wrap gap-1">
                        {(permisosPorRol[r] || []).map(p => (
                          <span key={p} className="bg-blue-900 text-blue-400 text-xs px-2 py-1 rounded-full">{p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal nuevo doctor */}
      {mostrarNuevoDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo doctor</h3>
              <button onClick={() => setMostrarNuevoDoctor(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombres</label>
                  <input type="text" value={nuevoDoctor.nombres} onChange={e => setNuevoDoctor({...nuevoDoctor, nombres: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Apellidos</label>
                  <input type="text" value={nuevoDoctor.apellidos} onChange={e => setNuevoDoctor({...nuevoDoctor, apellidos: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Especialidad</label>
                <input type="text" value={nuevoDoctor.especialidad} onChange={e => setNuevoDoctor({...nuevoDoctor, especialidad: e.target.value})} placeholder="ej: Oftalmología, Optometría..." className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
                  <input type="text" value={nuevoDoctor.telefono} onChange={e => setNuevoDoctor({...nuevoDoctor, telefono: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" value={nuevoDoctor.email} onChange={e => setNuevoDoctor({...nuevoDoctor, email: e.target.value})} className={inputClass} />
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

      {/* Modal nueva sede */}
      {mostrarNuevaSede && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nueva sede</h3>
              <button onClick={() => setMostrarNuevaSede(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre de la sede</label>
                  <input type="text" value={nuevaSede.nombre} onChange={e => setNuevaSede({...nuevaSede, nombre: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                  <input type="text" value={nuevaSede.ciudad} onChange={e => setNuevaSede({...nuevaSede, ciudad: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
                  <input type="text" value={nuevaSede.telefono} onChange={e => setNuevaSede({...nuevaSede, telefono: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" value={nuevaSede.email} onChange={e => setNuevaSede({...nuevaSede, email: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Dirección</label>
                <input type="text" value={nuevaSede.direccion} onChange={e => setNuevaSede({...nuevaSede, direccion: e.target.value})} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMostrarNuevaSede(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={guardarSede} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}