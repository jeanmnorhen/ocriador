import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Temporary dummy client for debugging
export function createClient() {
  console.log('Using dummy Supabase client for debugging.');
  return {
    auth: {
      getUser: async () => ({ data: { user: { id: 'dummy-user-id', email: 'dummy@example.com' } } }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ error: null }),
    },
    from: () => ({
      insert: () => ({ select: () => ({ single: () => ({ data: {}, error: null }) }) }),
      select: () => ({ eq: () => ({ single: () => ({ data: {}, error: null }), order: () => ({}) }) }),
    }),
  };
}
