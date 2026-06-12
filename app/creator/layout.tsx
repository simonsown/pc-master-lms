import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-ssr-server';

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/creator');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role as string;
  if (!['admin', 'component_creator'].includes(role)) {
    redirect('/builder?error=unauthorized');
  }

  return <>{children}</>;
}
