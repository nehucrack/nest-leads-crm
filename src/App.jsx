// App.jsx — Componente raíz.
// Acá vive todo el estado global de la app: qué empresas se muestran,
// qué filtros están activos, qué empresa está seleccionada para ver el detalle.
// Los componentes hijos reciben datos y callbacks como props.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import FilterBar from './components/FilterBar'
import EmpresasTable from './components/EmpresasTable'
import EmpresaDetail from './components/EmpresaDetail'

export default function App() {
  // Estado de los datos
  const [empresas, setEmpresas] = useState([])
  const [allPaises, setAllPaises] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pendiente: 0, calificada: 0, descartada: 0 })

  // Estado de filtros
  const [search, setSearch] = useState('')
  const [filterPais, setFilterPais] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  // Panel de detalle
  const [selectedEmpresa, setSelectedEmpresa] = useState(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const PER_PAGE = 25

  // Cargamos la lista de países al inicio (sin filtros) para los dropdowns
  useEffect(() => {
    supabase.from('empresas').select('pais').then(({ data }) => {
      if (data) {
        const unique = [...new Set(data.map(e => e.pais).filter(Boolean))].sort()
        setAllPaises(unique)
      }
    })
  }, [])

  // Stats: siempre sobre el total, sin filtros
  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from('empresas').select('estado')
    if (data) {
      const counts = data.reduce((acc, e) => {
        acc[e.estado] = (acc[e.estado] || 0) + 1
        return acc
      }, {})
      setStats({
        total: data.length,
        pendiente: counts.pendiente || 0,
        calificada: counts.calificada || 0,
        descartada: counts.descartada || 0,
      })
    }
  }, [])

  // Empresas: aplica filtros
  const fetchEmpresas = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false })

    if (search)       query = query.ilike('nombre', `%${search}%`)
    if (filterPais)   query = query.eq('pais', filterPais)
    if (filterEstado) query = query.eq('estado', filterEstado)

    const { data, error } = await query
    if (!error) setEmpresas(data || [])
    setLoading(false)
  }, [search, filterPais, filterEstado])

  useEffect(() => { fetchEmpresas() }, [fetchEmpresas])
  useEffect(() => { fetchStats() }, [fetchStats])

  // Reseteamos a la primera página cuando cambian los filtros
  useEffect(() => { setCurrentPage(1) }, [search, filterPais, filterEstado])

  // Cambia el estado de una empresa (pendiente / calificada / descartada)
  const handleEstadoChange = async (empresa, nuevoEstado) => {
    const { error } = await supabase
      .from('empresas')
      .update({ estado: nuevoEstado })
      .eq('id', empresa.id)

    if (!error) {
      // Actualizamos localmente para evitar recargar todo
      setEmpresas(prev =>
        prev.map(e => e.id === empresa.id ? { ...e, estado: nuevoEstado } : e)
      )
      // Si el panel de detalle está abierto para esta empresa, actualizamos también ahí
      if (selectedEmpresa?.id === empresa.id) {
        setSelectedEmpresa(prev => ({ ...prev, estado: nuevoEstado }))
      }
      fetchStats()
    }
  }

  // Paginación
  const totalPages = Math.ceil(empresas.length / PER_PAGE)
  const paginatedEmpresas = empresas.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <StatsBar stats={stats} />

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
      </main>

      {/* Panel lateral de detalle */}
      {selectedEmpresa && (
        <EmpresaDetail
          empresa={selectedEmpresa}
          onClose={() => setSelectedEmpresa(null)}
          onEstadoChange={handleEstadoChange}
          onUpdate={() => { fetchEmpresas(); fetchStats() }}
        />
      )}
    </div>
  )
}
