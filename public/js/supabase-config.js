// Supabase Configuration
// Default public fallback values (loaded dynamically from server .env when backend is running)
let SUPABASE_URL = 'https://jldnhqzjvfdysmvemdmv.supabase.co';
let SUPABASE_ANON_KEY = 'sb_publishable_o3RX1U7g9yAKTsUk9PDl5g_GjkpFyF8';

let supabaseClient;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Fetch configuration dynamically from Express server .env
  fetch('/api/config')
    .then(res => res.ok ? res.json() : null)
    .then(config => {
      if (config && config.supabaseUrl && config.supabaseAnonKey) {
        if (config.supabaseUrl !== SUPABASE_URL || config.supabaseAnonKey !== SUPABASE_ANON_KEY) {
          SUPABASE_URL = config.supabaseUrl;
          SUPABASE_ANON_KEY = config.supabaseAnonKey;
          supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
      }
    })
    .catch(() => {
      // Static host fallback
    });
}

