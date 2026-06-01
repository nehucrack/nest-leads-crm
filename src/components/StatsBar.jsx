// StatsBar.jsx — Métricas del pipeline en 4 cards clave.
// Total, activos en proceso, cerraron ganados, y perdidos.

export default function StatsBar({ stats }) {
  const total    = stats.total || 0
  const ganados  = stats.cerrado_ganado  || 0
  const perdidos = stats.cerrado_perdido || 0
  const enProceso = (stats.contactado || 0) + (stats.reunion_agendada || 0) + (stats.negociacion || 0)
  const prospectos = stats.prospecto || 0

  const cards = [
    { label: 'Total leads',    value: total,       bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
    { label: 'Prospectos',     value: prospectos,  bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'   },
    { label: 'En proceso',     value: enProceso,   bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
    { label: 'Cerrados ✓',    value: ganados,     bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200'  },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ label, value, bg, text, border }) => (
        <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${text}`}>{value ?? 0}</p>
        </div>
      ))}
    </div>
  )
}
