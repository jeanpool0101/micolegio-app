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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (cargando) {
    return <div style={{ padding: '40px' }}>Cargando...</div>
  }

  if (!usuario) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', textAlign: 'center' }}>
        <h1>Bienvenido a MiColegio</h1>
        <p>Necesitas iniciar sesión para continuar.</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link href="/login">
            <button style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none' }}>
              Iniciar sesión
            </button>
          </Link>
          <Link href="/registro">
            <button style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#000', border: '1px solid #000' }}>
              Registrarse
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '500px', margin: '80px auto', padding: '20px' }}>
      <h1>¡Bienvenido, {perfil?.nombre_completo || usuario.email}! 👋</h1>
      <p>Correo: {usuario.email}</p>
      <p>Rol: {perfil?.rol || 'Sin rol asignado'}</p>
      <button
        onClick={handleLogout}
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#c00', color: '#fff', border: 'none' }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}