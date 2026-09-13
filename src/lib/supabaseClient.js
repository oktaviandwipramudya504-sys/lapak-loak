import { createClient } from '@supabase/supabase-js';

// Isi dua nilai ini dari project Supabase kamu (Settings > API).
// Simpan sebagai environment variable, jangan ditulis langsung di kode ini.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
