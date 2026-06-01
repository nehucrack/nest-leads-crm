// KanbanBoard.jsx — Tablero Kanban con 6 columnas (etapas del pipeline).
// Usa HTML5 drag & drop nativo — sin librerías externas.
// Cada columna = una etapa. Cada tarjeta = una empresa.
// Arrastrar una tarjeta a otra columna actualiza el estado en Supabase.

import { useState, useRef } from 'react'
import { STAGES, STAGE_MAP } from '../lib/pipeline'

const FLAGS = {
  Argentina: '🇦🇷', España: '🇪🇸', México: '🇲🇽', Colombia: '🇨🇴',
  Chile: '🇨🇱', Perú: '🇵🇪', Uruguay: '🇺🇾', Brasil: '🇧🇷',
}

export default function KanbanBoard({ empresas, onEstadoChange, onSelect }) {
  // Columna que está siendo hover durante un drag
  const [dragOverStage, setDragOverStage] = useState(null)
  const dragItem = useRef(null)

  // Agrupa las empresas por etapa
  const byStage = STAGES.reduce((acc, s) => {
    acc[s.key] = empresas.filter(e => e.estado === s.key)
    return acc
  }, {})

  const handleDragStart = (e, empresa) => {
    dragItem.current = empresa
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, stageKey) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageKey)
  }

  const handleDrop = (e, stageKey) => {
    e.preventDefault()
    setDragOverStage(null)
    if (dragItem.current && dragItem.current.estado !== stageKey) {
      onEstadoChange(dragItem.current, stageKey)
    }
    dragItem.current = null
  }

  const handleDragEnd = () => {
    setDragOverStage(null)
    dragItem.current = null
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
      {STAGES.map(stage => {
        const cards = byStage[stage.key] || []
        const isOver = dragOverStage === stage.key

        return (
          <div
            key={stage.key}
            className="flex flex-col flex-shrink-0 w-64"
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDrop={(e) => handleDrop(e, stage.key)}
            onDragLeave={() => setDragOverStage(null)}
          >
            {/* Encabezado de columna */}
            <div className={`rounded-t-xl px-3 py-2.5 border-t border-x ${stage.border} ${stage.bg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{stage.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700">{stage.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>
                  {cards.length}
                </span>
              </div>
            </div>

            {/* Zona de drop */}
            <div
              className={`flex-1 rounded-b-xl border ${stage.border} p-2 space-y-2 transition-colors ${
                isOver ? stage.bg + ' ring-2 ring-inset ' + stage.border : 'bg-white'
              }`}
            >
              {cards.length === 0 && (
                <div className={`h-16 rounded-lg border-2 border-dashed ${stage.border} flex items-center justify-center`}>
                  <p className="text-xs text-gray-400">Soltar aquí</p>
                </div>
              )}

              {cards.map(empresa => (
                <KanbanCard
                  key={empresa.id}
                  empresa={empresa}
                  stage={stage}
                  onSelect={onSelect}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function KanbanCard({ empresa, stage, onSelect, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, empresa)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(empresa)}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300 transition-all group select-none"
    >
      {/* Nombre */}
      <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors">
        {empresa.nombre}
      </p>

      {/* País + industria */}
      <div className="flex items-center gap-1 mt-1.5">
        <span className="text-xs">{FLAGS[empresa.pais] || '🌐'}</span>
        <span className="text-xs text-gray-500 truncate">{empresa.pais}</span>
      </div>

      {empresa.industria && (
        <p className="text-xs text-gray-400 mt-0.5 truncate">{empresa.industria}</p>
      )}

      {/* Empleados */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          👥 {empresa.cantidad_empleados ?? '—'}
        </span>
        <span className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          Ver →
        </span>
      </div>
    </div>
  )
}
