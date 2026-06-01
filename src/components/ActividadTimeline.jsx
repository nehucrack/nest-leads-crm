// ActividadTimeline.jsx — Timeline de interacciones dentro de EmpresaDetail.
// Muestra el historial de actividades (emails, llamadas, notas, etc.)
// y un formulario para registrar nuevas interacciones.

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ACTIVITY_TYPES, ACTIVITY_TYPE_MAP } from '../lib/pipeline'

export default function ActividadTimeline({ empresaId, actividades, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [tipo, setTipo] = useState('nota')
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!descripcion.trim()) return
    setSaving(true)
    const { error } = await supabase.from('actividades').insert({
      empresa_id:  empresaId,
      tipo,
      descripcion: descripcion.trim(),
      fecha:       new Date().toISOString(),
    })
    if (!error) {
      setDescripcion('')
      setTipo('nota')
      setShowForm(false)
      onRefresh()
    }
    setSaving(false)
  }

  const formatFecha = (isoStr) => {
    const d = new Date(isoStr)
    return d.toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Actividad ({actividades.length})
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {showForm ? 'Cancelar' : '+ Registrar'}
        </button>
      </div>

      {/* Formulario para nueva actividad */}
      {showForm && (
        <div className="border border-indigo-200 rounded-lg p-4 mb-4 bg-indigo-50 space-y-3">
          {/* Selector de tipo */}
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => setTipo(t.key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  tipo === t.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Texto de la actividad */}
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Describí la interacción, el resultado o el contexto importante..."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
          />

          <button
            onClick={handleSave}
            disabled={saving || !descripcion.trim()}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar actividad'}
          </button>
        </div>
      )}

      {/* Timeline */}
      {actividades.length === 0 && !showForm ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center">
          <p className="text-sm text-gray-400">Sin actividad registrada.</p>
          <p className="text-xs text-gray-400 mt-1">Registrá llamadas, emails y reuniones.</p>
        </div>
      ) : (
        <div className="relative pl-5 space-y-4">
          {/* Línea vertical del timeline */}
          {actividades.length > 0 && (
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
          )}

          {actividades.map((act) => {
            const t = ACTIVITY_TYPE_MAP[act.tipo] || { icon: '📌', label: act.tipo }
            return (
              <div key={act.id} className="relative flex gap-3">
                {/* Dot en la línea */}
                <div className="absolute -left-3 w-5 h-5 rounded-full bg-white border-2 border-indigo-300 flex items-center justify-center text-xs shrink-0">
                  {t.icon}
                </div>

                <div className="flex-1 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-600">{t.label}</span>
                    <span className="text-xs text-gray-400">{formatFecha(act.fecha)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{act.descripcion}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
