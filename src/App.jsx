// App.jsx — Componente raíz v2.0
// Nuevas features: Kanban pipeline, timeline de actividades, tareas con vencimiento.
// Tres vistas: Lista (tabla) | Pipeline (Kanban) | Tareas (dashboard global)

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { STAGES } from './lib/pipeline'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import FilterBar from './components/FilterBar'
import EmpresasTable from './components/EmpresasTable'
import KanbanBoard from './components/KanbanBoard'
import TareasDashboard from './components/TareasDashboard'
import EmpresaDetail from './components/EmpresaDetail'

export default function App() {
  // Vista activa: 'lista' | 'pipeline' | 'tareas'
  const [view, setView] = useState('lista')

  // Datos
  const [empresas, setEmpresas]   = useState([])
  const [allPaises, setAllPaises] = useState([])
  const [tareas, setTareas]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [stats, setStats]         = useState({})

  // Filtros (solo aplican en vista lista)
  const [search, setSearch]           = useState('')
  const [filterPais, setFilterPais]   = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  // Panel de detalle
  const [selectedEmpresa, setSelectedEmpresa] = useState(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const PER_PAGE = 25

  // Países únicos para el filtro
  useEffect(() => {
    supabase.from('empresas').select('pais').then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map(e => e.pais).filter(Boolean))].sort()
        setAllPaises(unique)
      }
    })
  }, [])

  // Stats del pipeline
  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from('empresas').select('estado')
    if (data) {
      const counts = data.reduce((acc, e) => {
        acc[e.estado] = (acc[e.estado] || 0) + 1
        return acc
      }, {})
      setStats({ total: data.length, ...counts })
    }
  }, [])

  // Empresas con filtros
  const fetchEmpresas = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('empresas').select('*').order('created_at', { ascending: false })
    if (search)       query = query.ilike('nombre', `%${search}%`)
    if (filterPais)   query = query.eq('pais', filterPais)
    if (filterEstado) query = query.eq('estado', filterEstado)
    const { data, error } = await query
    if (!error) setEmpresas(data || [])
    setLoading(false)
  }, [search, filterPais, filterEstado])

  // Tareas globales (para el dashboard)
  const fetchTareas = useCallback(async () => {
    const { data } = await supabase
      .from('tareas')
      .select('*, empresas(nombre)')
      .eq('completada', false)
      .order('fecha_vencimiento', { ascending: true, nullsFirst: false })
    if (data) {
      setTareas(data.map(t => ({ ...t, empresa_nombre: t.empresas?.nombre })))
    }
  }, [])

  useEffect(() => { fetchEmpresas() }, [fetchEmpresas])
  useEffect(() => { fetchStats()   }, [fetchStats])
  useEffect(() => { fetchTareas()  }, [fetchTareas])
  useEffect(() => { setCurrentPage(1) }, [search, filterPais, filterEstado])

  // Cambio de estado / etapa del pipeline
  const handleEstadoChange = async (empresa, nuevoEstado) => {
    const { error } = await supabase
      .from('empresas').update({ estado: nuevoEstado }).eq('id', empresa.id)
    if (!error) {
      setEmpresas(prev => prev.map(e => e.id === empresa.id ? { ...e, estado: nuevoEstado } : e))
      if (selectedEmpresa?.id === empresa.id) {
        setSelectedEmpresa(prev => ({ ...prev, estado: nuevoEstado }))
      }
      fetchStats()
    }
  }

  // Cuando hacemos click en una empresa desde el dashboard de tareas
  const handleSelectFromTareas = async (tarea) => {
    // Buscamos la empresa completa
    const { data } = await supabase.from('empresas').select('*').eq('id', tarea.empresa_id).single()
    if (data) {
      setSelectedEmpresa(data)
      setView('lista') // volvemos a la vista principal para que se vea bien el panel
    }
  }

  // Paginación
  const totalPages = Math.ceil(empresas.length / PER_PAGE)
  const paginatedEmpresas = empresas.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const tareasVencidas = tareas.filter(t => t.fecha_vencimiento && new Date(t.fecha_vencimiento) < new Date(new Date().toDateString())).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* Navegación entre vistas */}
        <div className="flex items-center justify-between">
          <nav className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {[
              { key: 'lista',    label: '☰ Lista' },
              { key: 'pipeline', label: '🗂 Pipeline' },
              { key: 'tareas',   label: '✅ Tareas' + (tareasVencidas > 0 ? ` (${tareasVencidas}⚠️)` : '') },
            ].map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === v.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {v.label}
              </button>
            ))}
          </nav>

          <p className="text-sm text-gray-400 hidden sm:block">
            {empresas.length} empresa{empresas.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats (siempre visibles) */}
        <StatsBar stats={stats} />

        {/* VISTA: Lista + filtros */}
        {view === 'lista' && (
          <>
            <FilterBar
              search={search}            setSearch={setSearch}
              filterPais={filterPais}    setFilterPais={setFilterPais}
              filterEstado={filterEstado} setFilterEstado={setFilterEstado}
              paises={allPaises}
            />
            <EmpresasTable
              empresas={paginatedEmpresas}
              loading={loading}
              onSelect={setSelectedEmpresa}
              onEstadoChange={handleEstadoChange}
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={empresas.length}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* VISTA: Pipeline Kanban */}
        {view === 'pipeline' && (
          <KanbanBoard
            empresas={empresas}
            onEstadoChange={handleEstadoChange}
            onSelect={setSelectedEmpresa}
          />
        )}

        {/* VISTA: Tareas */}
        {view === 'tareas' && (
          <TareasDashboard
            tareas={tareas}
            onRefresh={fetchTareas}
            onSelectEmpresa={handleSelectFromTareas}
          />
        )}

      </main>

      {/* Panel lateral de detalle */}
      {selectedEmpresa && (
        <EmpresaDetail
          empresa={selectedEmpresa}
          onClose={() => setSelectedEmpresa(null)}
          onEstadoChange={handleEstadoChange}
          onUpdate={() => { fetchEmpresas(); fetchStats(); fetchTareas() }}
        />
      )}
    </div>
  )
}
