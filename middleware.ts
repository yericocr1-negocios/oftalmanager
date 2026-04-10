import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rutasPublicas = ['/login', '/citas']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Permitir rutas públicas
  if (rutasPublicas.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Permitir archivos estáticos y API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') 
  ) {
    return NextResponse.next()
  }

  // Verificar sesión por cookie de Supabase
  const token =
    req.cookies.get('sb-access-token')?.value ||
    req.cookies.get('sb-vaxavsndkeknqdprgoto-auth-token')?.value ||
    req.cookies.get('supabase-auth-token')?.value

  // Buscar cualquier cookie que empiece con sb- y contenga auth
  let tieneSession = !!token
  if (!tieneSession) {
    req.cookies.getAll().forEach(cookie => {
      if (cookie.name.includes('auth-token') || cookie.name.includes('sb-')) {
        if (cookie.value && cookie.value.length > 10) {
          tieneSession = true
        }
      }
    })
  }

  if (!tieneSession) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}