'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    const supabase = createClient()

    const { data, error: errorAuth } = await supabase.auth.signUp({
      email,
      password,
    })

    if (errorAuth) {
      setError(errorAuth.message)
      setCargando(false)
      return
    }

    if (data.user) {
      const { error: errorPerfil } = await supabase.from('usuarios').insert({
        id: data.user.id,
        nombre_completo: nombreCompleto,
        email: email,
        rol: 'super_admin',
      })

      if (errorPerfil) {
        setError(errorPerfil.message)
        setCargando(false)
        return
      }
    }

    setCargando(false)
    router.push('/')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px' }}>
      <h1>Crear cuenta</h1>
      <form onSubmit={handleRegistro}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nombre completo</label>
          <input
            type="text"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
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
            minLength={6}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          style={{ width: '100%', padding: '10px', backgroundColor: '#000', color: '#fff', border: 'none' }}
        >
          {cargando ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>
    </div>
  )
}