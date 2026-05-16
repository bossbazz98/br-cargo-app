import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ohybaapjlbsxtiumdggb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oeWJhYXBqbGJzeHRpdW1kZ2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjE3MjgsImV4cCI6MjA5MzM5NzcyOH0.kbwIY5KfVMfSo_E6t5f3IBOB8JrpCAQfE-EUaZAU220';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
