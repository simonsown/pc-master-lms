import { createClient } from './supabase-ssr-client'

export function createClientComponentClient() {
  return createClient()
}
