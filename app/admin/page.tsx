'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Sidebar from '../../components/Sidebar'

const ADMIN_EMAIL = 'corporacion.vortex1@gmail.com'

export default function Admin() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [clientes, setClientes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [creando, setCreando] = useState(false)
  const [esAdmin, setEsAdmin] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [nuevo, setNuevo] = useState({ email: '', password: '', nombreEmpresa: '', ciudad: '', telefono: '', ruc: '' })

  useEffect(() => { verificarAdmin() }, [])

  const verificarAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email === ADMIN_EMAIL) {
      setEsAdmin(true)
      cargarClientes()
    } else {
      setEsAdmin(false)
      setCargando(false)
    }
  }

  const cargarClientes = async () => {
    setCargando(true)
    const { data } = await supabase
      .from('empresas')
      .select('*, sedes(*), usuarios_empresas(*)')
      .order('created_at', { ascending: false })
    setClientes(data || [])
    setCargando(false)
  }

  const crearCliente = async () => {
    if (!nuevo.email || !nuevo.password || !nuevo.nombreEmpresa) {
      alert('Email, contraseña y nombre de empresa son obligatorios')
      return
    }
    setCreando(true)

    try {
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .insert([{ nombre: nuevo.nombreEmpresa, email: nuevo.email, ruc: nuevo.ruc, telefono: nuevo.telefono, ciudad: nuevo.ciudad, activo: true }])
        .select().single()

      if (empresaError) { alert('Error: ' + empresaError.message); setCreando(false); return }

      const { data: sedeData, error: sedeError } = await supabase
        .from('sedes')
        .insert([{ empresa_id: empresaData.id, nombre: 'Sede Principal', ciudad: nuevo.ciudad || 'Lima', activo: true }])
        .select().single()

      if (sedeError) { alert('Error: ' + sedeError.message); setCreando(false); return }

      setResultado({
        empresa: empresaData.nombre,
        empresaId: empresaData.id,
        sedeId: sedeData.id,
        email: nuevo.email,
        password: nuevo.password,
      })

      setCreando(false)
      setNuevo({ email: '', password: '', nombreEmpresa: '', ciudad: '', telefono: '', ruc: '' })
      cargarClientes()

    } catch (e: any) {
      alert('Error: ' + e.message)
      setCreando(false)
    }
  }

  const agregarUsuarioAEmpresa = async (empresaId: string, email: string, rol: string) => {
    const sqlAdmin = `-- 1. Crea el usuario en Supabase → Authentication → Users con este email y password\n-- Email: ${email}\n\n-- 2. Luego ejecuta este SQL:\ninsert into usuarios_empresas (user_id, empresa_id, rol, activo)\nselect id, '${empresaId}', '${rol}', true\nfrom auth.users\nwhere email = '${email}'\non conflict do nothing;`
    navigator.clipboard.writeText(sqlAdmin)
    alert('SQL copiado. Crea el usuario en Authentication y ejecuta el SQL en SQL Editor.')
  }

  const copiarSQL = (r: any) => {
    const sql = `-- Paso 1: Crear usuario en Supabase → Authentication → Users\n-- Email: ${r.email}\n-- Password: ${r.password}\n\n-- Paso 2: Ejecutar este SQL despues de crear el usuario\ninsert into usuarios_empresas (user_id, empresa_id, rol, activo)\nselect id, '${r.empresaId}', 'admin', true\nfrom auth.users\nwhere email = '${r.email}'\non conflict do nothing;`
    navigator.clipboard.writeText(sql)
    alert('SQL copiado al portapapeles')
  }

  if (!esAdmin && !cargando) {
    return (
      <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-lg font-semibold mb-2">Acceso restringido</p>
          <p className="text-gray-400 text-sm">Solo el administrador puede acceder</p>
          <a href="/" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Volver</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden text-gray-400 hover:text-white text-xl">☰</button>
            <div>
              <h2 className="text-base md:text-lg font-semibold">Panel Admin</h2>
              <p className="text-xs md:text-sm text-gray-400">Gestion de clientes OFTALMANAGER</p>
            </div>
          </div>
          <button onClick={() => setMostrarNuevo(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Nuevo cliente</button>
        </div>

        <div className="p-4 md:p-8">
          <div className="bg-yellow-900 border border-yellow-700 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 text-sm font-medium mb-2">📋 Proceso para agregar nuevo cliente o usuario:</p>
            <p className="text-yellow-300 text-xs">1. Click en "+ Nuevo cliente" y llena los datos → se crea empresa y sede</p>
            <p className="text-yellow-300 text-xs">2. Copia el SQL que aparece</p>
            <p className="text-yellow-300 text-xs">3. Ve a Supabase → Authentication → Users → Add user (email + password)</p>
            <p className="text-yellow-300 text-xs">4. Ejecuta el SQL en Supabase → SQL Editor</p>
            <p className="text-yellow-300 text-xs mt-2 font-medium">Para agregar vendedor/doctor/recepcion a una empresa existente → click en "+" de esa empresa</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Total clientes</p>
              <p className="text-2xl font-bold text-blue-400">{clientes.length}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Activos</p>
              <p className="text-2xl font-bold text-green-400">{clientes.filter(c => c.activo).length}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Total sedes</p>
              <p className="text-2xl font-bold text-purple-400">{clientes.reduce((sum, c) => sum + (c.sedes?.length || 0), 0)}</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="font-medium">Clientes registrados</h3>
            </div>
            {cargando ? (
              <div className="text-center text-gray-400 py-12">Cargando...</div>
            ) : clientes.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-4">🏥</p>
                <p className="text-sm">No hay clientes registrados</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {clientes.map((c) => (
                  <div key={c.id} className="p-4 md:px-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {c.nombre?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.nombre}</p>
                          <p className="text-xs text-gray-400">{c.email} • {c.ciudad || 'Sin ciudad'}</p>
                          <p className="text-xs text-gray-500">{c.sedes?.length || 0} sede(s) • {c.usuarios_empresas?.length || 0} usuario(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={'text-xs px-2 py-1 rounded-full ' + (c.activo ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400')}>
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        <button
                          onClick={() => {
                            const email = prompt('Email del nuevo usuario (vendedor/doctor/recepcion):')
                            const rol = prompt('Rol (admin/vendedor/doctor/recepcion):')
                            if (email && rol) agregarUsuarioAEmpresa(c.id, email, rol)
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded-lg"
                        >
                          + Usuario
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mostrarNuevo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Nuevo cliente</h3>
              <button onClick={() => { setMostrarNuevo(false); setResultado(null) }} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>

            {resultado ? (
              <div className="space-y-4">
                <div className="bg-green-900 border border-green-700 rounded-xl p-4">
                  <p className="text-green-400 font-semibold mb-2">✅ Empresa y sede creadas</p>
                  <p className="text-sm text-green-300">Empresa: <span className="font-bold">{resultado.empresa}</span></p>
                  <p className="text-xs text-green-300 mt-1">Empresa ID: <span className="font-mono">{resultado.empresaId}</span></p>
                  <p className="text-xs text-green-300">Sede ID: <span className="font-mono">{resultado.sedeId}</span></p>
                </div>
                <div className="bg-blue-900 border border-blue-700 rounded-xl p-4">
                  <p className="text-blue-400 font-semibold mb-2">📋 Pasos siguientes:</p>
                  <p className="text-blue-300 text-xs">1. Ve a Supabase → Authentication → Users → Add user</p>
                  <p className="text-blue-300 text-xs">2. Email: <span className="font-bold">{resultado.email}</span></p>
                  <p className="text-blue-300 text-xs">3. Password: <span className="font-bold">{resultado.password}</span></p>
                  <p className="text-blue-300 text-xs mt-2">4. Ejecuta el SQL que se copia abajo en SQL Editor</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs font-mono text-gray-300 whitespace-pre-wrap">{`insert into usuarios_empresas (user_id, empresa_id, rol, activo)\nselect id, '${resultado.empresaId}', 'admin', true\nfrom auth.users\nwhere email = '${resultado.email}'\non conflict do nothing;`}</p>
                </div>
                <button onClick={() => copiarSQL(resultado)} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">📋 Copiar SQL</button>
                <button onClick={() => { setResultado(null); setMostrarNuevo(false) }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">Cerrar</button>
              </div>
            ) : (
              <div className="space-y-4">
                {creando && <div className="bg-blue-900 border border-blue-700 rounded-xl p-4"><p className="text-blue-400 text-sm">⏳ Creando empresa y sede...</p></div>}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre de la clinica</label>
                  <input type="text" value={nuevo.nombreEmpresa} onChange={(e) => setNuevo({...nuevo, nombreEmpresa: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Email del admin</label>
                    <input type="email" value={nuevo.email} onChange={(e) => setNuevo({...nuevo, email: e.target.value})} autoCapitalize="none" autoCorrect="off" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Password</label>
                    <input type="text" value={nuevo.password} onChange={(e) => setNuevo({...nuevo, password: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
                    <input type="text" value={nuevo.ciudad} onChange={(e) => setNuevo({...nuevo, ciudad: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">RUC (opcional)</label>
                    <input type="text" value={nuevo.ruc} onChange={(e) => setNuevo({...nuevo, ruc: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setMostrarNuevo(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm">Cancelar</button>
                  <button onClick={crearCliente} disabled={creando} className={'flex-1 text-white py-2 rounded-lg text-sm font-medium ' + (creando ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700')}>
                    {creando ? 'Creando...' : 'Crear cliente'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}