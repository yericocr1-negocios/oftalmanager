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

let cachedEmpresaId = null
let cachedSedeId = null

export async function getEmpresaId() {
  if (cachedEmpresaId) return cachedEmpresaId

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('usuarios_empresas')
    .select('empresa_id')
    .eq('user_id', user.id)
    .eq('activo', true)
    .single()

  cachedEmpresaId = data?.empresa_id || null
  return cachedEmpresaId
}

export async function getSedeId() {
  if (cachedSedeId) return cachedSedeId

  const empresaId = await getEmpresaId()
  if (!empresaId) return null

  const { data } = await supabase
    .from('sedes')
    .select('id')
    .eq('empresa_id', empresaId)
    .limit(1)
    .single()

  cachedSedeId = data?.id || null
  return cachedSedeId
}

export function clearCache() {
  cachedEmpresaId = null
  cachedSedeId = null
}