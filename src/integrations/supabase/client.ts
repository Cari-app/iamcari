import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kjxtihzksqmrbatezecq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeHRpaHprc3FtcmJhdGV6ZWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTAzOTQsImV4cCI6MjA3OTg2NjM5NH0.lgaxB0DYfXB-hByBfeNJ1pf5VdXgkONjV0WXugOIPMg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
