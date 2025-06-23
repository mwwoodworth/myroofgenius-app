import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
