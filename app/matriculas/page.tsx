'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'

export default function MatriculasPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState('')
  const [colegioId, setColegioId] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

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

    if (perfil?.colegio_id) setColegioId(perfil.colegio_id)

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
      setMostrarForm(false)
      cargarDatos()
    }
    setCreando(false)
  }

  const inputClass = "w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Matrículas</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {mostrarForm ? 'Cancelar' : '+ Matricular estudiante'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleMatricular} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre completo</label>
              <input type="text" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Documento de identidad</label>
              <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Grado</label>
              <input type="text" placeholder="Ej: 5to grado" value={grado} onChange={(e) => setGrado(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre del acudiente</label>
              <input type="text" value={nombreAcudiente} onChange={(e) => setNombreAcudiente(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Teléfono del acudiente</label>
              <input type="text" value={telefonoAcudiente} onChange={(e) => setTelefonoAcudiente(e.target.value)} className={inputClass} />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={creando}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {creando ? 'Matriculando...' : 'Matricular estudiante'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-600">Estudiantes matriculados ({estudiantes.length})</span>
        </div>

        {cargando ? (
          <p className="p-5 text-gray-400 text-sm">Cargando...</p>
        ) : estudiantes.length === 0 ? (
          <p className="p-5 text-gray-400 text-sm">Aún no hay estudiantes matriculados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Documento</th>
                <th className="px-5 py-3 font-medium">Grado</th>
                <th className="px-5 py-3 font-medium">Acudiente</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est) => (
                <tr key={est.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 text-gray-800">{est.nombre_completo}</td>
                  <td className="px-5 py-3 text-gray-600">{est.documento_identidad}</td>
                  <td className="px-5 py-3 text-gray-600">{est.grado}</td>
                  <td className="px-5 py-3 text-gray-600">{est.nombre_acudiente || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}