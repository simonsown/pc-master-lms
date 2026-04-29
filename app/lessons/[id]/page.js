'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    BookOpen, Video, FileText, Image as ImageIcon, FileSearch, 
    ChevronRight, Loader2, ArrowLeft, Book, Maximize2, X
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function StudentLessonPage({ params }) {
    const resolvedParams = use(params);
    const lessonId = resolvedParams.id;

    const [lesson, setLesson] = useState(null);
    const [sections, setSections] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        const fetchLesson = async () => {
            const { data: lessonData } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
            const { data: sectionData } = await supabase.from('lesson_sections').select('*').eq('lesson_id', lessonId).order('order_index', { ascending: true });
            const { data: bookData } = await supabase.from('lesson_books').select('*').eq('lesson_id', lessonId);

            setLesson(lessonData);
            setSections(sectionData || []);
            setBooks(bookData || []);
            setLoading(false);
        };
        fetchLesson();
    }, [lessonId]);

    const getYouTubeEmbed = (url) => {
        if (!url) return '';
        const id = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        return id ? `https://www.youtube.com/embed/${id}` : '';
    };

    const getDriveEmbed = (url) => {
        if (!url) return '';
        const id = url.match(/\/d\/(.+?)\/(?:view|preview)/)?.[1] || url.match(/id=(.+?)(&|$)/)?.[1];
        return id ? `https://drive.google.com/file/d/${id}/preview` : '';
    };

    if (loading) return (
        <div style={{ background: '#050a14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" color="#00f3ff" size={48} />
        </div>
    );

    return (
        <div style={{ background: '#050a14', minHeight: '100vh', color: '#e0e6ed', display: 'flex' }}>
            {/* Sidebar Navigation */}
            <aside style={{ width: '320px', background: '#0a0f1a', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', padding: '32px' }}>
                <Link href="/builder" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '40px', fontSize: '14px' }}>
                    <ArrowLeft size={16} /> Quay lại trang chủ
                </Link>
                <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ color: '#4b5563', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '16px' }}>Nội dung bài học</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sections.map((s, idx) => (
                            <a key={s.id} href={`#section-${s.id}`} style={{ 
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', color: '#e0e6ed', textDecoration: 'none', fontSize: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid transparent'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#00f3ff'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                            >
                                <span style={{ color: '#00f3ff', fontWeight: 800, fontSize: '12px', width: '20px' }}>{idx + 1}</span>
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '64px', maxWidth: '900px', margin: '0 auto' }}>
                <header style={{ marginBottom: '64px' }}>
                    <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '24px', lineHeight: 1.1 }}>{lesson.title}</h1>
                    <p style={{ fontSize: '18px', color: '#8899a6', lineHeight: 1.6 }}>{lesson.description}</p>
                    <div style={{ height: '4px', width: '80px', background: '#00f3ff', marginTop: '32px', borderRadius: '2px' }}></div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
                    {sections.map((s, idx) => (
                        <section key={s.id} id={`section-${s.id}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ padding: '8px', background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', borderRadius: '8px' }}>
                                    {s.type === 'video' && <Video size={20}/>}
                                    {s.type === 'text' && <FileText size={20}/>}
                                    {s.type === 'image' && <ImageIcon size={20}/>}
                                    {s.type === 'pdf' && <FileSearch size={20}/>}
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{s.title}</h2>
                            </div>

                            {s.type === 'video' && (
                                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', background: '#000' }}>
                                    <iframe src={getYouTubeEmbed(s.content)} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                                </div>
                            )}

                            {s.type === 'text' && (
                                <div style={{ fontSize: '18px', lineHeight: 1.8, color: '#ced4da' }} className="prose-student">
                                    <ReactMarkdown>{s.content}</ReactMarkdown>
                                </div>
                            )}

                            {s.type === 'image' && (
                                <div style={{ borderRadius: '24px', overflow: 'hidden' }}>
                                    <img src={s.content} style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}

                            {s.type === 'pdf' && (
                                <div style={{ background: '#0a0f1a', borderRadius: '24px', overflow: 'hidden', border: '1px solid #1e293b' }}>
                                    <iframe src={getDriveEmbed(s.content)} style={{ width: '100%', height: '600px', border: 'none' }} />
                                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <a href={s.content} target="_blank" style={{ color: '#00f3ff', textDecoration: 'none', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Maximize2 size={16} /> Xem toàn màn hình
                                        </a>
                                    </div>
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                {/* Sách liên quan */}
                {books.length > 0 && (
                    <div style={{ marginTop: '120px', padding: '64px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Book size={28} color="#00f3ff" /> Sách & Tài liệu liên quan
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                            {books.map(book => (
                                <div 
                                    key={book.id} 
                                    onClick={() => setSelectedBook(book)}
                                    style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '16px', border: '1px solid #1e293b', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.borderColor = '#00f3ff'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = '#1e293b'}
                                >
                                    <img src={book.cover_image_url} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, textAlign: 'center' }}>{book.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal xem sách */}
            {selectedBook && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0f1a' }}>
                        <h3 style={{ margin: 0 }}>Đang xem: {selectedBook.title}</h3>
                        <button onClick={() => setSelectedBook(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={32}/></button>
                    </div>
                    <div style={{ flex: 1 }}>
                        <iframe src={getDriveEmbed(selectedBook.drive_embed_url)} style={{ width: '100%', height: '100%', border: 'none' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
