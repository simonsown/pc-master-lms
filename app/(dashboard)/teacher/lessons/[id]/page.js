'use client';

import React, { useEffect, useState, use, useCallback, useRef } from 'react';
import { Save, Trash2, Video, FileText, Image as ImageIcon, FileSearch, Code, Loader2, ArrowLeft, GripVertical, Eye, EyeOff, Upload, PlusCircle, CheckCircle, AlertCircle, AlertTriangle, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';
import { getYouTubeEmbed, isValidYouTubeUrl, getYouTubeThumbnail } from '@/utils/youtube';
import { getLesson, saveLesson, deleteLesson, newSection, getAllClasses, saveClass } from '@/lib/lesson-store';

function SimpleMarkdown({ text }) {
    const html = (text || '')
        .replace(/^## (.+)$/gm, '<h2 style="color:var(--brand-primary);margin:16px 0 8px">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 style="color:var(--brand-primary);margin:20px 0 10px">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li style="margin:4px 0">$1</li>')
        .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: 'var(--text-muted)', lineHeight: 1.7 }} />;
}

function Toast({ message, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
    return (
        <div style={{
            position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
            background: type === 'success' ? 'var(--brand-primary)' : 'var(--danger)',
            color: '#fff', padding: '14px 24px', borderRadius: '12px',
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClassIds, setSelectedClassIds] = useState([]);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [newClassCode, setNewClassCode] = useState('');
    const [newClassName, setNewClassName] = useState('');
    const [activeSectionId, setActiveSectionId] = useState(null);
    const textEditorRef = useRef(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const persist = (updated) => {
        saveLesson(updated);
    };

    useEffect(() => {
        const stored = getLesson(lessonId);
        if (!stored) { showToast('Không tìm thấy bài giảng!', 'error'); setLoading(false); return; }
        setLesson(stored);
        setSelectedClassIds(stored.classCodes || []);
        setClasses(getAllClasses());
        setLoading(false);
    }, [lessonId]);

    const insertAtCursor = (text) => {
        const ta = textEditorRef.current;
        if (!ta || !activeSection) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const val = ta.value;
        const before = val.substring(0, start);
        const after = val.substring(end);
        const result = before + '\n\n' + text + '\n\n' + after;
        updateSectionLocal({ ...activeSection, content: result });
        requestAnimationFrame(() => {
            ta.focus();
            const pos = before.length + 2 + text.length + 2;
            ta.setSelectionRange(pos, pos);
        });
    };

    const activeSection = lesson?.sections?.find(s => s.id === activeSectionId) || null;

    const handleSaveLesson = () => {
        setSaving(true);
        const updated = { ...lesson, classCodes: selectedClassIds, is_published: lesson.is_published };
        persist(updated);
        setLesson(updated);
        setSaving(false);
        showToast('Đã lưu bài giảng!');
    };

    const togglePublish = () => {
        const updated = { ...lesson, is_published: !lesson.is_published };
        setLesson(updated);
        persist(updated);
        showToast(updated.is_published ? 'Đã xuất bản — học sinh đã thấy bài này!' : 'Đã chuyển về bản nháp', updated.is_published ? 'success' : 'error');
    };

    const addSection = (type) => {
        const section = newSection(type, lesson.sections.length);
        const updated = { ...lesson, sections: [...lesson.sections, section] };
        setLesson(updated);
        persist(updated);
        setActiveSectionId(section.id);
    };

    const updateSectionLocal = (updatedSection) => {
        const updated = { ...lesson, sections: lesson.sections.map(s => s.id === updatedSection.id ? updatedSection : s) };
        setLesson(updated);
        persist(updated);
    };

    const saveSection = (section) => {
        updateSectionLocal(section);
        showToast('Đã lưu phần này!');
    };

    const deleteSection = (id) => {
        if (!confirm('Xóa phần này?')) return;
        const updated = { ...lesson, sections: lesson.sections.filter(s => s.id !== id) };
        setLesson(updated);
        persist(updated);
        setActiveSectionId(updated.sections[0]?.id || null);
    };

    const addBook = () => {
        const book = { id: 'bk_' + Date.now().toString(36), title: 'Sách mới', cover_image_url: '', drive_embed_url: '', description: '' };
        const updated = { ...lesson, books: [...(lesson.books || []), book] };
        setLesson(updated);
        persist(updated);
    };

    const deleteBook = (id) => {
        const updated = { ...lesson, books: (lesson.books || []).filter(b => b.id !== id) };
        setLesson(updated);
        persist(updated);
    };

    const updateBook = (id, field, value) => {
        const updated = { ...lesson, books: (lesson.books || []).map(b => b.id === id ? { ...b, [field]: value } : b) };
        setLesson(updated);
        persist(updated);
    };

    const addNewClass = () => {
        const code = newClassCode.trim();
        const name = newClassName.trim() || code;
        if (!code) return;
        saveClass({ code, name });
        setClasses(getAllClasses());
        setNewClassCode('');
        setNewClassName('');
        showToast('Đã thêm lớp "' + name + '"');
    };

    const getDriveEmbed = (url) => {
        if (!url) return '';
        const id = url.match(/\/d\/(.+?)\/(?:view|preview)/)?.[1];
        return id ? `https://drive.google.com/file/d/${id}/preview` : (url.includes('/preview') ? url : '');
    };

    const getPdfEmbedUrl = (url) => {
        if (!url) return '';
        const id = url.match(/\/d\/(.+?)\/(?:view|preview)/)?.[1];
        if (id) {
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
            return `https://docs.google.com/viewer?url=${encodeURIComponent(downloadUrl)}&embedded=true`;
        }
        return url;
    };

    if (loading) return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 style={{ animation: 'spin 1s linear infinite' }} color="var(--brand-primary)" size={48} />
        </div>
    );

    if (!lesson) return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <AlertCircle size={48} color="var(--danger)" />
            <p>Không tìm thấy bài giảng.</p>
            <Link href="/teacher/lessons" style={{ color: 'var(--brand-primary)' }}> Quay lại</Link>
        </div>
    );

    const inputStyle = { width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '14px', color: 'var(--text-primary)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @media (max-width: 768px) {
                    .editor-sidebar { width: 100% !important; min-width: 100% !important; max-height: 50vh !important; border-right: none !important; border-bottom: 1px solid var(--border-default); }
                    .editor-content { padding: 16px !important; }
                    .editor-header { padding: 12px 16px !important; flex-wrap: wrap !important; gap: 8px !important; }
                    .editor-header-title { width: 100% !important; max-width: 100% !important; }
                    .editor-section-grid { grid-template-columns: 1fr !important; }
                }
                @media (min-width: 769px) and (max-width: 1024px) {
                    .editor-sidebar { width: 280px !important; min-width: 280px !important; }
                    .editor-content { padding: 24px !important; }
                }
            `}</style>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <header className="editor-header" style={{ padding: '16px 32px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <BackButton href="/teacher/lessons" label="" className="flex items-center text-[#636678] hover:text-[#dde0ed] transition-colors" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Tên bài giảng</span>
                        <input className="editor-header-title"
                            value={lesson.title}
                            onChange={(e) => { const u = { ...lesson, title: e.target.value }; setLesson(u); persist(u); }}
                            placeholder="Nhập tên bài giảng..."
                            style={{ background: 'transparent', border: 'none', borderBottom: '2px solid var(--brand-primary)', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 800, width: '420px', outline: 'none', paddingBottom: '4px' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={togglePublish}
                        style={{ background: lesson.is_published ? 'rgba(16,185,129,0.15)' : 'var(--bg-elevated)', color: lesson.is_published ? 'var(--brand-primary)' : 'var(--text-muted)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontFamily: 'inherit' }}>
                        {lesson.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                        {lesson.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                    </button>
                    <button onClick={handleSaveLesson} disabled={saving}
                        style={{ background: 'var(--brand-primary)', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '10px', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontFamily: 'inherit' }}>
                        {saving ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} /> : <Save size={18} />} Lưu bài giảng
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div className="editor-sidebar" style={{ width: '340px', minWidth: '340px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Ảnh Thumbnail</p>
                        <div style={{ width: '100%', height: '140px', background: 'var(--bg-elevated)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', border: '1px dashed var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {lesson.thumbnail_url
                                ? <img src={lesson.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                : <Upload size={28} color="var(--text-muted)" />}
                        </div>
                        <input placeholder="Dán URL ảnh thumbnail..." value={lesson.thumbnail_url || ''}
                            onChange={(e) => { const u = { ...lesson, thumbnail_url: e.target.value }; setLesson(u); persist(u); }}
                            style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }} />
                        <textarea placeholder="Mô tả bài học..." value={lesson.description || ''}
                            onChange={(e) => { const u = { ...lesson, description: e.target.value }; setLesson(u); persist(u); }}
                            style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box', marginTop: '8px', height: '72px', resize: 'none' }} />

                        <div style={{ marginTop: '14px' }}>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Đăng vào mục</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button onClick={() => { const u = { ...lesson, category: 'textbook' }; setLesson(u); persist(u); }} style={{
                                    padding: '10px 8px', borderRadius: '10px', border: `2px solid ${(lesson.category || 'extended') === 'textbook' ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                                    background: (lesson.category || 'extended') === 'textbook' ? 'rgba(59,130,246,0.15)' : 'transparent',
                                    color: (lesson.category || 'extended') === 'textbook' ? 'var(--accent-blue)' : 'var(--text-muted)',
                                    cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s', fontFamily: 'inherit'
                                }}>
                                    Sách Giáo Khoa
                                </button>
                                <button onClick={() => { const u = { ...lesson, category: 'extended' }; setLesson(u); persist(u); }} style={{
                                    padding: '10px 8px', borderRadius: '10px', border: `2px solid ${(lesson.category || 'extended') === 'extended' ? 'var(--accent-amber)' : 'var(--border-default)'}`,
                                    background: (lesson.category || 'extended') === 'extended' ? 'rgba(245,158,11,0.15)' : 'transparent',
                                    color: (lesson.category || 'extended') === 'extended' ? 'var(--accent-amber)' : 'var(--text-muted)',
                                    cursor: 'pointer', fontWeight: 700, fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s', fontFamily: 'inherit'
                                }}>
                                    Kiến Thức Mở Rộng
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                            <p style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Nguồn tài liệu</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tên nguồn (VD: Wikipedia)</label>
                                    <input placeholder="Nhập tên nguồn..." value={lesson.source_name || ''}
                                        onChange={(e) => { const u = { ...lesson, source_name: e.target.value }; setLesson(u); persist(u); }}
                                        style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Link nguồn (URL)</label>
                                    <input placeholder="https://..." value={lesson.source_url || ''}
                                        onChange={(e) => { const u = { ...lesson, source_url: e.target.value }; setLesson(u); persist(u); }}
                                        style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                        </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <p style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Lớp học</p>
                                <button onClick={() => setShowClassPicker(!showClassPicker)}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit' }}>
                                    {showClassPicker ? 'Thu gọn' : selectedClassIds.length > 0 ? `Đã chọn ${selectedClassIds.length} lớp` : 'Chọn lớp'}
                                </button>
                            </div>
                            {showClassPicker && (
                                <div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                                        {classes.length === 0 ? (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chưa có lớp học nào. Tạo lớp bên dưới.</p>
                                        ) : classes.map(cls => (
                                            <label key={cls.code} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', background: selectedClassIds.includes(cls.code) ? 'rgba(59,130,246,0.1)' : 'transparent', transition: 'background 0.2s', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                                <input type="checkbox" checked={selectedClassIds.includes(cls.code)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedClassIds(prev => [...prev, cls.code]);
                                                        else setSelectedClassIds(prev => prev.filter(id => id !== cls.code));
                                                    }}
                                                    style={{ accentColor: 'var(--accent-blue)', width: '16px', height: '16px', cursor: 'pointer' }} />
                                                <span>{cls.name}</span>
                                                <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg-base)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{cls.code}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-default)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <input placeholder="Mã lớp (VD: 10A1)" value={newClassCode} onChange={e => setNewClassCode(e.target.value)}
                                                style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '7px 10px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }} />
                                            <input placeholder="Tên lớp (VD: 10A1)" value={newClassName} onChange={e => setNewClassName(e.target.value)}
                                                style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '7px 10px', color: 'var(--text-primary)', fontSize: '12px', boxSizing: 'border-box' }} />
                                            <button onClick={addNewClass}
                                                style={{ background: 'var(--brand-primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!showClassPicker && selectedClassIds.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {classes.filter(c => selectedClassIds.includes(c.code)).map(cls => (
                                        <span key={cls.code} style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', borderRadius: '99px', fontWeight: 600 }}>{cls.name}</span>
                                    ))}
                                </div>
                            )}
                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                Học sinh nhập đúng <strong>mã lớp</strong> này trong màn "Bài Giảng Từ Giáo Viên" để xem bài.
                            </p>
                        </div>

                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)' }}>
                        {['content', 'books'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                flex: 1, padding: '12px', background: activeTab === tab ? 'rgba(var(--brand-primary-rgb),0.05)' : 'transparent',
                                color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-muted)', border: 'none',
                                borderBottom: activeTab === tab ? '2px solid var(--brand-primary)' : '2px solid transparent',
                                fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit'
                            }}>{tab === 'content' ? 'Nội dung' : 'Sách & Tài liệu'}</button>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        {activeTab === 'content' ? (
                            <>
                                {lesson.sections.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Chưa có nội dung. Thêm phần đầu tiên bên dưới.</p>}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {lesson.sections.map(s => (
                                        <div key={s.id} onClick={() => { setActiveSectionId(s.id); }}
                                            style={{ padding: '10px 14px', borderRadius: '10px', background: activeSectionId === s.id ? 'rgba(var(--brand-primary-rgb),0.1)' : 'transparent', border: activeSectionId === s.id ? '1px solid var(--brand-primary)' : '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}>
                                            <GripVertical size={14} color="var(--text-muted)" />
                                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0 }}>
                                                {s.type === 'video' && <Video size={14} />}
                                                {s.type === 'text' && <FileText size={14} />}
                                                {s.type === 'image' && <ImageIcon size={14} />}
                                                {s.type === 'pdf' && <FileSearch size={14} />}{s.type === 'embed' && <Code size={14} />}
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: activeSectionId === s.id ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</p>
                                                <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {[['video', <Video size={13} />, '+Video'], ['text', <FileText size={13} />, '+Chữ'], ['image', <ImageIcon size={13} />, '+Ảnh'], ['pdf', <FileSearch size={13} />, '+PDF'], ['embed', <Code size={13} />, '+Nhúng']].map(([type, icon, label]) => (
                                        <button key={type} onClick={() => addSection(type)} style={{ padding: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}>
                                            {icon} {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(lesson.books || []).map(book => (
                                    <div key={book.id} style={{ padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '10px', display: 'flex', gap: '10px' }}>
                                        <img src={book.cover_image_url} style={{ width: '36px', height: '52px', borderRadius: '4px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                                        <div style={{ flex: 1 }}>
                                            <input value={book.title} onChange={e => updateBook(book.id, 'title', e.target.value)}
                                                style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '5px 8px', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '4px', boxSizing: 'border-box' }} />
                                            <input placeholder="URL ảnh bìa" value={book.cover_image_url} onChange={e => updateBook(book.id, 'cover_image_url', e.target.value)}
                                                style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '5px 8px', color: 'var(--text-primary)', fontSize: '11px', marginBottom: '4px', boxSizing: 'border-box' }} />
                                            <input placeholder="URL Google Drive PDF" value={book.drive_embed_url} onChange={e => updateBook(book.id, 'drive_embed_url', e.target.value)}
                                                style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '5px 8px', color: 'var(--text-primary)', fontSize: '11px', boxSizing: 'border-box' }} />
                                            <button onClick={() => deleteBook(book.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', cursor: 'pointer', padding: 0, marginTop: '4px', fontFamily: 'inherit' }}>Xóa</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addBook} style={{ width: '100%', padding: '12px', background: 'rgba(var(--brand-primary-rgb),0.08)', color: 'var(--brand-primary)', border: '1px dashed rgba(var(--brand-primary-rgb),0.4)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
                                    + Thêm sách mới
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="editor-content" style={{ flex: 1, overflowY: 'auto', padding: '40px', background: 'var(--bg-base)' }}>
                    {activeSection ? (
                        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                                <h2 style={{ margin: 0, color: 'var(--brand-primary)', fontSize: '20px', fontWeight: 800 }}>Phần: {activeSection.type.toUpperCase()}</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => saveSection(activeSection)} style={{ background: 'rgba(var(--brand-primary-rgb),0.1)', color: 'var(--brand-primary)', border: '1px solid rgba(var(--brand-primary-rgb),0.3)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}>Lưu phần này</button>
                                    <button onClick={() => deleteSection(activeSection.id)} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit' }}>Xóa</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '360px' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tiêu đề phần</label>
                                    <input value={activeSection.title} onChange={(e) => updateSectionLocal({ ...activeSection, title: e.target.value })} style={inputStyle} />
                                </div>

                                {activeSection.type === 'video' && <>
                                    <div>
                                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Link YouTube</label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input placeholder="https://www.youtube.com/watch?v=..." value={activeSection.content} onChange={(e) => updateSectionLocal({ ...activeSection, content: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                                            {activeSection.content && (
                                                isValidYouTubeUrl(activeSection.content)
                                                    ? <CheckCircle size={20} color="#00d4aa" />
                                                    : <AlertCircle size={20} color="#ef4444" />
                                            )}
                                        </div>
                                        {activeSection.content && !isValidYouTubeUrl(activeSection.content) && (
                                            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                                                Link YouTube không hợp lệ. Hỗ trợ: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/..., youtube.com/live/...
                                            </p>
                                        )}
                                    </div>
                                    {isValidYouTubeUrl(activeSection.content) && (
                                        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '16px', overflow: 'hidden' }}>
                                            <iframe src={getYouTubeEmbed(activeSection.content)} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                                        </div>
                                    )}
                                </>}

                                {activeSection.type === 'text' && (
                                    <div className="editor-section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Markdown</label>
                                            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                                {[
                                                    { icon: <ImageIcon size={14} />, label: 'Ảnh', getText: () => { const u = prompt('URL hình ảnh:'); return u ? `![Image](${u})` : null; } },
                                                    { icon: <Video size={14} />, label: 'Video', getText: () => { const u = prompt('URL YouTube:'); return u ? `<div class="video-embed">${u}</div>` : null; } },
                                                    { icon: <FileSearch size={14} />, label: 'PDF', getText: () => { const u = prompt('URL Google Drive PDF:'); return u ? `<div class="pdf-embed">${u}</div>` : null; } },
                                                ].map(({ icon, label, getText }) => (
                                                    <button key={label} type="button" onClick={() => { const t = getText(); if (t) insertAtCursor(t); }}
                                                        style={{ padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontFamily: 'inherit' }}>
                                                        {icon} {label}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea ref={textEditorRef} value={activeSection.content} onChange={(e) => updateSectionLocal({ ...activeSection, content: e.target.value })}
                                                style={{ ...inputStyle, height: '360px', fontFamily: 'monospace', resize: 'vertical' }}
                                                placeholder="## Tiêu đề" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Xem trước</label>
                                            <div style={{ height: '360px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px', overflowY: 'auto' }}>
                                                <SimpleMarkdown text={activeSection.content} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection.type === 'image' && <>
                                    <div>
                                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>URL Ảnh</label>
                                        <input value={activeSection.content} onChange={(e) => updateSectionLocal({ ...activeSection, content: e.target.value })} style={inputStyle} placeholder="https://..." />
                                    </div>
                                    {activeSection.content && <img src={activeSection.content} style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid var(--border-default)' }} onError={e => e.target.style.display = 'none'} />}
                                </>}

                                {activeSection.type === 'pdf' && <>
                                    <div style={{ background: 'rgba(var(--brand-primary-rgb),0.05)', border: '1px solid rgba(var(--brand-primary-rgb),0.15)', borderRadius: '12px', padding: '16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Hướng dẫn lấy link Drive: Vào Google Drive  Chuột phải file PDF  <em>Chia sẻ</em>  Sao chép link  Dán vào ô bên dưới
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Google Drive URL</label>
                                        <input placeholder="https://drive.google.com/file/d/FILE_ID/view" value={activeSection.content} onChange={(e) => updateSectionLocal({ ...activeSection, content: e.target.value })} style={inputStyle} />
                                    </div>
                                    {getPdfEmbedUrl(activeSection.content) && (
                                        <div style={{ width: '100%', height: '500px', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                                            <iframe src={getPdfEmbedUrl(activeSection.content)} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay" />
                                        </div>
                                    )}
                                </>}

                                {activeSection.type === 'embed' && <>
                                    <div style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '12px', padding: '16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Dán mã nhúng (iframe) từ Google Slides, Canva, Genially,... 
                                        Ví dụ: <code>{'<iframe src="https://..." width="100%" height="400px"></iframe>'}</code>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mã nhúng (Embed Code)</label>
                                        <textarea value={activeSection.content} onChange={(e) => updateSectionLocal({ ...activeSection, content: e.target.value })}
                                            style={{ ...inputStyle, height: '140px', fontFamily: 'monospace', resize: 'vertical' }}
                                            placeholder='<iframe src="https://www.canva.com/..." width="100%" height="400px"></iframe>' />
                                    </div>
                                    {activeSection.content && (
                                        <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
                                            <div dangerouslySetInnerHTML={{ __html: activeSection.content }} />
                                        </div>
                                    )}
                                </>}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '16px' }}>
                            <PlusCircle size={64} />
                            <p style={{ fontSize: '16px' }}>Chọn hoặc thêm mới một phần nội dung ở bên trái</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
