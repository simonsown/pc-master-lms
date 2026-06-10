'use server'

import { createClient } from '@/lib/supabase-ssr-server'
import { issueCertificate } from '@/lib/certificates'
import { revalidatePath } from 'next/cache'

export async function issueStudentCertificate(pathId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const cert = await issueCertificate(user.id, pathId)
  revalidatePath('/student/certificates')
  return cert
}
