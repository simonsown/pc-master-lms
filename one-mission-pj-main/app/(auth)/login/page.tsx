import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = params.redirect ?? '/student/dashboard'
  const encoded = encodeURIComponent(redirectTo)
  redirect(`/builder?requireAuth=true&redirect=${encoded}`)
}
