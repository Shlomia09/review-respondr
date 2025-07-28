import { createClient } from '@supabase/supabase-js';

// Lovable's Supabase integration will automatically provide the correct values
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '', 
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);