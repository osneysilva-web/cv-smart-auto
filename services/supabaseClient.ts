
import { createClient } from '@supabase/supabase-js';

// Credenciais oficiais fornecidas pelo utilizador
const supabaseUrl = 'https://eanstwcksthsiekqnuga.supabase.co';
const supabaseKey = 'sb_publishable_tBvZl95TmT6JuuE0Pfh3EA_4xrSwZWA';

export const supabase = createClient(supabaseUrl, supabaseKey);
