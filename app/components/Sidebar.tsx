'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

const menuItems = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/colegios', label: 'Colegios', icon: '🏫' },
  { href: '/matriculas', label: 'Matrículas', icon: '👤' },
  { href: '/notas', label: 'Notas', icon: '📝' },
  { href: '/asistencia', label: 'Asistencia', icon: '✅' },
  { href: '/boletines', label: 'Boletines', icon: '📄' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // No mostrar el sidebar en login/registro
  if (pathname === '/login' || pathname === '/registro') {
    return null
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">MiColegio</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const activo = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activo
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}