'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'

export default function AsistenciaPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [registros, setRegistros] = useState<any[]>([])
  const [colegioId, setColegioId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

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
      setMostrarForm(false)
      cargarDatos()
    }
    setGuardando(false)
  }

  const inputClass = "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"

  const estiloEstado = (est: string) => {
    if (est === 'presente') return 'text-green-600 bg-green-50'
    if (est === 'tarde') return 'text-amber-600 bg-amber-50'
    if (est === 'falta') return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Asistencia</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {mostrarForm ? 'Cancelar' : '+ Registrar asistencia'}
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
              <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputClass}>
                <option value="presente">Presente</option>
                <option value="tarde">Tarde</option>
                <option value="falta">Falta</option>
                <option value="justificado">Justificado</option>
              </select>
            </div>
            <div>
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
            {guardando ? 'Guardando...' : 'Guardar asistencia'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-600">Registros de asistencia ({registros.length})</span>
        </div>

        {cargando ? (
          <p className="p-5 text-gray-400 text-sm">Cargando...</p>
        ) : registros.length === 0 ? (
          <p className="p-5 text-gray-400 text-sm">Aún no hay registros de asistencia.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Estudiante</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((reg) => (
                <tr key={reg.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 text-gray-800">{reg.estudiantes?.nombre_completo}</td>
                  <td className="px-5 py-3 text-gray-600">{reg.fecha}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold capitalize ${estiloEstado(reg.estado)}`}>
                      {reg.estado}
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