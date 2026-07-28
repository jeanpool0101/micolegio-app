'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    const supabase = createClient()

    const { data, error: errorAuth } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (errorAuth) {
      setError(errorAuth.message)
      setCargando(false)
      return
    }

    // Verificar si ya existe el perfil, si no, crearlo
    if (data.user) {
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!perfil) {
        await supabase.from('usuarios').insert({
          id: data.user.id,
          nombre_completo: data.user.email?.split('@')[0] || 'Usuario',
          email: data.user.email,
          rol: 'super_admin',
        })
      }
    }

    setCargando(false)
    router.push('/')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px' }}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          style={{ width: '100%', padding: '10px', backgroundColor: '#000', color: '#fff', border: 'none' }}
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}