// Este archivo crea el cliente de Supabase que usamos en toda la app.
// Las credenciales vienen de las variables de entorno (.env.local)
// para no hardcodearlas en el código.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Falta configurar las variables de entorno de Supabase. Revisá .env.local')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
