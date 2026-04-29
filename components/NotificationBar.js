'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, X } from 'lucide-react';

export default function NotificationBar() {
    const [notifications, setNotifications] = useState([]);
    const [dismissed, setDismissed] = useState(new Set());

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('is_global', true)
                .order('created_at', { ascending: false })
                .limit(3);
            setNotifications(data || []);
        };
        fetch();
    }, []);

    const visible = notifications.filter(n => !dismissed.has(n.id));
    if (visible.length === 0) return null;

    return (
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 500, display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '340px' }}>
            {visible.map(n => (
                <div key={n.id} style={{ background: 'rgba(10,20,40,0.97)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 8px 32px rgba(0,243,255,0.12)', animation: 'slideInRight 0.3s ease' }}>
                    <style>{`@keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <Bell size={16} color="#00f3ff" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: 'white' }}>{n.title}</p>
                                {n.content && <p style={{ margin: 0, fontSize: '12px', color: '#8899a6', lineHeight: 1.5 }}>{n.content}</p>}
                                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#4b5563' }}>{new Date(n.created_at).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                        <button onClick={() => setDismissed(prev => new Set([...prev, n.id]))} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', flexShrink: 0 }}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
