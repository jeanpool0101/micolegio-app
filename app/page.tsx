'use client'

import { useEffect, useState } from 'react'
import { createClient } from './lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const cargarUsuario = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      setUsuario(user)

      if (user) {
        const { data: perfilData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single()

        setPerfil(perfilData)
      }

      setCargando(false)
    }

    cargarUsuario()
  }, [])

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido a MiColegio</h1>
          <p className="text-gray-500 mb-6">Necesitas iniciar sesión para continuar.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Iniciar sesión
              </button>
            </Link>
            <Link href="/registro">
              <button className="px-5 py-2.5 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                Registrarse
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const modulos = [
    { href: '/colegios', label: 'Colegios', icon: '🏫', desc: 'Gestiona los colegios registrados' },
    { href: '/matriculas', label: 'Matrículas', icon: '👤', desc: 'Matricula y consulta estudiantes' },
    { href: '/notas', label: 'Notas', icon: '📝', desc: 'Registra calificaciones' },
    { href: '/asistencia', label: 'Asistencia', icon: '✅', desc: 'Control de asistencia diaria' },
    { href: '/boletines', label: 'Boletines', icon: '📄', desc: 'Genera boletines en PDF' },
  ]

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Hola, {perfil?.nombre_completo || usuario.email} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {perfil?.rol ? `Rol: ${perfil.rol}` : 'Sin rol asignado'} · {usuario.email}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {modulos.map((m) => (
          <Link key={m.href} href={m.href}>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
              <div className="text-2xl mb-2">{m.icon}</div>
              <h3 className="font-semibold text-gray-800">{m.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}