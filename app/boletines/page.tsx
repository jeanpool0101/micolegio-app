'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
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

  const inputClass = "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"

  const colorNota = (n: number) => {
    if (n >= 4) return 'text-green-600 bg-green-50'
    if (n >= 3) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Boletines</h1>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
        {cargando ? (
          <p className="text-gray-400 text-sm">Cargando estudiantes...</p>
        ) : (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Selecciona un estudiante</label>
            <select
              value={estudianteId}
              onChange={(e) => cargarNotasDelEstudiante(e.target.value)}
              className={inputClass}
            >
              <option value="">-- Selecciona --</option>
              {estudiantes.map((est) => (
                <option key={est.id} value={est.id}>{est.nombre_completo}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {cargandoNotas && <p className="text-gray-400 text-sm">Cargando notas...</p>}

      {estudianteId && !cargandoNotas && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Notas encontradas ({notas.length})</span>
            {notas.length > 0 && (
              <button
                onClick={generarPDF}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                Descargar PDF
              </button>
            )}
          </div>

          {notas.length === 0 ? (
            <p className="p-5 text-gray-400 text-sm">Este estudiante aún no tiene notas registradas.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Materia</th>
                  <th className="px-5 py-3 font-medium">Periodo</th>
                  <th className="px-5 py-3 font-medium">Calificación</th>
                </tr>
              </thead>
              <tbody>
                {notas.map((n) => (
                  <tr key={n.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 text-gray-800">{n.materias?.nombre}</td>
                    <td className="px-5 py-3 text-gray-600">{n.periodo}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${colorNota(n.calificacion)}`}>
                        {n.calificacion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}