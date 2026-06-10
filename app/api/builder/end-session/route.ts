import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { sessionId, components, tdp, compatibilityScore, completed } = body
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const { error } = await supabase
    .from('builder_sessions')
    .update({ components_used: components || {}, tdp_total: tdp ?? null, compatibility_score: compatibilityScore ?? 0, completed_build: !!completed, ended_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
