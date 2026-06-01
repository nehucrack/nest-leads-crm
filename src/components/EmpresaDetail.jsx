// EmpresaDetail.jsx — Panel lateral deslizante (versión 2.0).
// Agregado: etapas del pipeline, timeline de actividades y panel de tareas.

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { STAGES, STAGE_MAP } from '../lib/pipeline'
import ContactoForm from './ContactoForm'
import ActividadTimeline from './ActividadTimeline'
import TareasPanel from './TareasPanel'

const CONTACTO_ESTADO_STYLES = {
  no_contactado:    'bg-gray-100    text-gray-600',
  contactado:       'bg-blue-100    text-blue-700',
  respondio:        'bg-purple-100  text-purple-700',
  reunion_agendada: 'bg-green-100   text-green-700',
  descartado:       'bg-red-100     text-red-600',
}

export default function EmpresaDetail({ empresa, onClose, onEstadoChange, onUpdate }) {
  const [contactos, setContactos]       = useState([])
  const [actividades, setActividades]   = useState([])
  const [tareas, setTareas]             = useState([])
  const [loadingData, setLoadingData]   = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [localEstado, setLocalEstado]   = useState(empresa.estado)
  const [activeTab, setActiveTab]       = useState('info') // 'info' | 'actividad' | 'tareas'

  const fetchAll = async () => {
    setLoadingData(true)
    const [cRes, aRes, tRes] = await Promise.all([
      supabase.from('contactos').select('*').eq('empresa_id', empresa.id).order('created_at', { ascending: false }),
      supabase.from('actividades').select('*').eq('empresa_id', empresa.id).order('fecha', { ascending: false }),
      supabase.from('tareas').select('*').eq('empresa_id', empresa.id).order('created_at', { ascending: false }),
    ])
    setContactos(cRes.data || [])
    setActividades(aRes.data || [])
    setTareas(tRes.data || [])
    setLoadingData(false)
  }

  useEffect(() => {
    fetchAll()
    setLocalEstado(empresa.estado)
    setActiveTab('info')
  }, [empresa.id])

  const handleEstadoChange = async (nuevoEstado) => {
    setLocalEstado(nuevoEstado)
    await onEstadoChange(empresa, nuevoEstado)
  }

  const handleContactoEstado = async (contactoId, nuevoEstado) => {
    await supabase.from('contactos').update({ estado: nuevoEstado }).eq('id', contactoId)
    fetchAll()
  }

  const currentStage = STAGE_MAP[localEstado]

  // Tabs con contadores
  const tabs = [
    { key: 'info',     label: 'Info & Contactos', count: contactos.length },
    { key: 'actividad',label: 'Actividad',         count: actividades.length },
    { key: 'tareas',   label: 'Tareas',            count: tareas.filter(t => !t.completada).length },
  ]

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose} />

      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col slide-in">

        {/* Encabezado */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-xl font-bold text-gray-900 truncate">{empresa.nombre}</h2>
              <div className="flex items-center flex-wrap gap-3 mt-1.5">
                {empresa.linkedin_url && (
                  <a href={empresa.linkedin_url} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-indigo-600 hover:underline">LinkedIn ↗</a>
                )}
                {empresa.website && (
                  <a href={empresa.website} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-indigo-600 hover:underline">Website ↗</a>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none mt-1 shrink-0">
              &times;
            </button>
          </div>

          {/* Pipeline: etapas como botones */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Etapa del pipeline</p>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map(s => (
                <button
                  key={s.key}
                  onClick={() => handleEstadoChange(s.key)}
                  title={s.label}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    localEstado === s.key
                      ? s.badge + ' ring-2 ring-offset-1 ring-gray-400'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="flex gap-1 mt-4 border-b border-gray-100 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* TAB: Info & Contactos */}
          {activeTab === 'info' && (
            <>
              <section>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Información</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="País"      value={empresa.pais} />
                  <InfoItem label="Ciudad"    value={empresa.ciudad} />
                  <InfoItem label="Industria" value={empresa.industria} />
                  <InfoItem label="Empleados" value={empresa.cantidad_empleados} />
                  <InfoItem label="Fuente"    value={empresa.fuente} />
                </div>
              </section>

              {empresa.descripcion && (
                <section>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Descripción</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{empresa.descripcion}</p>
                </section>
              )}

              {/* Contactos */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Contactos ({contactos.length})
                  </p>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {showForm ? 'Cancelar' : '+ Agregar contacto'}
                  </button>
                </div>

                {showForm && (
                  <ContactoForm
                    empresaId={empresa.id}
                    onSaved={() => { setShowForm(false); fetchAll() }}
                    onCancel={() => setShowForm(false)}
                  />
                )}

                {loadingData ? (
                  <p className="text-sm text-gray-400 py-4 text-center">Cargando...</p>
                ) : contactos.length === 0 && !showForm ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-400">Sin contactos todavía.</p>
                    <p className="text-xs text-gray-400 mt-1">Agregá el CEO, CTO o Founder.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contactos.map(c => (
                      <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">{c.nombre} {c.apellido}</p>
                            {c.cargo && <p className="text-sm text-gray-500">{c.cargo}</p>}
                            <div className="flex flex-wrap gap-2 mt-1">
                              {c.email && (
                                <a href={`mailto:${c.email}`} className="text-xs text-indigo-600 hover:underline">{c.email}</a>
                              )}
                              {c.linkedin_url && (
                                <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                                   className="text-xs text-indigo-500 hover:underline">LinkedIn ↗</a>
                              )}
                            </div>
                          </div>
                          <select
                            value={c.estado}
                            onChange={e => handleContactoEstado(c.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer shrink-0 ${CONTACTO_ESTADO_STYLES[c.estado]}`}
                          >
                            <option value="no_contactado">no contactado</option>
                            <option value="contactado">contactado</option>
                            <option value="respondio">respondió</option>
                            <option value="reunion_agendada">reunión agendada</option>
                            <option value="descartado">descartado</option>
                          </select>
                        </div>
                        {c.notas && (
                          <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-100 pt-2">{c.notas}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* TAB: Actividad */}
          {activeTab === 'actividad' && (
            <ActividadTimeline
              empresaId={empresa.id}
              actividades={actividades}
              onRefresh={fetchAll}
            />
          )}

          {/* TAB: Tareas */}
          {activeTab === 'tareas' && (
            <TareasPanel
              empresaId={empresa.id}
              tareas={tareas}
              onRefresh={fetchAll}
            />
          )}

        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value}</p>
    </div>
  )
}
