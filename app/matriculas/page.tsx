'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import Link from 'next/link'

export default function MatriculasPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState('')
  const [colegioId, setColegioId] = useState('')

  // Campos del formulario
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [documento, setDocumento] = useState('')
  const [grado, setGrado] = useState('')
  const [nombreAcudiente, setNombreAcudiente] = useState('')
  const [telefonoAcudiente, setTelefonoAcudiente] = useState('')

  const cargarDatos = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('colegio_id')
      .eq('id', user.id)
      .single()

    if (perfil?.colegio_id) {
      setColegioId(perfil.colegio_id)
    }

    const { data, error } = await supabase
      .from('estudiantes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setEstudiantes(data || [])
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleMatricular = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreando(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('estudiantes').insert({
      colegio_id: colegioId,
      nombre_completo: nombreCompleto,
      documento_identidad: documento,
      grado: grado,
      nombre_acudiente: nombreAcudiente,
      telefono_acudiente: telefonoAcudiente,
    })

    if (error) {
      setError(error.message)
    } else {
      setNombreCompleto('')
      setDocumento('')
      setGrado('')
      setNombreAcudiente('')
      setTelefonoAcudiente('')
      cargarDatos()
    }
    setCreando(false)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
      <Link href="/">← Volver</Link>
      <h1>Matrículas</h1>

      <form onSubmit={handleMatricular} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '20px' }}>
        <h3>Matricular nuevo estudiante</h3>

        <div style={{ marginBottom: '10px' }}>
          <label>Nombre completo</label>
          <input
            type="text"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Documento de identidad</label>
          <input
            type="text"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Grado</label>
          <input
            type="text"
            placeholder="Ej: 5to grado"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Nombre del acudiente</label>
          <input
            type="text"
            value={nombreAcudiente}
            onChange={(e) => setNombreAcudiente(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Teléfono del acudiente</label>
          <input
            type="text"
            value={telefonoAcudiente}
            onChange={(e) => setTelefonoAcudiente(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button
          type="submit"
          disabled={creando}
          style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none' }}
        >
          {creando ? 'Matriculando...' : 'Matricular estudiante'}
        </button>
      </form>

      <h3>Estudiantes matriculados ({estudiantes.length})</h3>

      {cargando ? (
        <p>Cargando...</p>
      ) : estudiantes.length === 0 ? (
        <p>Aún no hay estudiantes matriculados.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Nombre</th>
              <th style={{ padding: '8px' }}>Documento</th>
              <th style={{ padding: '8px' }}>Grado</th>
              <th style={{ padding: '8px' }}>Acudiente</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((est) => (
              <tr key={est.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>{est.nombre_completo}</td>
                <td style={{ padding: '8px' }}>{est.documento_identidad}</td>
                <td style={{ padding: '8px' }}>{est.grado}</td>
                <td style={{ padding: '8px' }}>{est.nombre_acudiente || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}