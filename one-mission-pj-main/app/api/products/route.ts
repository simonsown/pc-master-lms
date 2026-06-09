import { createClient } from '@/lib/supabase-ssr-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  let dbQuery = supabase
    .from('products')
    .select('*')

  if (category) {
    const cat = category.toUpperCase()
    const valid = ['CPU', 'GPU', 'MAINBOARD', 'RAM', 'PSU', 'CASE', 'COOLER', 'SSD', 'HDD']
    if (valid.includes(cat)) {
      dbQuery = dbQuery.eq('category', cat)
    }
  }

  if (query) {
    dbQuery = dbQuery.or(
      `full_name.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%`
    )
  }

  const { data, error, count } = await dbQuery
    .order('price_vnd', { ascending: true })
    .range(offset, offset + limit - 1)
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data, count, offset, limit })
}
