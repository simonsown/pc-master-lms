'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    BookOpen, Video, FileText, Image as ImageIcon, FileSearch,
    Loader2, ArrowLeft, Book, Maximize2, X, Clock, Eye,
    GraduationCap, Lightbulb, CheckCircle, Circle
} from 'lucide-react';
import { BadgesPanel } from './LessonInteractive';
import NotificationBar from './NotificationBar';
import LessonComments from './LessonComments';

function SimpleMarkdown({ text }) {
    const html = (text || '')
        .replace(/^## (.+)$/gm, '<h2 style="color:#00f3ff;font-size:1.25rem;margin:20px 0 10px">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 style="color:#00f3ff;font-size:1.6rem;margin:24px 0 12px">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e0e6ed">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li style="margin:6px 0">$1</li>')
        .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: '#ced4da', lineHeight: 1.8 }} />;
}

const getYouTubeEmbed = (url) => {
    if (!url) return '';
    const id = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : '';
};
const getDriveEmbed = (url) => {
    if (!url) return '';
    const id = url.match(/\/d\/(.+?)\/(?:view|preview)/)?.[1];
    return id ? `https://drive.google.com/file/d/${id}/preview` : (url.includes('/preview') ? url : '');
};

// ─── Lesson Detail View ───────────────────────────────────────────────────────
// ─── Lesson Detail View ───────────────────────────────────────────────────────
function LessonDetail({ lesson, onBack, completedIds, onToggleComplete, completedCount }) {
    const [sections, setSections] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);
    const [completing, setCompleting] = useState(false);
    const isCompleted = completedIds.has(lesson.id);

    useEffect(() => {
        const fetchData = async () => {
            const { data: s } = await supabase.from('lesson_sections').select('*').eq('lesson_id', lesson.id).order('order_index');
            const { data: b } = await supabase.from('lesson_books').select('*').eq('lesson_id', lesson.id);
            setSections(s || []);
            setBooks(b || []);
            setLoading(false);
        };
        fetchData();
    }, [lesson.id]);

    const handleComplete = async () => {
        setCompleting(true);
        await onToggleComplete(lesson.id, isCompleted);
        setCompleting(false);
    };

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Left sidebar: section nav */}
            <aside style={{ width: '220px', flexShrink: 0, background: 'rgba(10,20,40,0.6)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '20px 14px' }}>
                <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#8899a6', cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}>
                    <ArrowLeft size={16} /> Quay lại
                </button>
                <h4 style={{ color: '#4b5563', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', margin: '0 0 12px 0' }}>Nội dung bài</h4>
                {loading ? <Loader2 className="animate-spin" color="#00f3ff" size={20} /> : sections.map((s, i) => (
                    <a key={s.id} href={`#sec-${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#e0e6ed', textDecoration: 'none', fontSize: '13px', marginBottom: '4px', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(0,243,255,0.08)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ color: '#00f3ff', fontWeight: 800, fontSize: '11px', minWidth: '18px' }}>{i + 1}</span>
                        {s.title}
                    </a>
                ))}

                {/* Complete button in sidebar */}
                <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                    <button onClick={handleComplete} disabled={completing}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', cursor: completing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s',
                            background: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(0,243,255,0.1)',
                            color: isCompleted ? '#10b981' : '#00f3ff',
                            border: `1px solid ${isCompleted ? '#10b981' : '#00f3ff'}` }}>
                        {completing ? <Loader2 className="animate-spin" size={16} /> : isCompleted ? <><CheckCircle size={16} /> Đã hoàn thành</> : <><Circle size={16} /> Đánh dấu hoàn thành</>}
                    </button>
                </div>
            </aside>

            {/* Main content - split: lesson content | interactive panel */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
                    {lesson.thumbnail_url && (
                        <div style={{ width: '100%', height: '220px', borderRadius: '20px', overflow: 'hidden', marginBottom: '2rem' }}>
                            <img src={lesson.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>{lesson.title}</h1>
                            {lesson.description && <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, lineHeight: 1.6 }}>{lesson.description}</p>}
                        </div>
                        {isCompleted && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                                <CheckCircle size={16} /> Đã hoàn thành
                            </div>
                        )}
                    </div>
                    <div style={{ height: '3px', width: '60px', background: '#00f3ff', marginBottom: '3rem', borderRadius: '2px' }} />

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader2 className="animate-spin" color="#00f3ff" size={40} /></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '52px' }}>
                            {sections.map(s => (
                                <section key={s.id} id={`sec-${s.id}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                                        <div style={{ padding: '8px', background: 'rgba(0,243,255,0.1)', color: '#00f3ff', borderRadius: '8px' }}>
                                            {s.type === 'video' && <Video size={18} />}
                                            {s.type === 'text' && <FileText size={18} />}
                                            {s.type === 'image' && <ImageIcon size={18} />}
                                            {s.type === 'pdf' && <FileSearch size={18} />}
                                        </div>
                                        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{s.title}</h2>
                                    </div>
                                    {s.type === 'video' && getYouTubeEmbed(s.content) && (
                                        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '20px', overflow: 'hidden', background: '#000' }}>
                                            <iframe src={getYouTubeEmbed(s.content)} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                                        </div>
                                    )}
                                    {s.type === 'text' && (
                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem' }}>
                                            <SimpleMarkdown text={s.content} />
                                        </div>
                                    )}
                                    {s.type === 'image' && s.content && (
                                        <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                                            <img src={s.content} style={{ width: '100%', display: 'block' }} />
                                        </div>
                                    )}
                                    {s.type === 'pdf' && getDriveEmbed(s.content) && (
                                        <div style={{ background: '#0a0f1a', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <iframe src={getDriveEmbed(s.content)} style={{ width: '100%', height: '540px', border: 'none' }} allow="autoplay" />
                                            <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
                                                <a href={s.content} target="_blank" style={{ color: '#00f3ff', textDecoration: 'none', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Maximize2 size={13} /> Toàn màn hình
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    )}

                    {/* Books */}
                    {books.length > 0 && (
                        <div style={{ marginTop: '72px', paddingTop: '44px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Book size={22} color="#00f3ff" /> Sách & Tài liệu
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: '18px' }}>
                                {books.map(book => (
                                    <div key={book.id} onClick={() => setSelectedBook(book)}
                                        style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.borderColor = '#00f3ff'}
                                        onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                                        {book.cover_image_url && <img src={book.cover_image_url} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />}
                                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>{book.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom complete button */}
                    <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleComplete} disabled={completing}
                            style={{ padding: '16px 48px', borderRadius: '14px', border: 'none', cursor: completing ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s',
                                background: isCompleted ? 'rgba(16,185,129,0.2)' : '#00f3ff',
                                color: isCompleted ? '#10b981' : '#050a14',
                                boxShadow: isCompleted ? '0 0 20px rgba(16,185,129,0.2)' : '0 0 30px rgba(0,243,255,0.4)' }}>
                            {completing ? <Loader2 className="animate-spin" size={20} /> : isCompleted ? <><CheckCircle size={20} /> Đã hoàn thành bài này!</> : <><Circle size={20} /> Đánh dấu hoàn thành bài học</>}
                        </button>
                    </div>

                    {!loading && (
                        <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '60px' }}>
                            <BadgesPanel completedCount={completedCount} />
                            <LessonComments lessonId={lesson.id} />
                        </div>
                    )}
                </div>
            </div>

            {/* Book Modal */}
            {selectedBook && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0f1a', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ margin: 0, color: 'white' }}>{selectedBook.title}</h3>
                        <button onClick={() => setSelectedBook(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={28} /></button>
                    </div>
                    <div style={{ flex: 1 }}>
                        <iframe src={getDriveEmbed(selectedBook.drive_embed_url)} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay" />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Lesson Card ──────────────────────────────────────────────────────────────
function LessonCard({ lesson, isCompleted, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div onClick={onClick}
            onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}
            style={{ background: 'var(--bg-surface)', border: `1px solid ${hovered ? '#00f3ff' : isCompleted ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'}`, borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', transform: hovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: hovered ? '0 12px 40px rgba(0,243,255,0.12)' : '0 4px 20px rgba(0,0,0,0.2)', position: 'relative' }}>
            {isCompleted && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, background: 'rgba(16,185,129,0.9)', color: 'white', borderRadius: '100px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} /> Hoàn thành
                </div>
            )}
            <div style={{ height: '170px', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {lesson.thumbnail_url ? <img src={lesson.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BookOpen size={44} color="rgba(255,255,255,0.07)" />}
            </div>
            <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.3 }}>{lesson.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lesson.description || 'Nhấn để xem nội dung.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    <Clock size={11} /> {new Date(lesson.created_at).toLocaleDateString('vi-VN')}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LectureCourse({ lang, onBack }) {
    const [activeTab, setActiveTab] = useState('textbook');
    const [lessons, setLessons] = useState({ textbook: [], extended: [] });
    const [completedIds, setCompletedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);

            const [{ data: allLessons }, { data: progress }] = await Promise.all([
                supabase.from('lessons').select('*').eq('is_published', true).order('created_at', { ascending: false }),
                user ? supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id) : { data: [] }
            ]);

            const all = allLessons || [];
            setLessons({
                textbook: all.filter(l => l.category === 'textbook'),
                extended: all.filter(l => l.category === 'extended' || !l.category)
            });
            setCompletedIds(new Set((progress || []).map(p => p.lesson_id)));
            setLoading(false);
        };
        init();
    }, []);

    const handleToggleComplete = async (lessonId, wasCompleted) => {
        if (!userId) return;
        if (wasCompleted) {
            await supabase.from('lesson_progress').delete().eq('user_id', userId).eq('lesson_id', lessonId);
            setCompletedIds(prev => { const s = new Set(prev); s.delete(lessonId); return s; });
        } else {
            await supabase.from('lesson_progress').upsert({ user_id: userId, lesson_id: lessonId });
            setCompletedIds(prev => new Set([...prev, lessonId]));
        }
    };

    const tabs = [
        { key: 'textbook', label: lang === 'en' ? 'Textbooks' : 'Sách Giáo Khoa', icon: <GraduationCap size={16} />, color: '#3b82f6' },
        { key: 'extended', label: lang === 'en' ? 'Extended' : 'Kiến Thức Mở Rộng', icon: <Lightbulb size={16} />, color: '#f59e0b' }
    ];

    if (selectedLesson) {
        return (
            <div style={{ width: '100%', height: '100%', background: '#050a14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <NotificationBar />
                <LessonDetail
                    lesson={selectedLesson}
                    onBack={() => setSelectedLesson(null)}
                    completedIds={completedIds}
                    onToggleComplete={handleToggleComplete}
                    completedCount={completedIds.size}
                />
            </div>
        );
    }

    const currentLessons = lessons[activeTab] || [];
    const completedCount = currentLessons.filter(l => completedIds.has(l.id)).length;

    return (
        <div style={{ width: '100%', height: '100%', background: '#050a14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <header style={{ padding: '20px 32px', background: 'rgba(10,20,40,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>{lang === 'en' ? 'Course Library' : 'Thư Viện Bài Giảng'}</h1>
                </div>
                {userId && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', color: '#10b981', fontWeight: 700 }}>
                        ✅ {completedIds.size} bài hoàn thành
                    </div>
                )}
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', background: 'rgba(10,20,40,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: activeTab === tab.key ? `${tab.color}18` : 'transparent', color: activeTab === tab.key ? tab.color : 'var(--text-muted)', border: 'none', borderBottom: activeTab === tab.key ? `3px solid ${tab.color}` : '3px solid transparent', cursor: 'pointer', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s' }}>
                        {tab.icon} {tab.label}
                        <span style={{ background: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.1)', color: activeTab === tab.key ? 'white' : 'var(--text-muted)', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 800 }}>
                            {loading ? '...' : lessons[tab.key].length}
                        </span>
                        {!loading && lessons[tab.key].some(l => completedIds.has(l.id)) && (
                            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 800 }}>
                                ✅ {lessons[tab.key].filter(l => completedIds.has(l.id)).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                        <Loader2 className="animate-spin" color="#00f3ff" size={44} />
                    </div>
                ) : currentLessons.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                        {activeTab === 'textbook' ? <GraduationCap size={52} color="rgba(255,255,255,0.07)" style={{ marginBottom: '16px' }} /> : <Lightbulb size={52} color="rgba(255,255,255,0.07)" style={{ marginBottom: '16px' }} />}
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Chưa có bài giảng nào trong mục này.</p>
                    </div>
                ) : (
                    <>
                        {/* Progress bar */}
                        {userId && currentLessons.length > 0 && (
                            <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                                    <span style={{ color: '#e0e6ed' }}>Tiến độ học tập</span>
                                    <span style={{ color: '#10b981' }}>{completedCount}/{currentLessons.length} bài</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(completedCount / currentLessons.length) * 100}%`, background: 'linear-gradient(90deg, #10b981, #00f3ff)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {currentLessons.map(lesson => (
                                <LessonCard key={lesson.id} lesson={lesson} isCompleted={completedIds.has(lesson.id)} onClick={() => setSelectedLesson(lesson)} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
