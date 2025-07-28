import { createClient } from '@supabase/supabase-js';

// Using Lovable's Supabase integration - these will be automatically provided
const supabaseUrl = 'https://your-project.supabase.co'; // This will be replaced by Lovable's integration
const supabaseAnonKey = 'your-anon-key'; // This will be replaced by Lovable's integration

export const supabase = createClient(supabaseUrl, supabaseAnonKey);