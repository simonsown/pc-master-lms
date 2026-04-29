'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Plus, BookOpen, Edit, Trash2, Eye, EyeOff, Loader2, ArrowLeft, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';

export default function TeacherLessonsPage() {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        const { data } = await supabase
            .from('lessons')
            .select('*, lesson_sections(count)')
            .order('created_at', { ascending: false });
        
        setLessons(data || []);
        setLoading(false);
    };

    const createNewLesson = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('lessons')
            .insert({
                teacher_id: user.id,
                title: 'Bài giảng mới chưa đặt tên',
                description: 'Mô tả bài giảng của bạn...',
                is_published: false
            })
            .select()
            .single();

        if (data) window.location.href = `/teacher/lessons/${data.id}`;
    };

    const deleteLesson = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài giảng này không?')) return;
        await supabase.from('lessons').delete().eq('id', id);
        fetchLessons();
    };

    if (loading) {
        return (
            <div style={{ background: '#050a14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" color="#00f3ff" size={48} />
            </div>
        );
    }

    return (
        <div style={{ 
            background: '#050a14', minHeight: '100vh', color: '#e0e6ed', 
            fontFamily: 'var(--font-sans)', padding: '24px' 
        }}>
            <header style={{ 
                maxWidth: '1200px', margin: '0 auto 40px auto', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/builder" style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.05)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', color: '#8899a6', textDecoration: 'none'
                    }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>
                        Quản lý <span style={{ color: '#00f3ff' }}>Bài Giảng</span>
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button 
                        onClick={createNewLesson}
                        style={{
                            background: '#00f3ff', color: '#050a14', border: 'none',
                            padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                        }}
                    >
                        <Plus size={20} /> Tạo bài mới
                    </button>
                    <AuthButton />
                </div>
            </header>

            <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {lessons.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', padding: '100px 0', 
                        background: 'rgba(12, 20, 36, 0.5)', borderRadius: '24px',
                        border: '2px dashed rgba(255,255,255,0.05)'
                    }}>
                        <BookOpen size={64} color="#1e293b" style={{ marginBottom: '24px' }} />
                        <h3 style={{ color: '#8899a6' }}>Bạn chưa có bài giảng nào. Hãy tạo bài đầu tiên!</h3>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                        gap: '24px' 
                    }}>
                        {lessons.map(lesson => (
                            <div key={lesson.id} style={{
                                background: 'rgba(12, 20, 36, 0.8)',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#00f3ff'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                            >
                                <div style={{ height: '200px', background: '#0a0f1a', position: 'relative' }}>
                                    {lesson.thumbnail_url ? (
                                        <img src={lesson.thumbnail_url} alt={lesson.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#1e293b' }}>
                                            <BookOpen size={48} />
                                        </div>
                                    )}
                                    <div style={{ 
                                        position: 'absolute', top: '16px', left: '16px',
                                        padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 700,
                                        background: lesson.is_published ? 'rgba(16, 185, 129, 0.9)' : 'rgba(71, 85, 105, 0.9)',
                                        color: 'white', display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        {lesson.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {lesson.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                                    </div>
                                </div>

                                <div style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>{lesson.title}</h3>
                                    <p style={{ color: '#8899a6', fontSize: '14px', margin: '0 0 20px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {lesson.description || 'Chưa có mô tả'}
                                    </p>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#4b5563' }}>
                                            {lesson.lesson_sections?.[0]?.count || 0} mục nội dung
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Link href={`/teacher/lessons/${lesson.id}`}>
                                                <button style={{ 
                                                    background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', border: 'none',
                                                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                                                    display: 'flex', alignItems: 'center', gap: '6px'
                                                }}>
                                                    <Edit size={16} /> Sửa
                                                </button>
                                            </Link>
                                            <button 
                                                onClick={() => deleteLesson(lesson.id)}
                                                style={{ 
                                                    background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none',
                                                    padding: '8px 12px', borderRadius: '8px', cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
