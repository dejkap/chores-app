import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrhrylmkjfkwffxnsenx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_u5kQwUowTDuV_0OVIlHxKQ_Cw79VXVe';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// Tasks table access helpers
export async function getTasks() {
  const { data, error } = await supabase.from('tasks').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addTask(task) {
  // Expecting task to be an object { name, description, priority, done, date }
  const { data, error } = await supabase.from('tasks').insert([task]).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id) {
  const { data, error } = await supabase.from('tasks').delete().eq('id', id).select();
  if (error) throw error;
  return data;
}
