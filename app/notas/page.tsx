'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import Link from 'next/link'

export default function NotasPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [materias, setMaterias] = useState<any[]>([])
  const [notas, setNotas] = useState<any[]>([])
  const [colegioId, setColegioId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const [estudianteId, setEstudianteId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [periodo, setPeriodo] = useState('Periodo 1')
  const [calificacion, setCalificacion] = useState('')
  const [observacion, setObservacion] = useState('')

  const cargarDatos = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('colegio_id')
      .eq('id', user.id)
      .single()

    if (perfil?.colegio_id) setColegioId(perfil.colegio_id)

    const { data: estudiantesData } = await supabase.from('estudiantes').select('id, nombre_completo')
    setEstudiantes(estudiantesData || [])

    const { data: materiasData } = await supabase.from('materias').select('id, nombre')
    setMaterias(materiasData || [])

    const { data: notasData, error: notasError } = await supabase
      .from('notas')
      .select('*, estudiantes(nombre_completo), materias(nombre)')
      .order('created_at', { ascending: false })

    if (notasError) {
      setError(notasError.message)
    } else {
      setNotas(notasData || [])
    }

    setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('notas').insert({
      colegio_id: colegioId,
      estudiante_id: estudianteId,
      materia_id: materiaId,
      periodo: periodo,
      calificacion: parseFloat(calificacion),
      observacion: observacion,
      registrado_por: user?.id,
    })

    if (error) {
      setError(error.message)
    } else {
      setEstudianteId('')
      setMateriaId('')
      setCalificacion('')
      setObservacion('')
      cargarDatos()
    }
    setGuardando(false)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
      <Link href="/">← Volver</Link>
      <h1>Notas</h1>

      <form onSubmit={handleGuardar} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '20px' }}>
        <h3>Registrar nota</h3>

        <div style={{ marginBottom: '10px' }}>
          <label>Estudiante</label>
          <select
            value={estudianteId}
            onChange={(e) => setEstudianteId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Selecciona un estudiante</option>
            {estudiantes.map((est) => (
              <option key={est.id} value={est.id}>{est.nombre_completo}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Materia</label>
          <select
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Selecciona una materia</option>
            {materias.map((mat) => (
              <option key={mat.id} value={mat.id}>{mat.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Periodo</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option>Periodo 1</option>
            <option>Periodo 2</option>
            <option>Periodo 3</option>
            <option>Periodo 4</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Calificación (0.0 - 5.0)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={calificacion}
            onChange={(e) => setCalificacion(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Observación (opcional)</label>
          <input
            type="text"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button
          type="submit"
          disabled={guardando}
          style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none' }}
        >
          {guardando ? 'Guardando...' : 'Guardar nota'}
        </button>
      </form>

      <h3>Notas registradas ({notas.length})</h3>

      {cargando ? (
        <p>Cargando...</p>
      ) : notas.length === 0 ? (
        <p>Aún no hay notas registradas.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Estudiante</th>
              <th style={{ padding: '8px' }}>Materia</th>
              <th style={{ padding: '8px' }}>Periodo</th>
              <th style={{ padding: '8px' }}>Calificación</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((nota) => (
              <tr key={nota.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>{nota.estudiantes?.nombre_completo}</td>
                <td style={{ padding: '8px' }}>{nota.materias?.nombre}</td>
                <td style={{ padding: '8px' }}>{nota.periodo}</td>
                <td style={{ padding: '8px' }}>{nota.calificacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}