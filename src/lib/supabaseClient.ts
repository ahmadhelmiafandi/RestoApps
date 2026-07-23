import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gouslmjzximwuxtqpibs.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXNsbWp6eGltd3V4dHFwaWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NzMzODksImV4cCI6MjEwMDA0OTM4OX0.uFherPRRQMlsOYjbQMnegrU03Avo0wjZkAP9Di0YcNk';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdXNsbWp6eGltd3V4dHFwaWJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ3MzM4OSwiZXhwIjoyMTAwMDQ5Mzg5fQ.ymmXrc-wvDea3nUnECoXiT__iv32UX7x_zVkBQF0wEA';

// Client Reguler: Untuk Sisi Klien (Aman, menggunakan Anon Key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client Admin: Khusus Sisi Server (Bypass RLS, menggunakan Service Role Key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

