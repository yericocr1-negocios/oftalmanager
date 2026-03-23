'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

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
}

export default function PerfilPaciente({ params }: { params: { id: string } }) {
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [tab, setTab] = useState('datos')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarPaciente = async () => {
      setCargando(true)
      const id = window.location.pathname.split('/').pop()
      const { data } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single()
      setPaciente(data)
      setCargando(false)
    }
    cargarPaciente()
  }, [])

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
        <div className="border-b border-gray-800 px-8 py-4 flex items-center gap-4">
          <a href="/pacientes" className="text-gray-400 hover:text-white text-sm">← Pacientes</a>
          <span className="text-gray-600">/</span>
          <h2 className="text-lg font-semibold">{paciente.nombres} {paciente.apellidos}</h2>
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
              <button
                key={t}
                onClick={() => setTab(t)}
                className={'px-4 py-2 rounded-lg text-sm transition-all ' + (tab === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800')}
              >
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
                  <label className="text-xs text-gray-400 mb-1 block">DNI</label>
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
              </div>
              <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                Guardar cambios
              </button>
            </div>
          )}

          {tab === 'historia' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Historia Clinica</h3>
                <a href="/consulta" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                  Nueva consulta
                </a>
              </div>
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-4">🏥</p>
                <p>No hay consultas registradas aun</p>
              </div>
            </div>
          )}

          {tab === 'compras' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-6">Historial de compras</h3>
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-4">🛒</p>
                <p>No hay compras registradas aun</p>
              </div>
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