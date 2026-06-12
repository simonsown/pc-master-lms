import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-service';

export async function POST(request: Request) {
  try {
    const { componentId, componentName, action } = await request.json();
    const supabase = createServiceClient();

    if (action === 'published') {
      // Ghi notification vào bảng notifications
      const { error } = await supabase.from('notifications').insert({
        type: 'component_published',
        title: 'New component published',
        content: `New component "${componentName}" has been published and is ready to use.`,
        metadata: { componentId, componentName },
        created_at: new Date().toISOString(),
      });
      if (error) console.error('Notify error:', error);
    }

    if (action === 'updated') {
      const { error } = await supabase.from('notifications').insert({
        type: 'component_updated',
        title: 'Component specs updated',
        content: `Component "${componentName}" specs were updated. Please re-check compatibility.`,
        metadata: { componentId, componentName },
        created_at: new Date().toISOString(),
      });
      if (error) console.error('Notify error:', error);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Notify error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
