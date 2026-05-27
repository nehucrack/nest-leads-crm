// EmpresaDetail.jsx — Panel lateral deslizante.
// Se abre desde la tabla al hacer click en "Ver →".
// Muestra toda la información de la empresa + sus contactos,
// y permite agregar nuevos contactos (CTOs, Founders, etc.)

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ContactoForm from './ContactoForm'

// Colores para el estado de la empresa
const EMPRESA_ESTADO_STYLES = {
  pendiente:  'bg-yellow-100 text-yellow-800',
  calificada: 'bg-green-100  text-green-800',
  descartada: 'bg-gray-100   text-gray-500',
}

// Colores para el estado de cada contacto
const CONTACTO_ESTADO_STYLES = {
  no_contactado:    'bg-gray-100    text-gray-600',
  contactado:       'bg-blue-100    text-blue-700',
  respondio:        'bg-purple-100  text-purple-700',
  reunion_agendada: 'bg-green-100   text-green-700',
  descartado:       'bg-red-100     text-red-600',
}

export default function EmpresaDetail({ empresa, onClose, onEstadoChange, onUpdate }) {
  const [contactos, setContactos] = useState([])
  const [loadingContactos, setLoadingContactos] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [localEstado, setLocalEstado] = useState(empresa.estado)

  const fetchContactos = async () => {
    setLoadingContactos(true)
    const { data } = await supabase
      .from('contactos')
      .select('*')
      .eq('empresa_id', empresa.id)
      .order('created_at', { ascending: false })
    setContactos(data || [])
    setLoadingContactos(false)
  }

  useEffect(() => {
    fetchContactos()
    setLocalEstado(empresa.estado)
  }, [empresa.id])

  const handleEstadoChange = async (nuevoEstado) => {
    setLocalEstado(nuevoEstado)
    await onEstadoChange(empresa, nuevoEstado)
  }

  const handleContactoSaved = () => {
    setShowForm(false)
    fetchContactos()
  }

  const handleContactoEstado = async (contactoId, nuevoEstado) => {
    await supabase
      .from('contactos')
      .update({ estado: nuevoEstado })
      .eq('id', contactoId)
    fetchContactos()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop — click fuera cierra el panel */}
      <div
        className="flex-1 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel deslizante */}
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col slide-in">
        {/* Encabezado del panel */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-gray-900 truncate">{empresa.nombre}</h2>
            <div className="flex items-center flex-wrap gap-3 mt-2">
              {empresa.linkedin_url && (
                <a href={empresa.linkedin_url} target="_blank" rel="noopener noreferrer"
                   className="text-sm text-indigo-600 hover:underline">
                  LinkedIn ↗
                </a>
              )}
              {empresa.website && (
                <a href={empresa.website} target="_blank" rel="noopener noreferrer"
                   className="text-sm text-indigo-600 hover:underline">
                  Website ↗
                </a>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none mt-1 shrink-0"
          >
            &times;
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Info de la empresa */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Información
            </p>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="País"       value={empresa.pais} />
              <InfoItem label="Ciudad"     value={empresa.ciudad} />
              <InfoItem label="Industria"  value={empresa.industria} />
              <InfoItem label="Empleados"  value={empresa.cantidad_empleados} />
              <InfoItem label="Fuente"     value={empresa.fuente} />
            </div>
          </section>

          {/* Estado del lead */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Estado del lead
            </p>
            <div className="flex gap-2">
              {['pendiente', 'calificada', 'descartada'].map(est => (
                <button
                  key={est}
                  onClick={() => handleEstadoChange(est)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    localEstado === est
                      ? EMPRESA_ESTADO_STYLES[est] + ' ring-2 ring-offset-1 ring-gray-400'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>
          </section>

          {/* Descripción */}
          {empresa.descripcion && (
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Descripción
              </p>
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

            {/* Formulario para agregar contacto */}
            {showForm && (
              <ContactoForm
                empresaId={empresa.id}
                onSaved={handleContactoSaved}
                onCancel={() => setShowForm(false)}
              />
            )}

            {/* Lista de contactos */}
            {loadingContactos ? (
              <p className="text-sm text-gray-400 py-4 text-center">Cargando contactos...</p>
            ) : contactos.length === 0 && !showForm ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-400">Sin contactos todavía.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Agregá el CTO, Founder o Head of Engineering.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {contactos.map(c => (
                  <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {c.nombre} {c.apellido}
                        </p>
                        {c.cargo && (
                          <p className="text-sm text-gray-500">{c.cargo}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="text-xs text-indigo-600 hover:underline">
                              {c.email}
                            </a>
                          )}
                          {c.linkedin_url && (
                            <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                               className="text-xs text-indigo-500 hover:underline">
                              LinkedIn ↗
                            </a>
                          )}
                        </div>
                      </div>
                      {/* Cambio de estado del contacto */}
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
                      <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-100 pt-2">
                        {c.notas}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

// Componente pequeño para mostrar un par label/value
function InfoItem({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value}</p>
    </div>
  )
}
