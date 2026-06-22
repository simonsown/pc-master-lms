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

    const body = await request.json()
    const { recipients, title, message, type, link } = body

    if (!recipients || !recipients.length || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const notifications = recipients.map(userId => ({
      user_id: userId,
      type: type || 'info',
      title,
      message,
      link: link || null,
      is_read: false
    }))

    const { error: insertErr } = await supabase
      .from('notifications')
      .insert(notifications)

    if (insertErr) {
      return NextResponse.json({ error: 'Failed to create notifications', details: insertErr }, { status: 500 })
    }

    return NextResponse.json({ success: true, sentCount: notifications.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
