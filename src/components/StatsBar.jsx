// StatsBar.jsx — Cuatro tarjetas con métricas clave del pipeline.
// Los colores reflejan el significado de cada estado:
//   total → azul neutro, pendiente → amarillo, calificada → verde, descartada → gris

const CARDS = [
  { key: 'total',      label: 'Total',       bg: 'bg-indigo-50',  text: 'text-indigo-700', border: 'border-indigo-200' },
  { key: 'pendiente',  label: 'Pendientes',  bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200' },
  { key: 'calificada', label: 'Calificadas', bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200' },
  { key: 'descartada', label: 'Descartadas', bg: 'bg-gray-50',    text: 'text-gray-500',   border: 'border-gray-200' },
]

export default function StatsBar({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {CARDS.map(({ key, label, bg, text, border }) => (
        <div key={key} className={`${bg} border ${border} rounded-xl p-4`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${text}`}>{stats[key]}</p>
        </div>
      ))}
    </div>
  )
}
