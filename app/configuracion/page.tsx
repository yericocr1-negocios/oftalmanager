'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { supabase } from '../../lib/supabase'

const EMPRESA_ID = 'b2711600-fbf7-4f11-b699-8024e36c7cf5'

const usuariosEjemplo = [
  { id: 1, nombre: 'Admin', email: 'corporacion.vortex1@gmail.com', rol: 'admin', sede: 'Lima', activo: true },
]

const sedesEjemplo = [
  { id: 1, nombre: 'Sede Lima', direccion: 'Av. Javier Prado 123', ciudad: 'Lima', telefono: '01-234-5678', activo: true },
]

export default function Configuracion() {
  const [tab, setTab] = useState('empresa')
  const [doctores, setDoctores] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mostrarNuevoDoctor, setMostrarNuevoDoctor] = useState(false)
  const [nuevoDoctor, setNuevoDoctor] = useState({
    nombres: '', apellidos: '', especialidad: '', telefono: '', email: '', activo: true
  })
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    if (tab === 'doctores') cargarDoctores()
  }, [tab])

  const cargarDoctores = async () => {
    setCargando(true)
    const { data } = await supabase.from('doctores').select('*').order('nombres')
    setDoctores(data || [])
    setCargando(false)
  }

  const guardarDoctor = async () => {
    if (!nuevoDoctor.nombres || !nuevoDoctor.apellidos) { alert('Nombres y apellidos son obligatorios'); return }
    const { error } = await supabase.from('doctores').insert([{ ...nuevoDoctor, empresa_id: EMPRESA_ID }])
    if (error) { alert('Error: ' + error.message); return }
    setMostrarNuevoDoctor(false)
    setNuevoDoctor({ nombres: '', apellidos: '', especialidad: '', telefono: '', email: '', activo: true })
    cargarDoctores()
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

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white">☰</button>
            <div>
              <h2 className="text-lg font-semibold">Configuracion</h2>
              <p className="text-sm text-gray-400">Administra tu empresa, sedes, doctores y usuarios</p>
            </div>
          </div>
          {tab === 'doctores' && (
            <button onClick={() => setMostrarNuevoDoctor(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
              + Nuevo doctor
            </button>
          )}
        </div>

        <div className="p-4 md:p-8">
          <div className="flex gap-2 md:gap-3 mb-6 flex-wrap">
            {['empresa', 'doctores', 'sedes', 'usuarios', 'permisos'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 rounded-lg text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}>
                {t === 'empresa' ? 'Empresa' : t === 'doctores' ? 'Doctores' : t === 'sedes' ? 'Sedes' : t === 'usuarios' ? 'Usuarios' : 'Permisos'}
              </button>
            ))}
          </div>

          {tab === 'empresa' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Datos de la empresa</h3>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre de la empresa</label>
                  <input type="text" defaultValue="Clinica Vision Peru" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">RUC</label>
                  <input type="text" defaultValue="20123456789" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <input type="email" defaultValue="contacto@clinica.com" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Telefono</label>
                  <input type="text" defaultValue="01-234-5678" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Direccion principal</label>
                  <input type="text" defaultValue="Av. Javier Prado 123, Lima" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Guardar cambios</button>
              </div>
            </div>
          )}

          {tab === 'doctores' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-medium">Doctores y optometras</h3>
                <p className="text-xs text-gray-400 mt-1">Estos doctores apareceran como opciones al agendar citas</p>
              </div>
              {cargando ? (
                <div className="text-center text-gray-400 py-12">Cargando...</div>
              ) : doctores.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-4xl mb-4">👨‍⚕️</p>
                  <p className="text-sm">No hay doctores registrados</p>
                  <button onClick={() => setMostrarNuevoDoctor(true)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                    + Agregar primer doctor
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Doctor</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Especialidad</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Telefono</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Email</th>
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
                          <button onClick={() => toggleActivo(d.id, d.activo)} className="text-blue-400 hover:text-blue-300 text-xs">
                            {d.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => eliminarDoctor(d.id)} className="text-red-400 hover:text-red-300 text-xs">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'sedes' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-medium">Sedes registradas</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">+ Nueva sede</button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Sede</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Ciudad</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Telefono</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sedesEjemplo.map((s) => (
                    <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{s.nombre}</p>
                        <p className="text-xs text-gray-400">{s.direccion}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{s.ciudad}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{s.telefono}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">Activo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'usuarios' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-medium">Usuarios del sistema</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">+ Nuevo usuario</button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Usuario</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Rol</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosEjemplo.map((u) => (
                    <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">{u.nombre[0]}</div>
                          <div>
                            <p className="text-sm font-medium">{u.nombre}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-purple-900 text-purple-400 text-xs px-2 py-1 rounded-full capitalize">{u.rol}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">Activo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'permisos' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Permisos por rol</h3>
              <div className="space-y-4">
                {[
                  { rol: 'Admin', permisos: ['Dashboard', 'Clientes', 'Agenda', 'Ventas', 'Control ventas', 'Inventario', 'Finanzas', 'Reportes', 'Configuracion'] },
                  { rol: 'Doctor', permisos: ['Dashboard', 'Clientes', 'Agenda', 'Consulta'] },
                  { rol: 'Vendedor', permisos: ['Dashboard', 'Clientes', 'Ventas', 'Control ventas', 'Inventario'] },
                  { rol: 'Recepcion', permisos: ['Dashboard', 'Clientes', 'Agenda'] },
                ].map((r) => (
                  <div key={r.rol} className="border border-gray-800 rounded-xl p-4">
                    <p className="font-medium mb-3">{r.rol}</p>
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
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
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
              <button onClick={guardarDoctor} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Guardar doctor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}