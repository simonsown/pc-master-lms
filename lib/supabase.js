import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Dùng Browser Client để đồng bộ hoàn toàn với Middleware (Cookies)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
