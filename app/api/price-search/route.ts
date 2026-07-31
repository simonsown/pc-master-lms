import { NextRequest, NextResponse } from 'next/server'
import { getPriceInfo } from '@/lib/price-search'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = String(body.query || '').trim()
    if (!query) return NextResponse.json({ error: 'Thiếu tên linh kiện' }, { status: 400 })

    const estimate = body.estimate ? Number(body.estimate) : undefined
    const info = await getPriceInfo(query, estimate)

    return NextResponse.json({ query, ...info })
  } catch (e: any) {
    return NextResponse.json({ error: 'Không thể tra cứu giá lúc này.' }, { status: 500 })
  }
}
