// ContactoForm.jsx — Formulario para agregar un nuevo contacto a una empresa.
// Guarda directamente en la tabla `contactos` de Supabase.
// Los campos obligatorios mínimos son nombre y cargo.

import { useState } from 'react'
import { supabase } from '../lib/supabase'

const CARGOS_SUGERIDOS = [
  'CTO', 'CEO', 'Founder', 'Co-Founder',
  'Head of Engineering', 'Head of Product',
  'Tech Lead', 'VP of Engineering', 'Director de Tecnología',
]

export default function ContactoForm({ empresaId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    cargo: '',
    email: '',
    linkedin_url: '',
    notas: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    setSaving(true)
    setError('')

    const { error: dbError } = await supabase
      .from('contactos')
      .insert({
        empresa_id:   empresaId,
        nombre:       form.nombre.trim(),
        apellido:     form.apellido.trim() || null,
        cargo:        form.cargo.trim() || null,
        email:        form.email.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        notas:        form.notas.trim() || null,
        estado:       'no_contactado',
      })

    setSaving(false)

    if (dbError) {
      setError('Error al guardar: ' + dbError.message)
    } else {
      onSaved()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-indigo-200 bg-indigo-50 rounded-lg p-4 mb-4 space-y-3">
      <p className="text-sm font-semibold text-indigo-800">Nuevo contacto</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Nombre */}
        <div>
          <label className="text-xs text-gray-600 font-medium">Nombre *</label>
          <input
            type="text"
            value={form.nombre}
            onChange={e => handleChange('nombre', e.target.value)}
            placeholder="Juan"
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Apellido */}
        <div>
          <label className="text-xs text-gray-600 font-medium">Apellido</label>
          <input
            type="text"
            value={form.apellido}
            onChange={e => handleChange('apellido', e.target.value)}
            placeholder="Pérez"
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Cargo — con sugerencias */}
      <div>
        <label className="text-xs text-gray-600 font-medium">Cargo</label>
        <input
          type="text"
          value={form.cargo}
          onChange={e => handleChange('cargo', e.target.value)}
          placeholder="CTO, CEO, Founder..."
          list="cargos-list"
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <datalist id="cargos-list">
          {CARGOS_SUGERIDOS.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      {/* Email */}
      <div>
        <label className="text-xs text-gray-600 font-medium">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => handleChange('email', e.target.value)}
          placeholder="juan@empresa.com"
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* LinkedIn URL */}
      <div>
        <label className="text-xs text-gray-600 font-medium">LinkedIn URL</label>
        <input
          type="url"
          value={form.linkedin_url}
          onChange={e => handleChange('linkedin_url', e.target.value)}
          placeholder="https://linkedin.com/in/..."
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Notas */}
      <div>
        <label className="text-xs text-gray-600 font-medium">Notas</label>
        <textarea
          value={form.notas}
          onChange={e => handleChange('notas', e.target.value)}
          placeholder="Ej: Le mandé DM por LinkedIn el 15/5..."
          rows={2}
          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar contacto'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
