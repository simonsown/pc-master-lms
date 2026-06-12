import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-service';

export async function POST(request: Request) {
  try {
    const { componentId, userId, action } = await request.json();
    const supabase = createServiceClient();

    if (action === 'lock') {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from('components')
        .select('locked_by, lock_expires_at')
        .eq('id', componentId)
        .single();

      if (existing?.locked_by && existing.locked_by !== userId) {
        const lockExpired = new Date(existing.lock_expires_at) < new Date();
        if (!lockExpired) {
          const { data: locker } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', existing.locked_by)
            .single();
          return NextResponse.json({
            locked: false,
            lockedBy: locker?.full_name || 'someone',
            message: 'Component is being edited by another user',
          }, { status: 409 });
        }
      }

      await supabase
        .from('components')
        .update({ locked_by: userId, locked_at: new Date().toISOString(), lock_expires_at: expiresAt })
        .eq('id', componentId);

      return NextResponse.json({ locked: true });
    }

    if (action === 'release') {
      await supabase
        .from('components')
        .update({ locked_by: null, locked_at: null, lock_expires_at: null })
        .eq('id', componentId);

      return NextResponse.json({ released: true });
    }

    if (action === 'heartbeat') {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      await supabase
        .from('components')
        .update({ lock_expires_at: expiresAt })
        .eq('id', componentId)
        .eq('locked_by', userId);

      return NextResponse.json({ extended: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Lock error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
