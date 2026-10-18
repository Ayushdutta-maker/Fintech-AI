import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xivyidcovjckojhvxxyw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bA21n8WTnjmuBxyqcqT2OQ_2VGzvBYG';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
