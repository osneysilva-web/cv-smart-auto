import { createClient } from '@supabase/supabase-js';

// URL derivada do token fornecido (project ref: eanstwcksthsiekqnuga)
const supabaseUrl = 'https://eanstwcksthsiekqnuga.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbnN0d2Nrc3Roc2lla3FudWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NjQzNjIsImV4cCI6MjA4MTA0MDM2Mn0.IvFxTnsnDzPr6N92S_LnDW1ChnJzs1-Ee90J27g340A';

export const supabase = createClient(supabaseUrl, supabaseKey);