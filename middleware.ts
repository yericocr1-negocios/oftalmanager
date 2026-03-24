import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const token = req.cookies.get('sb-access-token')?.value ||
    req.cookies.get('sb-refresh-token')?.value

  const isLoginPage = req.nextUrl.pathname === '/login'
  const isPublicPage = req.nextUrl.pathname === '/citas'
  const isStaticFile = req.nextUrl.pathname.startsWith('/_next')

  if (isStaticFile || isPublicPage) return res

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}