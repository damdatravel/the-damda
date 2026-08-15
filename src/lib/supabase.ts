import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://hbgdanmcnslqvdqqxtkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ2Rhbm1jbnNscXZkcXF4dGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MTYyNjUsImV4cCI6MjA5ODI5MjI2NX0.eU4vsrX3aUZ0BZm2mT1LvBc9K7_4CQ60X1HvcOoHWcw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
