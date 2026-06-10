import { createClient } from '@/lib/supabase-ssr-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const userId = searchParams.get('userId')
  const publicOnly = searchParams.get('public') === 'true'

  if (id) {
    const { data, error } = await supabase
      .from('saved_builds')
      .select('*, cpu:products!cpu_id(*), gpu:products!gpu_id(*), mainboard:products!mainboard_id(*), psu:products!psu_id(*), case:products!case_id(*), cooler:products!cooler_id(*)')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ build: data })
  }

  let query = supabase
    .from('saved_builds')
    .select('id, name, compatibility_score, total_tdp, total_price, created_at, user_id')

  if (publicOnly) {
    query = query.eq('is_public', true)
  } else if (userId) {
    query = query.eq('user_id', userId)
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) query = query.eq('user_id', user.id)
    else return NextResponse.json({ builds: [] })
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ builds: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('saved_builds')
    .upsert({
      user_id: user.id,
      name: body.name || 'Build mới',
      cpu_id: body.cpu_id || null,
      gpu_id: body.gpu_id || null,
      mainboard_id: body.mainboard_id || null,
      ram_ids: body.ram_ids || [],
      psu_id: body.psu_id || null,
      case_id: body.case_id || null,
      cooler_id: body.cooler_id || null,
      ssd_ids: body.ssd_ids || [],
      compatibility_score: body.compatibility_score || 0,
      total_tdp: body.total_tdp || 0,
      total_price: body.total_price || 0,
      is_public: body.is_public || false,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('saved_builds')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
