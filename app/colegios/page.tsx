'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import Link from 'next/link'

export default function ColegiosPage() {
  const [colegios, setColegios] = useState<any[]>([])
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [cargando, setCargando] = useState(true)
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState('')

  const cargarColegios = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('colegios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setColegios(data || [])
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarColegios()
  }, [])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreando(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('colegios').insert({ nombre: nombreNuevo })

    if (error) {
      setError(error.message)
    } else {
      setNombreNuevo('')
      cargarColegios()
    }
    setCreando(false)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <Link href="/">← Volver</Link>
      <h1>Colegios</h1>

      <form onSubmit={handleCrear} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Nombre del colegio"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          required
          style={{ flex: 1, padding: '8px' }}
        />
        <button
          type="submit"
          disabled={creando}
          style={{ padding: '8px 20px', backgroundColor: '#000', color: '#fff', border: 'none' }}
        >
          {creando ? 'Creando...' : 'Crear colegio'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {cargando ? (
        <p>Cargando colegios...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {colegios.map((colegio) => (
            <li
              key={colegio.id}
              style={{ padding: '10px', borderBottom: '1px solid #ddd' }}
            >
              {colegio.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}