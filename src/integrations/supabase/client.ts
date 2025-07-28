import { createClient } from '@supabase/supabase-js';

// Debug: Check environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please ensure your Supabase integration is properly connected in Lovable.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);