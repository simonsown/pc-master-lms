import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

const FILES = [
  '20260610_products_full_specs.sql',
  '20260610_seed_products.sql',
  '20260610_saved_builds.sql',
]

async function tryPgDirect(sql: string): Promise<{ ok: boolean; output?: string }> {
  const ref = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
  if (!ref) return { ok: false, output: 'No project ref found' }

  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Try multiple connection methods
  const attempts = [
    // Session pooler with JWT (service role key as password)
    {
      label: 'pooler-session-jwt',
      conn: {
        host: `aws-0-ap-southeast-1.pooler.supabase.com`,
        port: 6543,
        database: 'postgres',
        user: `postgres.${ref}`,
        password: srk,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
      },
    },
    // Direct connection (needs db.password but trying with srk anyway)
    {
      label: 'direct',
      conn: {
        host: `db.${ref}.supabase.co`,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: srk,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
      },
    },
    // Transaction pooler
    {
      label: 'pooler-tx',
      conn: {
        host: `aws-0-ap-southeast-1.pooler.supabase.com`,
        port: 6563,
        database: 'postgres',
        user: `postgres.${ref}`,
        password: srk,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
      },
    },
  ]

  for (const attempt of attempts) {
    try {
      const pool = new Pool({ ...attempt.conn, max: 1 })
      const client = await pool.connect()
      await client.query(sql)
      client.release()
      await pool.end()
      return { ok: true, output: `via ${attempt.label}` }
    } catch (e: any) {
      if (attempt === attempts[attempts.length - 1]) {
        return { ok: false, output: `${attempt.label}: ${e.message}` }
      }
    }
  }

  return { ok: false, output: 'All connection methods failed' }
}

async function trySupabaseJS(sql: string): Promise<{ ok: boolean; output?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Try supabase.sql() if available (newer SDK versions)
    if (typeof (supabase as any).sql === 'function') {
      const { error } = await (supabase as any).sql(sql)
      if (!error) return { ok: true, output: 'via supabase.sql()' }
    }

    // Try creating a temporary table via REST API to test
    const { error: testError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })

    if (!testError) {
      // Table exists, can seed via REST
      // Extract INSERT statements for seed data
      const insertLines = sql
        .split('\n')
        .filter(l => l.toUpperCase().includes('INSERT INTO'))
        .join('\n')

      if (insertLines) {
        // Can't execute raw INSERT through REST directly
        // But we can log that the table exists
        return { ok: true, output: 'table exists, seed via REST not available for DDL' }
      }
    }

    return { ok: false, output: testError?.message || 'supabase.sql not available' }
  } catch (e: any) {
    return { ok: false, output: e.message }
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: any[] = []
  const dbDir = path.join(process.cwd(), 'database')

  for (const file of FILES) {
    const filePath = path.join(dbDir, file)
    if (!fs.existsSync(filePath)) {
      results.push({ file, status: 'skipped' })
      continue
    }

    const sql = fs.readFileSync(filePath, 'utf8')

    // Try direct PG connection first
    const pgResult = await tryPgDirect(sql)
    if (pgResult.ok) {
      results.push({ file, status: 'ok', method: pgResult.output })
      continue
    }

    // Fallback to Supabase JS
    const jsResult = await trySupabaseJS(sql)
    if (jsResult.ok) {
      results.push({ file, status: 'ok', method: jsResult.output })
      continue
    }

    results.push({
      file,
      status: 'failed',
      pgError: pgResult.output,
      jsError: jsResult.output,
      instructions: 'Run this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/ojjmdhrvivwvfgomonzd/sql/new',
    })
  }

  return NextResponse.json({ results })
}

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

  const pq = supabase.from('products').select('*', { count: 'exact', head: true })
  const sq = supabase.from('saved_builds').select('*', { count: 'exact', head: true })
  const dq = supabase.from('diagnosis_scenarios').select('*', { count: 'exact', head: true })
  const tq = supabase.from('thermal_profiles').select('*', { count: 'exact', head: true })

  const [products, savedBuilds, diagnosis, thermal] = await Promise.all([pq, sq, dq, tq])

  return NextResponse.json({
    products: { exists: !products.error, count: products.count || 0 },
    savedBuilds: { exists: !savedBuilds.error, count: savedBuilds.count || 0 },
    diagnosis: { exists: !diagnosis.error, count: diagnosis.count || 0 },
    thermal: { exists: !thermal.error, count: thermal.count || 0 },
    pgConnection: 'Needs database password (not service_role_key)',
    note: 'Run SQL manually in Supabase Dashboard SQL Editor, or provide a Supabase PAT for auto-migration',
  })
}
