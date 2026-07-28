'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'

export default function NotasPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [materias, setMaterias] = useState<any[]>([])
  const [notas, setNotas] = useState<any[]>([])
  const [colegioId, setColegioId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

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
      setMostrarForm(false)
      cargarDatos()
    }
    setGuardando(false)
  }

  const inputClass = "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"

  const colorNota = (n: number) => {
    if (n >= 4) return 'text-green-600 bg-green-50'
    if (n >= 3) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notas</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {mostrarForm ? 'Cancelar' : '+ Registrar nota'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleGuardar} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Estudiante</label>
              <select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)} required className={inputClass}>
                <option value="">Selecciona un estudiante</option>
                {estudiantes.map((est) => (
                  <option key={est.id} value={est.id}>{est.nombre_completo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Materia</label>
              <select value={materiaId} onChange={(e) => setMateriaId(e.target.value)} required className={inputClass}>
                <option value="">Selecciona una materia</option>
                {materias.map((mat) => (
                  <option key={mat.id} value={mat.id}>{mat.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Periodo</label>
              <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className={inputClass}>
                <option>Periodo 1</option>
                <option>Periodo 2</option>
                <option>Periodo 3</option>
                <option>Periodo 4</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Calificación (0.0 - 5.0)</label>
              <input type="number" step="0.1" min="0" max="5" value={calificacion} onChange={(e) => setCalificacion(e.target.value)} required className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Observación (opcional)</label>
              <input type="text" value={observacion} onChange={(e) => setObservacion(e.target.value)} className={inputClass} />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={guardando}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar nota'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-600">Notas registradas ({notas.length})</span>
        </div>

        {cargando ? (
          <p className="p-5 text-gray-400 text-sm">Cargando...</p>
        ) : notas.length === 0 ? (
          <p className="p-5 text-gray-400 text-sm">Aún no hay notas registradas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Estudiante</th>
                <th className="px-5 py-3 font-medium">Materia</th>
                <th className="px-5 py-3 font-medium">Periodo</th>
                <th className="px-5 py-3 font-medium">Calificación</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((nota) => (
                <tr key={nota.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 text-gray-800">{nota.estudiantes?.nombre_completo}</td>
                  <td className="px-5 py-3 text-gray-600">{nota.materias?.nombre}</td>
                  <td className="px-5 py-3 text-gray-600">{nota.periodo}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${colorNota(nota.calificacion)}`}>
                      {nota.calificacion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}