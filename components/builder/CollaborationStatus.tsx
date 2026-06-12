'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

interface PresenceState {
  user_id: string;
  role: string;
  current_page: string;
  full_name?: string;
}

export default function CollaborationStatus() {
  const [creators, setCreators] = useState<PresenceState[]>([]);
  const [builders, setBuilders] = useState<PresenceState[]>([]);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('online-users');

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<string, PresenceState[]>;
      const users = Object.values(state).flatMap((u) => u);
      setCreators(users.filter((u) => u.role === 'component_creator' || u.role === 'admin'));
      setBuilders(users.filter((u) => u.role !== 'component_creator' && u.role !== 'admin'));
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setSubscribed(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();
          await channel.track({
            user_id: user.id,
            role: profile?.role || 'student',
            full_name: profile?.full_name || 'Unknown',
            current_page: window.location.pathname,
          });
        }
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!subscribed && creators.length === 0 && builders.length === 0) return null;

  const total = creators.length + builders.length;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 100,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      fontSize: 12,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: '#22c55e',
        boxShadow: '0 0 8px rgba(34,197,94,0.5)',
        animation: 'pulse 2s infinite',
      }} />
      <span style={{ color: '#94a3b8' }}>
        {total} người đang online
      </span>
      {creators.length > 0 && (
        <span style={{ color: '#a855f7', fontWeight: 600 }}>
          · {creators.length} Creator
        </span>
      )}
      {builders.length > 0 && (
        <span style={{ color: '#00d4aa', fontWeight: 600 }}>
          · {builders.length} Builder
        </span>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
