import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL atau Anon Key tidak ditemukan di environment variables!');
}

// Client Reguler: Untuk Sisi Klien (Aman, menggunakan Anon Key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client Admin: Khusus Sisi Server (Bypass RLS, menggunakan Service Role Key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
