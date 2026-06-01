// EmpresasTable.jsx — Tabla principal con paginación.
// Muestra las empresas con su info clave y permite cambiar el estado inline
// sin tener que abrir el panel de detalle.

// Emojis de banderas para hacer más visual la tabla
const FLAGS = {
  'Argentina':   '🇦🇷',
  'España':      '🇪🇸',
  'México':      '🇲🇽',
  'Colombia':    '🇨🇴',
  'Chile':       '🇨🇱',
  'Perú':        '🇵🇪',
  'Uruguay':     '🇺🇾',
  'Brasil':      '🇧🇷',
  'Costa Rica':  '🇨🇷',
  'Panamá':      '🇵🇦',
}

// Colores para cada etapa del pipeline
const ESTADO_STYLES = {
  prospecto:        'bg-blue-100    text-blue-800',
  contactado:       'bg-indigo-100  text-indigo-800',
  reunion_agendada: 'bg-purple-100  text-purple-800',
  negociacion:      'bg-orange-100  text-orange-800',
  cerrado_ganado:   'bg-green-100   text-green-800',
  cerrado_perdido:  'bg-gray-100    text-gray-500',
}

const ESTADO_LABELS = {
  prospecto:        'Prospecto',
  contactado:       'Contactado',
  reunion_agendada: 'Reunión Agendada',
  negociacion:      'Negociación',
  cerrado_ganado:   'Cerrado ✓',
  cerrado_perdido:  'Perdido',
}

export default function EmpresasTable({
  empresas, loading, onSelect, onEstadoChange,
  currentPage, totalPages, totalResults, onPageChange,
}) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
        Cargando empresas...
      </div>
    )
  }

  if (empresas.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
        No se encontraron empresas con esos filtros.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Info de resultados */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {totalResults} empresa{totalResults !== 1 ? 's' : ''} encontrada{totalResults !== 1 ? 's' : ''}
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-gray-400">
            Página {currentPage} de {totalPages}
          </p>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase">Empresa</th>
              <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase">País</th>
              <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden md:table-cell">Industria</th>
              <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden lg:table-cell">Empleados</th>
              <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {empresas.map(empresa => (
              <tr
                key={empresa.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Nombre + linkedin */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-gray-900 leading-tight">{empresa.nombre}</p>
                      {empresa.linkedin_url && (
                        <a
                          href={empresa.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-xs text-indigo-500 hover:underline"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                    </div>
                  </div>
                </td>

                {/* País con bandera */}
                <td className="px-4 py-3 text-gray-700">
                  <span className="mr-1">{FLAGS[empresa.pais] || ''}</span>
                  {empresa.pais}
                </td>

                {/* Industria (solo en pantallas medianas+) */}
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs">
                  <span className="truncate block" title={empresa.industria}>
                    {empresa.industria || '—'}
                  </span>
                </td>

                {/* Empleados (solo en pantallas grandes) */}
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                  {empresa.cantidad_empleados ? `${empresa.cantidad_empleados}` : '—'}
                </td>

                {/* Estado — dropdown inline para cambiar rápido */}
                <td className="px-4 py-3">
                  <select
                    value={empresa.estado}
                    onChange={e => {
                      e.stopPropagation()
                      onEstadoChange(empresa, e.target.value)
                    }}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ESTADO_STYLES[empresa.estado]}`}
                  >
                    <option value="prospecto">Prospecto</option>
                    <option value="contactado">Contactado</option>
                    <option value="reunion_agendada">Reunión Agendada</option>
                    <option value="negociacion">Negociación</option>
                    <option value="cerrado_ganado">Cerrado ✓</option>
                    <option value="cerrado_perdido">Perdido</option>
                  </select>
                </td>

                {/* Botón de detalle */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => onSelect(empresa)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
                  >
                    Ver →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => onPageChange(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300 font-medium"
          >
            ← Anterior
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded text-sm font-medium ${
                  page === currentPage
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300 font-medium"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
