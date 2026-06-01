// pipeline.js — Configuración central del pipeline de ventas.
// Todas las etapas, colores y helpers en un solo lugar.

export const STAGES = [
  {
    key:   'prospecto',
    label: 'Prospecto',
    emoji: '🔵',
    bg:    'bg-blue-50',
    border:'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    dot:   'bg-blue-400',
  },
  {
    key:   'contactado',
    label: 'Contactado',
    emoji: '📨',
    bg:    'bg-indigo-50',
    border:'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800',
    dot:   'bg-indigo-400',
  },
  {
    key:   'reunion_agendada',
    label: 'Reunión Agendada',
    emoji: '📅',
    bg:    'bg-purple-50',
    border:'border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    dot:   'bg-purple-400',
  },
  {
    key:   'negociacion',
    label: 'Negociación',
    emoji: '🤝',
    bg:    'bg-orange-50',
    border:'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    dot:   'bg-orange-400',
  },
  {
    key:   'cerrado_ganado',
    label: 'Cerrado ✓',
    emoji: '🏆',
    bg:    'bg-green-50',
    border:'border-green-200',
    badge: 'bg-green-100 text-green-800',
    dot:   'bg-green-500',
  },
  {
    key:   'cerrado_perdido',
    label: 'Perdido',
    emoji: '❌',
    bg:    'bg-gray-50',
    border:'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    dot:   'bg-gray-400',
  },
]

export const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.key, s]))

export const ACTIVITY_TYPES = [
  { key: 'nota',    label: 'Nota',    icon: '📝' },
  { key: 'email',   label: 'Email',   icon: '📧' },
  { key: 'llamada', label: 'Llamada', icon: '📞' },
  { key: 'mensaje', label: 'Mensaje', icon: '💬' },
  { key: 'reunion', label: 'Reunión', icon: '🤝' },
  { key: 'otro',    label: 'Otro',    icon: '📌' },
]

export const ACTIVITY_TYPE_MAP = Object.fromEntries(ACTIVITY_TYPES.map(t => [t.key, t]))

export const PRIORITY_STYLES = {
  alta:  { badge: 'bg-red-100 text-red-700',    label: '🔴 Alta'  },
  media: { badge: 'bg-yellow-100 text-yellow-700', label: '🟡 Media' },
  baja:  { badge: 'bg-gray-100 text-gray-600',  label: '⚪ Baja'  },
}
