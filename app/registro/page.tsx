'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [colegioId, setColegioId] = useState('')
  const [colegios, setColegios] = useState<any[]>([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const cargarColegios = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('colegios').select('id, nombre')
      setColegios(data || [])
    }
    cargarColegios()
  }, [])

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
        rol: 'docente',
        colegio_id: colegioId,
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
          <label>Colegio</label>
          <select
            value={colegioId}
            onChange={(e) => setColegioId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Selecciona un colegio</option>
            {colegios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
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