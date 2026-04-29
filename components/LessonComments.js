'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Send, Trash2, MessageCircle } from 'lucide-react';

export default function LessonComments({ lessonId }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) { setUserId(user.id); setUserEmail(user.email); }
            fetchComments();
        };
        init();
    }, [lessonId]);

    const fetchComments = async () => {
        const { data } = await supabase
            .from('lesson_comments')
            .select('*')
            .eq('lesson_id', lessonId)
            .order('created_at', { ascending: true });
        setComments(data || []);
        setLoading(false);
    };

    const handleSend = async () => {
        if (!text.trim() || !userId) return;
        setSending(true);
        const { data } = await supabase.from('lesson_comments').insert({
            lesson_id: lessonId, user_id: userId, content: text.trim(), user_email: userEmail
        }).select().single();
        if (data) setComments(prev => [...prev, data]);
        setText('');
        setSending(false);
    };

    const handleDelete = async (id) => {
        await supabase.from('lesson_comments').delete().eq('id', id);
        setComments(prev => prev.filter(c => c.id !== id));
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="#00f3ff" size={32} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <MessageCircle size={20} color="#00f3ff" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Thảo luận ({comments.length})</h3>
            </div>

            {/* Comments list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {comments.length === 0 && (
                    <p style={{ color: '#4b5563', textAlign: 'center', padding: '32px' }}>Chưa có bình luận. Hãy là người đầu tiên!</p>
                )}
                {comments.map(c => (
                    <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,243,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f3ff', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                            {(c.user_email || 'U')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#00f3ff' }}>{c.user_email?.split('@')[0] || 'Học sinh'}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '11px', color: '#4b5563' }}>{new Date(c.created_at).toLocaleString('vi-VN')}</span>
                                    {c.user_id === userId && (
                                        <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}><Trash2 size={13} /></button>
                                    )}
                                </div>
                            </div>
                            <p style={{ margin: 0, color: '#e0e6ed', fontSize: '14px', lineHeight: 1.6 }}>{c.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            {userId ? (
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Nhập bình luận... (Enter để gửi)"
                        style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                    <button onClick={handleSend} disabled={sending || !text.trim()}
                        style={{ padding: '12px 20px', background: '#00f3ff', color: '#050a14', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    </button>
                </div>
            ) : (
                <p style={{ color: '#4b5563', textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                    Vui lòng <a href="/login" style={{ color: '#00f3ff' }}>đăng nhập</a> để bình luận.
                </p>
            )}
        </div>
    );
}
