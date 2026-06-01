// TareasDashboard.jsx — Vista global de todas las tareas pendientes.
// Agrupa por: vencidas, hoy, esta semana, más adelante.
// Permite marcar como completada directamente desde acá.

import { supabase } from '../lib/supabase'
import { PRIORITY_STYLES } from '../lib/pipeline'

const TODAY = new Date(new Date().toDateString())
const END_OF_WEEK = new Date(TODAY)
END_OF_WEEK.setDate(TODAY.getDate() + 7)

function getGroup(fechaStr) {
  if (!fechaStr) return 'sin_fecha'
  const f = new Date(fechaStr + 'T00:00:00')
  if (f < TODAY) return 'vencidas'
  if (f.toDateString() === TODAY.toDateString()) return 'hoy'
  if (f <= END_OF_WEEK) return 'semana'
  return 'despues'
}

const GROUPS = [
  { key: 'vencidas', label: '⚠️ Vencidas',       color: 'text-red-600 border-red-200 bg-red-50' },
  { key: 'hoy',      label: '🔥 Para hoy',        color: 'text-orange-600 border-orange-200 bg-orange-50' },
  { key: 'semana',   label: '📅 Esta semana',      color: 'text-blue-600 border-blue-200 bg-blue-50' },
  { key: 'despues',  label: '🗓 Más adelante',     color: 'text-gray-600 border-gray-200 bg-gray-50' },
  { key: 'sin_fecha',label: '📌 Sin vencimiento',  color: 'text-gray-500 border-gray-100 bg-white' },
]

export default function TareasDashboard({ tareas, onRefresh, onSelectEmpresa }) {
  const pendientes = tareas.filter(t => !t.completada)

  const handleToggle = async (tarea) => {
    await supabase.from('tareas').update({ completada: !tarea.completada }).eq('id', tarea.id)
    onRefresh()
  }

  const grouped = GROUPS.reduce((acc, g) => {
    acc[g.key] = pendientes.filter(t => getGroup(t.fecha_vencimiento) === g.key)
    return acc
  }, {})

  const total = pendientes.length

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return null
    const d = new Date(fechaStr + 'T00:00:00')
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900">Mis tareas pendientes</h2>
        <p className="text-sm text-gray-500 mt-1">
          {total === 0
            ? '¡Todo al día! No tenés tareas pendientes.'
            : `Tenés ${total} tarea${total !== 1 ? 's' : ''} pendiente${total !== 1 ? 's' : ''}.`
          }
        </p>

        {/* Mini stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {GROUPS.slice(0, 4).map(g => (
            <div key={g.key} className={`border rounded-lg p-3 text-center ${g.color}`}>
              <p className="text-2xl font-bold">{grouped[g.key].length}</p>
              <p className="text-xs mt-0.5">{g.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grupos de tareas */}
      {total === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-500 font-medium">No hay tareas pendientes</p>
          <p className="text-sm text-gray-400 mt-1">Abrí una empresa y agregá follow-ups desde el panel de detalle.</p>
        </div>
      ) : (
        GROUPS.map(g => {
          const items = grouped[g.key]
          if (items.length === 0) return null
          return (
            <div key={g.key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className={`px-4 py-3 border-b ${g.color.includes('red') ? 'bg-red-50 border-red-200' : g.color.includes('orange') ? 'bg-orange-50 border-orange-200' : g.color.includes('blue') ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className={`text-sm font-semibold ${g.color.split(' ')[0]}`}>
                  {g.label} · {items.length}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map(t => {
                  const p = PRIORITY_STYLES[t.prioridad] || PRIORITY_STYLES.media
                  return (
                    <div key={t.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggle(t)}
                        className="mt-0.5 w-4 h-4 cursor-pointer accent-indigo-600 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{t.titulo}</p>
                        {t.descripcion && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{t.descripcion}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.badge}`}>{p.label}</span>
                          {t.fecha_vencimiento && (
                            <span className="text-xs text-gray-500">📅 {formatFecha(t.fecha_vencimiento)}</span>
                          )}
                        </div>
                      </div>
                      {/* Empresa asociada */}
                      {t.empresa_nombre && (
                        <button
                          onClick={() => onSelectEmpresa(t)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 whitespace-nowrap font-medium shrink-0"
                        >
                          {t.empresa_nombre} →
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
