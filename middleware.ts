import { NextResponse } from 'next/server'

export async function middleware(req) {
  const isLoginPage = req.nextUrl.pathname === '/login'
  const isPublicPage = req.nextUrl.pathname === '/citas'
  const isStatic = req.nextUrl.pathname.startsWith('/_next')

  if (isStatic || isPublicPage) return NextResponse.next()

  const token = req.cookies.get('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}