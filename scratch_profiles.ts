import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ojjmdhrvivwvfgomonzd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qam1kaHJ2aXZ3dmZnb21vbnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDQ4MDYsImV4cCI6MjA5NDU4MDgwNn0.ZebNbh-YKmKOuAoR6-_e24rxAY4Hmpyc8CRz_1FXZMc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  console.log('Fetching profiles from Supabase...')
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Profiles list:')
    console.table(data)
  }
}

run()
