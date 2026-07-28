'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'

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
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Colegios</h1>

      <form onSubmit={handleCrear} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Nombre del colegio"
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          required
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
        <button
          type="submit"
          disabled={creando}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {creando ? 'Creando...' : 'Crear colegio'}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {cargando ? (
          <p className="p-5 text-gray-400 text-sm">Cargando colegios...</p>
        ) : colegios.length === 0 ? (
          <p className="p-5 text-gray-400 text-sm">Aún no hay colegios registrados.</p>
        ) : (
          colegios.map((colegio, i) => (
            <div
              key={colegio.id}
              className={`px-5 py-4 text-sm text-gray-700 ${i !== colegios.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {colegio.nombre}
            </div>
          ))
        )}
      </div>
    </div>
  )
}