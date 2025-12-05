import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Configure allowed origins here. This is a client-side safeguard
// to avoid accidental public usage from unknown sites. True security must be
// enforced server-side via Supabase RLS policies and CORS settings in the
// Supabase dashboard. Update this list with your deployed origins.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://yourdomain.com',
];

const SUPABASE_URL = 'https://yrhrylmkjfkwffxnsenx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_u5kQwUowTDuV_0OVIlHxKQ_Cw79VXVe';

let supabase = null;

if (typeof window !== 'undefined' && ALLOWED_ORIGINS.includes(window.location.origin)) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
} else {
  // If origin not allowed, warn in console and export safe stubs below.
  // This prevents accidental public initialization from unexpected domains.
  // Note: this is not a replacement for server-side CORS/RLS configuration.
  // Update ALLOWED_ORIGINS to include the actual domains that should be permitted.
  // If you intentionally run in an unknown origin, add it to the list above.
  // eslint-disable-next-line no-console
  console.warn('Supabase client not initialized because origin is not in ALLOWED_ORIGINS:', typeof window !== 'undefined' ? window.location.origin : 'unknown');
}

// Tasks table access helpers
export async function getTasks() {
  if (!supabase) throw new Error('Supabase not initialized: origin not allowed');
  const { data, error } = await supabase.from('tasks').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addTask(task) {
  if (!supabase) throw new Error('Supabase not initialized: origin not allowed');
  const { data, error } = await supabase.from('tasks').insert([task]).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id, updates) {
  if (!supabase) throw new Error('Supabase not initialized: origin not allowed');
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id) {
  if (!supabase) throw new Error('Supabase not initialized: origin not allowed');
  const { data, error } = await supabase.from('tasks').delete().eq('id', id).select();
  if (error) throw error;
  return data;
}

export { supabase };
