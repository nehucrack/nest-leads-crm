// Header.jsx — Barra de navegación superior.
// Simple y limpia: logo/nombre del producto + descripción breve.

export default function Header() {
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Nest Leads CRM</h1>
            <p className="text-gray-400 text-xs">Base de datos de empresas objetivo</p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          LATAM + España
        </div>
      </div>
    </header>
  )
}
