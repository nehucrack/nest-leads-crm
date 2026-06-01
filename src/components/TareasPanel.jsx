// TareasPanel.jsx — Panel de tareas dentro de EmpresaDetail.
// Permite agregar tareas con vencimiento y prioridad,
// marcarlas como completadas, y ver las pendientes.

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { PRIORITY_STYLES } from '../lib/pipeline'

export default function TareasPanel({ empresaId, tareas, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState('')
  const [prioridad, setPrioridad] = useState('media')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!titulo.trim()) return
    setSaving(true)
    const { error } = await supabase.from('tareas').insert({
      empresa_id:        empresaId,
      titulo:            titulo.trim(),
      descripcion:       descripcion.trim() || null,
      fecha_vencimiento: fecha || null,
      prioridad,
    })
    if (!error) {
      setTitulo('')
      setDescripcion('')
      setFecha('')
      setPrioridad('media')
      setShowForm(false)
      onRefresh()
    }
    setSaving(false)
  }

  const handleToggle = async (tarea) => {
    await supabase
      .from('tareas')
      .update({ completada: !tarea.completada })
      .eq('id', tarea.id)
    onRefresh()
  }

  const handleDelete = async (id) => {
    await supabase.from('tareas').delete().eq('id', id)
    onRefresh()
  }

  const pendientes = tareas.filter(t => !t.completada)
  const completadas = tareas.filter(t => t.completada)

  const isVencida = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date(new Date().toDateString())
  }

  const formatFecha = (fecha) => {
    if (!fecha) return null
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tareas ({pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''})
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {showForm ? 'Cancelar' : '+ Nueva tarea'}
        </button>
      </div>

      {/* Formulario nueva tarea */}
      {showForm && (
        <div className="border border-amber-200 rounded-lg p-4 mb-4 bg-amber-50 space-y-3">
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="¿Qué hay que hacer?"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
          />

          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Contexto adicional (opcional)..."
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none bg-white"
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Vencimiento</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Prioridad</label>
              <select
                value={prioridad}
                onChange={e => setPrioridad(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              >
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Media</option>
                <option value="baja">⚪ Baja</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !titulo.trim()}
            className="w-full bg-amber-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Crear tarea'}
          </button>
        </div>
      )}

      {/* Lista de tareas pendientes */}
      {pendientes.length === 0 && !showForm && completadas.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center">
          <p className="text-sm text-gray-400">Sin tareas pendientes.</p>
          <p className="text-xs text-gray-400 mt-1">Agregá follow-ups y próximas acciones.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendientes.map(t => {
            const vencida = isVencida(t.fecha_vencimiento)
            const p = PRIORITY_STYLES[t.prioridad] || PRIORITY_STYLES.media
            return (
              <div
                key={t.id}
                className={`border rounded-lg p-3 ${
                  vencida ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => handleToggle(t)}
                    className="mt-0.5 w-4 h-4 cursor-pointer accent-indigo-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{t.titulo}</p>
                    {t.descripcion && (
                      <p className="text-xs text-gray-500 mt-0.5">{t.descripcion}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.badge}`}>
                        {p.label}
                      </span>
                      {t.fecha_vencimiento && (
                        <span className={`text-xs font-medium ${vencida ? 'text-red-600' : 'text-gray-500'}`}>
                          {vencida ? '⚠️ ' : '📅 '}
                          {formatFecha(t.fecha_vencimiento)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none shrink-0"
                    title="Eliminar tarea"
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          })}

          {/* Completadas (colapsadas) */}
          {completadas.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 py-1">
                {completadas.length} tarea{completadas.length !== 1 ? 's' : ''} completada{completadas.length !== 1 ? 's' : ''}
              </summary>
              <div className="space-y-1 mt-2">
                {completadas.map(t => (
                  <div key={t.id} className="border border-gray-100 rounded-lg p-2.5 flex items-center gap-2 opacity-60">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleToggle(t)}
                      className="w-4 h-4 cursor-pointer accent-indigo-600"
                    />
                    <span className="text-sm text-gray-500 line-through">{t.titulo}</span>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="ml-auto text-gray-300 hover:text-red-400 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </section>
  )
}
