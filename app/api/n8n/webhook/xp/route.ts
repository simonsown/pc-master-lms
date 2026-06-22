import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET || ''

function verifyN8nRequest(request: Request): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${N8N_SECRET}`
}

export async function POST(request: Request) {
  try {
    if (!verifyN8nRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, amount, reason, referenceType, referenceId } = await request.json()

    if (!userId || !amount || !reason) {
      return NextResponse.json({ error: 'Missing required fields: userId, amount, reason' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const numericAmount = Math.round(Number(amount))

    const { error: txErr } = await supabase.from('xp_transactions').insert({
      user_id: userId,
      amount: numericAmount,
      reason,
      reference_type: referenceType || null,
      reference_id: referenceId || null
    })

    if (txErr) {
      return NextResponse.json({ error: 'Failed to record XP transaction', details: txErr }, { status: 500 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level, full_name')
      .eq('id', userId)
      .single()

    if (profile) {
      const newXp = (profile.xp || 0) + numericAmount

      let newLevel = profile.level || 1
      const levels = [0, 100, 300, 600, 1000, 1600, 2400, 3400, 4600, 6000, 8000, 10000, 13000, 17000, 22000, 28000, 35000, 43000, 52000, 65000]

      for (let i = levels.length - 1; i >= 0; i--) {
        if (newXp >= levels[i]) {
          newLevel = i + 1
          break
        }
      }

      const leveledUp = newLevel > (profile.level || 1)

      await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('id', userId)

      await supabase.from('learning_stats').upsert({
        user_id: userId,
        total_xp: newXp,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

      if (leveledUp) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'success',
          title: `Len cap! Ban da dat cap do ${newLevel}!`,
          message: `Chuc mung! Ban vua thang cap len Level ${newLevel}!`,
          link: '/student'
        })

        const { data: levelDef } = await supabase
          .from('level_definitions')
          .select('title')
          .eq('level', newLevel)
          .single()

        if (levelDef) {
          const { data: existingTitle } = await supabase
            .from('user_titles')
            .select('id')
            .eq('user_id', userId)
            .eq('title_id', `level_${newLevel}`)
            .maybeSingle()

          if (!existingTitle) {
            await supabase.from('user_titles').insert({
              user_id: userId,
              title_id: `level_${newLevel}`,
              is_active: false
            })
          }
        }
      }

      const { data: leaderboard } = await supabase
        .from('leaderboard_cache')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (leaderboard) {
        await supabase.from('leaderboard_cache').update({
          total_xp: newXp,
          level: newLevel,
          updated_at: new Date().toISOString()
        }).eq('user_id', userId)
      } else {
        await supabase.from('leaderboard_cache').insert({
          user_id: userId,
          full_name: profile.full_name || '',
          level: newLevel,
          total_xp: newXp,
          updated_at: new Date().toISOString()
        })
      }
    }

    return NextResponse.json({ success: true, xpAwarded: numericAmount })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
