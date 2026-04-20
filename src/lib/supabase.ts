import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ─── Browser client (React components) ───────────────────────────────────────
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnon)

// ─── Server client (Server Actions / Route Handlers) ─────────────────────────
export function createServerSupabase() {
  const cookieStore: any = cookies()
  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll: () => (cookieStore.getAll ? cookieStore.getAll() : []),
      setAll: (cookiesToSet: any[]) => {
        cookiesToSet.forEach(({ name, value, options }: any) => {
          if (cookieStore.set) cookieStore.set(name, value, options)
        })
      },
    },
  })
}

// ─── Admin client (bypasses RLS — server only) ────────────────────────────────
export const supabaseAdmin = createClient(supabaseUrl, supabaseService, {
  auth: { autoRefreshToken: false, persistSession: false },
})
