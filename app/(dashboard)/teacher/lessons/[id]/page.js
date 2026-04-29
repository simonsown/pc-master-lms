'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Trash2, Video, FileText, Image as ImageIcon, FileSearch, Loader2, ArrowLeft, GripVertical, Eye, EyeOff, Upload, PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Simple Markdown → HTML renderer (no external lib needed)
function SimpleMarkdown({ text }) {
    const html = (text || '')
        .replace(/^## (.+)$/gm, '<h2 style="color:#00f3ff;margin:16px 0 8px">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 style="color:#00f3ff;margin:20px 0 10px">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li style="margin:4px 0">$1</li>')
        .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: '#ced4da', lineHeight: 1.7 }} />;
}

// Toast notification component
function Toast({ message, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
    return (
        <div style={{
            position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
            background: type === 'success' ? '#10b981' : '#ef4444',
            color: 'white', padding: '14px 24px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
            fontWeight: 700, boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.3s ease'
        }}>
            {type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
            {message}
        </div>
    );
}

export default function LessonEditorPage({ params }) {
    const resolvedParams = use(params);
    const lessonId = resolvedParams.id;

    const [lesson, setLesson] = useState(null);
    const [sections, setSections] = useState([]);
    const [books, setBooks] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [activeTab, setActiveTab] = useState('content');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    useEffect(() => { fetchLessonData(); }, [lessonId]);

    const fetchLessonData = async () => {
        setLoading(true);
        const { data: lessonData, error } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
        if (error || !lessonData) { showToast('Không tìm thấy bài giảng!', 'error'); setLoading(false); return; }
        const { data: sectionData } = await supabase.from('lesson_sections').select('*').eq('lesson_id', lessonId).order('order_index', { ascending: true });
        const { data: bookData } = await supabase.from('lesson_books').select('*').eq('lesson_id', lessonId);
        setLesson(lessonData);
        setSections(sectionData || []);
        setBooks(bookData || []);
        if (sectionData?.length > 0) setActiveSection(sectionData[0]);
        setLoading(false);
    };

    const handleSaveLesson = async () => {
        setSaving(true);
        const { error } = await supabase.from('lessons').update({
            title: lesson.title,
            description: lesson.description,
            thumbnail_url: lesson.thumbnail_url,
            is_published: lesson.is_published,
            category: lesson.category || 'extended'
        }).eq('id', lessonId);
        setSaving(false);
        if (error) { showToast('Lưu thất bại: ' + error.message, 'error'); }
        else { showToast('✅ Đã lưu bài giảng!'); }
    };

    const addSection = async (type) => {
        const newSection = { lesson_id: lessonId, type, title: `Phần ${type.toUpperCase()} mới`, content: '', order_index: sections.length };
        const { data, error } = await supabase.from('lesson_sections').insert(newSection).select().single();
        if (error) { showToast('Không thêm được section: ' + error.message, 'error'); return; }
        if (data) { setSections(prev => [...prev, data]); setActiveSection(data); }
    };

    // Save section manually (only when user stops typing - called by Save button or blur)
    const saveSection = async (section) => {
        const { error } = await supabase.from('lesson_sections').update({
            title: section.title, content: section.content
        }).eq('id', section.id);
        if (error) showToast('Lưu section thất bại', 'error');
    };

    const updateSectionLocal = (updated) => {
        setSections(prev => prev.map(s => s.id === updated.id ? updated : s));
        setActiveSection(updated);
    };

    const deleteSection = async (id) => {
        if (!confirm('Xóa phần này?')) return;
        const { error } = await supabase.from('lesson_sections').delete().eq('id', id);
        if (error) { showToast('Xóa thất bại', 'error'); return; }
        const filtered = sections.filter(s => s.id !== id);
        setSections(filtered);
        setActiveSection(filtered[0] || null);
    };

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

    if (loading) return (
        <div style={{ background: '#050a14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" color="#00f3ff" size={48} />
        </div>
    );

    if (!lesson) return (
        <div style={{ background: '#050a14', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <AlertCircle size={48} color="#ef4444" />
            <p>Không tìm thấy bài giảng. Hãy kiểm tra lại Supabase SQL đã chạy chưa.</p>
            <Link href="/teacher/lessons" style={{ color: '#00f3ff' }}>← Quay lại</Link>
        </div>
    );

    const inputStyle = { width: '100%', background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{ background: '#050a14', minHeight: '100vh', color: '#e0e6ed', display: 'flex', flexDirection: 'column' }}>
            <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Toolbar */}
            <header style={{ padding: '16px 32px', background: '#0a0f1a', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link href="/teacher/lessons" style={{ color: '#8899a6', textDecoration: 'none', display: 'flex' }}><ArrowLeft /></Link>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Tên bài giảng</span>
                        <input
                            value={lesson.title}
                            onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                            placeholder="Nhập tên bài giảng..."
                            style={{ background: 'transparent', border: 'none', borderBottom: '2px solid #00f3ff', color: 'white', fontSize: '18px', fontWeight: 800, width: '420px', outline: 'none', paddingBottom: '4px' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={() => setLesson({ ...lesson, is_published: !lesson.is_published })}
                        style={{ background: lesson.is_published ? 'rgba(16,185,129,0.15)' : 'rgba(71,85,105,0.15)', color: lesson.is_published ? '#10b981' : '#8899a6', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        {lesson.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                        {lesson.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                    </button>
                    <button onClick={handleSaveLesson} disabled={saving}
                        style={{ background: '#00f3ff', color: '#050a14', border: 'none', padding: '10px 28px', borderRadius: '10px', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Lưu bài giảng
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* LEFT SIDEBAR */}
                <div style={{ width: '340px', minWidth: '340px', background: '#0a0f1a', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    {/* Thumbnail */}
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Ảnh Thumbnail</p>
                        <div style={{ width: '100%', height: '140px', background: '#020617', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', border: '1px dashed #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {lesson.thumbnail_url
                                ? <img src={lesson.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                : <Upload size={28} color="#1e293b" />}
                        </div>
                        <input placeholder="Dán URL ảnh thumbnail..." value={lesson.thumbnail_url || ''}
                            onChange={(e) => setLesson({ ...lesson, thumbnail_url: e.target.value })}
                            style={{ width: '100%', background: '#050a14', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', boxSizing: 'border-box' }} />
                        <textarea placeholder="Mô tả bài học..." value={lesson.description || ''}
                            onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
                            style={{ width: '100%', background: '#050a14', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', boxSizing: 'border-box', marginTop: '8px', height: '72px', resize: 'none' }} />

                        {/* Category Selector */}
                        <div style={{ marginTop: '14px' }}>
                            <p style={{ fontSize: '11px', color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Đăng vào mục</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button onClick={() => setLesson({ ...lesson, category: 'textbook' })} style={{
                                    padding: '10px 8px', borderRadius: '10px', border: `2px solid ${(lesson.category || 'extended') === 'textbook' ? '#3b82f6' : '#1e293b'}`,
                                    background: (lesson.category || 'extended') === 'textbook' ? 'rgba(59,130,246,0.15)' : 'transparent',
                                    color: (lesson.category || 'extended') === 'textbook' ? '#3b82f6' : '#4b5563',
                                    cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s'
                                }}>
                                    🎓 Sách Giáo Khoa
                                </button>
                                <button onClick={() => setLesson({ ...lesson, category: 'extended' })} style={{
                                    padding: '10px 8px', borderRadius: '10px', border: `2px solid ${(lesson.category || 'extended') === 'extended' ? '#f59e0b' : '#1e293b'}`,
                                    background: (lesson.category || 'extended') === 'extended' ? 'rgba(245,158,11,0.15)' : 'transparent',
                                    color: (lesson.category || 'extended') === 'extended' ? '#f59e0b' : '#4b5563',
                                    cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s'
                                }}>
                                    💡 Kiến Thức Mở Rộng
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {['content', 'books'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                flex: 1, padding: '12px', background: activeTab === tab ? 'rgba(0,243,255,0.05)' : 'transparent',
                                color: activeTab === tab ? '#00f3ff' : '#4b5563', border: 'none',
                                borderBottom: activeTab === tab ? '2px solid #00f3ff' : '2px solid transparent',
                                fontWeight: 700, cursor: 'pointer', fontSize: '13px'
                            }}>{tab === 'content' ? 'Nội dung' : 'Sách & Tài liệu'}</button>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        {activeTab === 'content' ? (
                            <>
                                {sections.length === 0 && <p style={{ color: '#4b5563', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Chưa có nội dung. Thêm phần đầu tiên bên dưới.</p>}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {sections.map(s => (
                                        <div key={s.id} onClick={() => { if (activeSection && activeSection.id !== s.id) saveSection(activeSection); setActiveSection(s); }}
                                            style={{ padding: '10px 14px', borderRadius: '10px', background: activeSection?.id === s.id ? 'rgba(0,243,255,0.1)' : 'transparent', border: activeSection?.id === s.id ? '1px solid #00f3ff' : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}>
                                            <GripVertical size={14} color="#4b5563" />
                                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#050a14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f3ff', flexShrink: 0 }}>
                                                {s.type === 'video' && <Video size={14} />}
                                                {s.type === 'text' && <FileText size={14} />}
                                                {s.type === 'image' && <ImageIcon size={14} />}
                                                {s.type === 'pdf' && <FileSearch size={14} />}
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: activeSection?.id === s.id ? 'white' : '#e0e6ed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</p>
                                                <p style={{ margin: 0, fontSize: '10px', color: '#4b5563', textTransform: 'uppercase' }}>{s.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {[['video', <Video size={13} />, '+Video'], ['text', <FileText size={13} />, '+Chữ'], ['image', <ImageIcon size={13} />, '+Ảnh'], ['pdf', <FileSearch size={13} />, '+PDF']].map(([type, icon, label]) => (
                                        <button key={type} onClick={() => addSection(type)} style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', borderRadius: '8px', color: '#8899a6', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {icon} {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {books.map(book => (
                                    <div key={book.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', borderRadius: '10px', display: 'flex', gap: '10px' }}>
                                        <img src={book.cover_image_url} style={{ width: '36px', height: '52px', borderRadius: '4px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>{book.title}</p>
                                            <button onClick={async () => { await supabase.from('lesson_books').delete().eq('id', book.id); setBooks(books.filter(b => b.id !== book.id)); }} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '11px', cursor: 'pointer', padding: 0, marginTop: '4px' }}>Xóa</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={async () => {
                                    const { data } = await supabase.from('lesson_books').insert({ lesson_id: lessonId, title: 'Sách mới', cover_image_url: '', drive_embed_url: '', description: '' }).select().single();
                                    if (data) setBooks([...books, data]);
                                }} style={{ width: '100%', padding: '12px', background: 'rgba(0,243,255,0.08)', color: '#00f3ff', border: '1px dashed rgba(0,243,255,0.4)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                                    + Thêm sách mới
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Editor */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', background: '#050a14' }}>
                    {activeSection ? (
                        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                                <h2 style={{ margin: 0, color: '#00f3ff', fontSize: '20px', fontWeight: 800 }}>✏️ Phần: {activeSection.type.toUpperCase()}</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => saveSection(activeSection)} style={{ background: 'rgba(0,243,255,0.1)', color: '#00f3ff', border: '1px solid rgba(0,243,255,0.3)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>💾 Lưu phần này</button>
                                    <button onClick={() => deleteSection(activeSection.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>🗑 Xóa</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#4b5563', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tiêu đề phần</label>
                                    <input value={activeSection.title} onChange={(e) => updateSectionLocal({ ...activeSection, title: e.target.value })} style={inputStyle} />
                                </div>

                                {activeSection.type === 'video' && <>
                                    <div>
                                        <label style={{ display: 'block', color: '#4b5563', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Link YouTube</label>
                                        <input placeholder="https://www.youtube.com/watch?v=..." value={activeSection.content} onChange={(e) => updateSectionLocal({ ...activeSection, content: e.target.value })} style={inputStyle} />
                                    </div>
                                    {getYouTubeEmbed(activeSection.content) && (
                                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '16px', overflow: 'hidden' }}>
                                            <iframe src={getYouTubeEmbed(activeSection.content)} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                                        </div>
                                    )}
                                </>}

                                {activeSection.type === 'text' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', color: '#4b5563', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Markdown</label>
                                            <textarea value={activeSection.content} onChange={(e) => updateSectionLocal({ ...activeSection, content: e.target.value })}
                                                style={{ ...inputStyle, height: '360px', fontFamily: 'monospace', resize: 'vertical' }}
                                                placeholder="## Tiêu đề&#10;**In đậm**, *in nghiêng*&#10;- Danh sách" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: '#4b5563', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Xem trước</label>
                                            <div style={{ height: '360px', background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', overflowY: 'auto' }}>
                                                <SimpleMarkdown text={activeSection.content} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection.type === 'image' && <>
                                    <div>
                                        <label style={{ display: 'block', color: '#4b5563', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>URL Ảnh</label>
                                        <input value={activeSection.content} onChange={(e) => updateSectionLocal({ ...activeSection, content: e.target.value })} style={inputStyle} placeholder="https://..." />
                                    </div>
                                    {activeSection.content && <img src={activeSection.content} style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid #1e293b' }} onError={e => e.target.style.display = 'none'} />}
                                </>}

                                {activeSection.type === 'pdf' && <>
                                    <div style={{ background: 'rgba(0,243,255,0.05)', border: '1px solid rgba(0,243,255,0.15)', borderRadius: '12px', padding: '16px', fontSize: '13px', color: '#8899a6', lineHeight: 1.6 }}>
                                        💡 <strong style={{ color: '#00f3ff' }}>Hướng dẫn lấy link Drive:</strong> Vào Google Drive → Chuột phải file PDF → <em>Chia sẻ</em> → Sao chép link → Đổi <code>/view</code> thành <code>/preview</code>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#4b5563', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Google Drive Embed URL</label>
                                        <input placeholder="https://drive.google.com/file/d/FILE_ID/preview" value={activeSection.content} onChange={(e) => updateSectionLocal({ ...activeSection, content: e.target.value })} style={inputStyle} />
                                    </div>
                                    {getDriveEmbed(activeSection.content) && (
                                        <div style={{ width: '100%', height: '500px', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b' }}>
                                            <iframe src={getDriveEmbed(activeSection.content)} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay" />
                                        </div>
                                    )}
                                </>}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#1e293b', gap: '16px' }}>
                            <PlusCircle size={64} />
                            <p style={{ fontSize: '16px' }}>Chọn hoặc thêm mới một phần nội dung ở bên trái</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
