import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project dashboard (Project Settings -> API)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan las variables de entorno de Supabase. Asegúrate de configurar .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
