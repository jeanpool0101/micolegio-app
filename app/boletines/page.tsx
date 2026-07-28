'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import Link from 'next/link'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function BoletinesPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [estudianteId, setEstudianteId] = useState('')
  const [notas, setNotas] = useState<any[]>([])
  const [cargandoNotas, setCargandoNotas] = useState(false)
  const [cargando, setCargando] = useState(true)

  const cargarEstudiantes = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('estudiantes').select('id, nombre_completo, grado, documento_identidad')
    setEstudiantes(data || [])
    setCargando(false)
  }

  useEffect(() => {
    cargarEstudiantes()
  }, [])

  const cargarNotasDelEstudiante = async (id: string) => {
    setEstudianteId(id)
    if (!id) {
      setNotas([])
      return
    }
    setCargandoNotas(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('notas')
      .select('*, materias(nombre)')
      .eq('estudiante_id', id)
      .order('periodo')

    setNotas(data || [])
    setCargandoNotas(false)
  }

  const generarPDF = () => {
    const estudiante = estudiantes.find((e) => e.id === estudianteId)
    if (!estudiante) return

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Boletín de Calificaciones', 14, 20)

    doc.setFontSize(11)
    doc.text(`Estudiante: ${estudiante.nombre_completo}`, 14, 32)
    doc.text(`Documento: ${estudiante.documento_identidad}`, 14, 38)
    doc.text(`Grado: ${estudiante.grado}`, 14, 44)

    const filas = notas.map((n) => [
      n.materias?.nombre || '-',
      n.periodo,
      n.calificacion.toString(),
      n.observacion || '-',
    ])

    autoTable(doc, {
      startY: 52,
      head: [['Materia', 'Periodo', 'Calificación', 'Observación']],
      body: filas,
    })

    const promedio =
      notas.length > 0
        ? (notas.reduce((sum, n) => sum + parseFloat(n.calificacion), 0) / notas.length).toFixed(1)
        : '0.0'

    const finalY = (doc as any).lastAutoTable.finalY || 52
    doc.setFontSize(12)
    doc.text(`Promedio general: ${promedio}`, 14, finalY + 10)

    doc.save(`boletin_${estudiante.nombre_completo.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
      <Link href="/">← Volver</Link>
      <h1>Boletines</h1>

      {cargando ? (
        <p>Cargando estudiantes...</p>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <label>Selecciona un estudiante</label>
          <select
            value={estudianteId}
            onChange={(e) => cargarNotasDelEstudiante(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">-- Selecciona --</option>
            {estudiantes.map((est) => (
              <option key={est.id} value={est.id}>{est.nombre_completo}</option>
            ))}
          </select>
        </div>
      )}

      {cargandoNotas && <p>Cargando notas...</p>}

      {estudianteId && !cargandoNotas && (
        <div>
          <h3>Notas encontradas: {notas.length}</h3>

          {notas.length === 0 ? (
            <p>Este estudiante aún no tiene notas registradas.</p>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Materia</th>
                    <th style={{ padding: '8px' }}>Periodo</th>
                    <th style={{ padding: '8px' }}>Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.map((n) => (
                    <tr key={n.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px' }}>{n.materias?.nombre}</td>
                      <td style={{ padding: '8px' }}>{n.periodo}</td>
                      <td style={{ padding: '8px' }}>{n.calificacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={generarPDF}
                style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none' }}
              >
                Descargar boletín en PDF
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}