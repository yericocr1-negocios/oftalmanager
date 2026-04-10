'use client'
import { usePathname } from 'next/navigation'
import AuthGuard from '../components/AuthGuard'

const rutasPublicas = ['/login', '/citas']

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const esPublica = rutasPublicas.some(r => pathname.startsWith(r))

  if (esPublica) return <>{children}</>

  return <AuthGuard>{children}</AuthGuard>
}