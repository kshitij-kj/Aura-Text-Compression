
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fajnwfxmgggpkettgkvm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZham53ZnhtZ2dncGtldHRna3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODM5NzUsImV4cCI6MjA1OTg1OTk3NX0.oGmwTLMz2UVKBDRGIJBACfh6kBsI6nRRvQIQc8HFE9E";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Enable realtime for compression_history table
(async () => {
  await supabase
    .channel('custom-all-channel')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'compression_history'
    }, payload => {
      console.log('Change received!', payload)
    })
    .subscribe();
})();
