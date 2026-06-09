import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: { file: string; status: string; error?: string }[] = []

  const migrationsDir = path.join(process.cwd(), 'database')
  const migrationFiles = [
    '20260610_products_full_specs.sql',
    '20260610_seed_products.sql',
    '20260610_saved_builds.sql',
  ]

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file)
    if (!fs.existsSync(filePath)) {
      results.push({ file, status: 'skipped', error: 'File not found' })
      continue
    }

    const sql = fs.readFileSync(filePath, 'utf8')

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let successCount = 0
    let errorCount = 0
    let lastError = ''

    for (const stmt of statements) {
      const { error } = await supabase.rpc('exec_sql', { query: stmt }).single()
      if (error) {
        // Try direct query via rest
        const { error: restError } = await supabase.from('_sql_exec').insert({ query: stmt }).single().maybeSingle()
        if (restError) {
          errorCount++
          lastError = restError.message
        } else {
          successCount++
        }
      } else {
        successCount++
      }
    }

    results.push({
      file,
      status: errorCount > 0 ? `partial (${successCount} ok, ${errorCount} errors)` : `ok (${successCount} stmts)`,
      error: lastError || undefined,
    })
  }

  return NextResponse.json({ results })
}

// Seed data via REST API (works with service role key)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check if products exist
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    status: count > 0 ? 'seeded' : 'empty',
    productCount: count,
    message: count > 0
      ? `Database already has ${count} products`
      : 'No products found. Run POST to migrate.',
  })
}
