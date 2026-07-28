'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import Link from 'next/link'

export default function AsistenciaPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [registros, setRegistros] = useState<any[]>([])
  const [colegioId, setColegioId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const [estudianteId, setEstudianteId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [estado, setEstado] = useState('presente')
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

    const { data: registrosData, error: registrosError } = await supabase
      .from('asistencia')
      .select('*, estudiantes(nombre_completo)')
      .order('fecha', { ascending: false })

    if (registrosError) {
      setError(registrosError.message)
    } else {
      setRegistros(registrosData || [])
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

    const { error } = await supabase.from('asistencia').insert({
      colegio_id: colegioId,
      estudiante_id: estudianteId,
      fecha: fecha,
      estado: estado,
      observacion: observacion,
      registrado_por: user?.id,
    })

    if (error) {
      setError(error.message)
    } else {
      setEstudianteId('')
      setObservacion('')
      cargarDatos()
    }
    setGuardando(false)
  }

  const colorEstado = (est: string) => {
    if (est === 'presente') return '#0a0'
    if (est === 'tarde') return '#e90'
    if (est === 'falta') return '#c00'
    return '#666'
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
      <Link href="/">← Volver</Link>
      <h1>Asistencia</h1>

      <form onSubmit={handleGuardar} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '20px' }}>
        <h3>Registrar asistencia</h3>

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
          <label>Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="presente">Presente</option>
            <option value="tarde">Tarde</option>
            <option value="falta">Falta</option>
            <option value="justificado">Justificado</option>
          </select>
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
          {guardando ? 'Guardando...' : 'Guardar asistencia'}
        </button>
      </form>

      <h3>Registros de asistencia ({registros.length})</h3>

      {cargando ? (
        <p>Cargando...</p>
      ) : registros.length === 0 ? (
        <p>Aún no hay registros de asistencia.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Estudiante</th>
              <th style={{ padding: '8px' }}>Fecha</th>
              <th style={{ padding: '8px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((reg) => (
              <tr key={reg.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>{reg.estudiantes?.nombre_completo}</td>
                <td style={{ padding: '8px' }}>{reg.fecha}</td>
                <td style={{ padding: '8px', color: colorEstado(reg.estado), fontWeight: 'bold' }}>
                  {reg.estado}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}