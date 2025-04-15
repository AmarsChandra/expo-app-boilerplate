import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseService = {
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getSession: async () => {
    return await supabase.auth.getSession();
  },
}; 