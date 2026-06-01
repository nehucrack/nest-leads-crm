// FilterBar.jsx — Barra de búsqueda y filtros.
// Cada cambio dispara una nueva query a Supabase gracias al useEffect en App.jsx.
// Los props de "set..." son las funciones que actualizan el estado en el padre.

export default function FilterBar({
  search, setSearch,
  filterPais, setFilterPais,
  filterEstado, setFilterEstado,
  paises,
}) {
  const handleReset = () => {
    setSearch('')
    setFilterPais('')
    setFilterEstado('')
  }

  const hayFiltros = search || filterPais || filterEstado

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda por nombre */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Filtro por país */}
        <select
          value={filterPais}
          onChange={e => setFilterPais(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Todos los países</option>
          {paises.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Filtro por etapa del pipeline */}
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Todas las etapas</option>
          <option value="prospecto">🔵 Prospecto</option>
          <option value="contactado">📨 Contactado</option>
          <option value="reunion_agendada">📅 Reunión Agendada</option>
          <option value="negociacion">🤝 Negociación</option>
          <option value="cerrado_ganado">🏆 Cerrado ✓</option>
          <option value="cerrado_perdido">❌ Perdido</option>
        </select>

        {/* Botón limpiar filtros (solo aparece si hay algo activo) */}
        {hayFiltros && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
