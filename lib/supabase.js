import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-session',
  }
})

let cache: { empresaId: string | null, sedeId: string | null, rol: string | null } | null = null

export async function getEmpresaId(): Promise<string | null> {
  if (cache?.empresaId) return cache.empresaId
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('usuarios_empresas')
    .select('empresa_id')
    .eq('user_id', user.id)
    .eq('activo', true)
    .single()
  if (data?.empresa_id) {
    if (!cache) cache = { empresaId: null, sedeId: null, rol: null }
    cache.empresaId = data.empresa_id
  }
  return data?.empresa_id || null
}

export async function getSedeId(): Promise<string | null> {
  if (cache?.sedeId) return cache.sedeId
  const eid = await getEmpresaId()
  if (!eid) return null
  const { data } = await supabase
    .from('sedes')
    .select('id')
    .eq('empresa_id', eid)
    .limit(1)
    .single()
  if (data?.id) {
    if (!cache) cache = { empresaId: null, sedeId: null, rol: null }
    cache.sedeId = data.id
  }
  return data?.id || null
}

export async function getRol(): Promise<string | null> {
  if (cache?.rol) return cache.rol
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('usuarios_empresas')
    .select('rol')
    .eq('user_id', user.id)
    .eq('activo', true)
    .single()
  if (data?.rol) {
    if (!cache) cache = { empresaId: null, sedeId: null, rol: null }
    cache.rol = data.rol
  }
  return data?.rol || 'vendedor'
}

export function clearCache() {
  cache = null
}