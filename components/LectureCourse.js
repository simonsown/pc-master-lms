'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    BookOpen, Video, FileText, Image as ImageIcon, FileSearch, Code,
    Loader2, ArrowLeft, Book, Maximize2, X, Clock, CheckCircle, Circle,
    GraduationCap, Lightbulb, ChevronRight, Sparkles, Play, Trophy,
    BookMarked, Flame, Star, Compass
} from 'lucide-react';
import { BadgesPanel } from './LessonInteractive';
import NotificationBar from './NotificationBar';
import LessonComments from './LessonComments';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

function SimpleMarkdown({ text }) {
    const html = (text || '')
        .replace(/^## (.+)$/gm, '<h2 style="color:#2563EB;font-size:1.25rem;margin:20px 0 10px;font-weight:700">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 style="color:#2563EB;font-size:1.6rem;margin:24px 0 12px;font-weight:800">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0F172A">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li style="margin:6px 0">$1</li>')
        .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: '#475569', lineHeight: 1.8 }} />;
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
const getPdfEmbedUrl = (url) => {
    if (!url) return '';
    const id = url.match(/\/d\/(.+?)\/(?:view|preview)/)?.[1];
    if (id) {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
        return `https://docs.google.com/viewer?url=${encodeURIComponent(downloadUrl)}&embedded=true`;
    }
    return url;
};
const parseRichContent = (content) => {
    const parts = [];
    const regex = /<div class="(video-embed|pdf-embed)">([\s\S]*?)<\/div>/g;
    let lastIndex = 0, match;
    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) parts.push({ type: 'markdown', content: content.substring(lastIndex, match.index) });
        parts.push({ type: match[1] === 'video-embed' ? 'video' : 'pdf', url: match[2].trim() });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) parts.push({ type: 'markdown', content: content.substring(lastIndex) });
    if (parts.length === 0) parts.push({ type: 'markdown', content });
    return parts;
};

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
            const mappedSections = (s || []).map(section => ({
                ...section,
                type: section.content_type,
                content: section.content_url || section.content_body
            }));
            const { data: b } = await supabase.from('lesson_books').select('*').eq('lesson_id', lesson.id);
            setSections(mappedSections);
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
        <div className="flex h-full overflow-hidden bg-slate-50">
            {/* Left sidebar: section nav */}
            <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="w-[240px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto p-5 shadow-sm"
            >
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} /> Quay lại
                </motion.button>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Nội dung bài</h4>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-blue-600" size={20} />
                    </div>
                ) : (
                    <nav className="flex flex-col gap-1">
                        {sections.map((s, i) => (
                            <a
                                key={s.id}
                                href={`#sec-${s.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700 text-sm font-medium transition-all no-underline group"
                            >
                                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-extrabold group-hover:bg-blue-200 transition-colors shrink-0">
                                    {i + 1}
                                </span>
                                <span className="truncate">{s.title}</span>
                            </a>
                        ))}
                    </nav>
                )}

                <div className="mt-auto pt-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleComplete}
                        disabled={completing}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border ${
                            isCompleted
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                        }`}
                    >
                        {completing ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : isCompleted ? (
                            <><CheckCircle size={16} /> Đã hoàn thành</>
                        ) : (
                            <><Circle size={16} /> Đánh dấu hoàn thành</>
                        )}
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-8 py-8">
                    {lesson.thumbnail_url && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full h-[260px] rounded-2xl overflow-hidden mb-8 shadow-lg"
                        >
                            <img src={lesson.thumbnail_url} className="w-full h-full object-cover" />
                        </motion.div>
                    )}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-between items-start mb-6"
                    >
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{lesson.title}</h1>
                            {lesson.description && (
                                <p className="text-slate-500 text-base leading-relaxed">{lesson.description}</p>
                            )}
                        </div>
                        {isCompleted && (
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-sm font-bold border border-emerald-200 shrink-0">
                                <CheckCircle size={16} /> Đã hoàn thành
                            </div>
                        )}
                    </motion.div>
                    <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full mb-10" />

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col gap-12"
                        >
                            {sections.map(s => (
                                <motion.section key={s.id} id={`sec-${s.id}`} variants={itemVariants}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                                            {s.type === 'video' && <Video size={18} />}
                                            {s.type === 'text' && <FileText size={18} />}
                                            {s.type === 'image' && <ImageIcon size={18} />}
                                            {s.type === 'pdf' && <FileSearch size={18} />}
                                            {s.type === 'embed' && <Code size={18} />}
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">{s.title}</h2>
                                    </div>
                                    {s.type === 'video' && getYouTubeEmbed(s.content) && (
                                        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
                                            <iframe src={getYouTubeEmbed(s.content)} className="w-full h-full border-none" allowFullScreen />
                                        </div>
                                    )}
                                    {s.type === 'text' && (
                                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                                            {parseRichContent(s.content).map((part, i) => {
                                                if (part.type === 'video') {
                                                    const embedUrl = getYouTubeEmbed(part.url);
                                                    return embedUrl ? (
                                                        <div key={i} className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 my-4 shadow-lg">
                                                            <iframe src={embedUrl} className="w-full h-full border-none" allowFullScreen title="Video" />
                                                        </div>
                                                    ) : null;
                                                }
                                                if (part.type === 'pdf') {
                                                    const embedUrl = getPdfEmbedUrl(part.url);
                                                    return embedUrl ? (
                                                        <div key={i} className="rounded-xl overflow-hidden border border-slate-200 my-4">
                                                            <iframe src={embedUrl} className="w-full h-[540px] border-none" allow="autoplay" title="PDF" />
                                                        </div>
                                                    ) : null;
                                                }
                                                return <SimpleMarkdown key={i} text={part.content} />;
                                            })}
                                        </div>
                                    )}
                                    {s.type === 'image' && s.content && (
                                        <div className="rounded-2xl overflow-hidden shadow-lg">
                                            <img src={s.content} className="w-full h-auto block" />
                                        </div>
                                    )}
                                    {s.type === 'pdf' && getPdfEmbedUrl(s.content) && (
                                        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                                            <iframe src={getPdfEmbedUrl(s.content)} className="w-full h-[540px] border-none" allow="autoplay" />
                                            <div className="px-6 py-3 flex justify-end border-t border-slate-100">
                                                <a href={s.content} target="_blank" className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-2 no-underline transition-colors">
                                                    <Maximize2 size={14} /> Toàn màn hình
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {s.type === 'embed' && s.content && (
                                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                            <div dangerouslySetInnerHTML={{ __html: s.content }} />
                                        </div>
                                    )}
                                </motion.section>
                            ))}
                        </motion.div>
                    )}

                    {/* Video mở rộng */}
                    {(() => {
                        const EXTRA_VIDEOS = {
                            'cpu': [{ title: 'CPU là gì? - Giải thích chi tiết', id: 'cWzB7GvN6vs' }, { title: 'Cách chọn CPU phù hợp', id: '7j3I7X7Gz6M' }],
                            'mainboard': [{ title: 'Bo mạch chủ là gì?', id: 'Q_sBq0-iV4I' }],
                            'ram': [{ title: 'RAM là gì? DDR4 vs DDR5', id: 'qTQ7vg1JFDA' }],
                            'gpu': [{ title: 'Card đồ họa hoạt động thế nào?', id: 'OQ6fMGMiVPE' }],
                            'ổ cứng': [{ title: 'SSD vs HDD - Nên chọn loại nào?', id: 'YQEjGKYXjw8' }],
                            'nguồn': [{ title: 'Nguồn máy tính - Hướng dẫn chọn', id: 'Pco0vPjV0wk' }],
                            'case': [{ title: 'Case máy tính - Các loại và cách chọn', id: 'O8HQzP3QwL8' }],
                        }
                        const matchKey = Object.keys(EXTRA_VIDEOS).find(k => lesson.title?.toLowerCase().includes(k))
                        const videos = matchKey ? EXTRA_VIDEOS[matchKey] : null
                        if (!videos) return null
                        return (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mt-16 pt-10 border-t border-slate-200"
                            >
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <Sparkles size={22} className="text-amber-500" /> Video kiến thức mở rộng
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {videos.map((v, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ y: -4 }}
                                            className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all"
                                        >
                                            <div className="aspect-video">
                                                <iframe src={`https://www.youtube-nocookie.com/embed/${v.id}`} className="w-full h-full border-none" allowFullScreen title={v.title} loading="lazy" />
                                            </div>
                                            <div className="p-4">
                                                <p className="text-slate-800 font-semibold text-sm">{v.title}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )
                    })()}

                    {/* Books */}
                    {books.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-16 pt-10 border-t border-slate-200"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <Book size={22} className="text-blue-600" /> Sách & Tài liệu
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {books.map(book => (
                                    <motion.div
                                        key={book.id}
                                        whileHover={{ y: -6, scale: 1.02 }}
                                        onClick={() => setSelectedBook(book)}
                                        className="bg-white rounded-xl p-4 border border-slate-200 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all"
                                    >
                                        {book.cover_image_url && (
                                            <img src={book.cover_image_url} className="w-full aspect-[3/4] object-cover rounded-lg mb-3 shadow-sm" />
                                        )}
                                        <p className="text-sm font-bold text-slate-800 text-center line-clamp-2">{book.title}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Bottom complete button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 pt-10 border-t border-slate-200 flex justify-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleComplete}
                            disabled={completing}
                            className={`px-12 py-4 rounded-2xl font-extrabold text-lg flex items-center gap-3 transition-all border-2 ${
                                isCompleted
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-300 shadow-lg shadow-emerald-100'
                                    : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200'
                            }`}
                        >
                            {completing ? (
                                <Loader2 className="animate-spin" size={22} />
                            ) : isCompleted ? (
                                <><CheckCircle size={22} /> Đã hoàn thành bài này!</>
                            ) : (
                                <><Circle size={22} /> Đánh dấu hoàn thành bài học</>
                            )}
                        </motion.button>
                    </motion.div>

                    {!loading && (
                        <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col gap-12">
                            <BadgesPanel completedCount={completedCount} />
                            <LessonComments lessonId={lesson.id} />
                        </div>
                    )}
                </div>
            </div>

            {/* Book Modal */}
            <AnimatePresence>
                {selectedBook && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-[2000] flex flex-col"
                    >
                        <div className="px-6 py-4 flex justify-between items-center bg-slate-900 border-b border-slate-700">
                            <h3 className="text-white font-bold text-lg truncate">{selectedBook.title}</h3>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                onClick={() => setSelectedBook(null)}
                                className="bg-slate-800 hover:bg-slate-700 border-none text-white p-2 rounded-xl cursor-pointer transition-colors"
                            >
                                <X size={24} />
                            </motion.button>
                        </div>
                        <div className="flex-1">
                            <iframe src={getDriveEmbed(selectedBook.drive_embed_url)} className="w-full h-full border-none" allow="autoplay" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Lesson Card ──────────────────────────────────────────────────────────────
const DIFFICULTY_COLORS = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
};

function LessonCard({ lesson, isCompleted, onClick }) {
    const diff = lesson.difficulty || 'easy';
    const diffLabel = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }[diff] || 'Dễ';
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`bg-white rounded-2xl overflow-hidden cursor-pointer border-2 transition-all shadow-sm hover:shadow-xl relative ${
                isCompleted ? 'border-emerald-200' : 'border-slate-200 hover:border-blue-300'
            }`}
        >
            {isCompleted && (
                <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <CheckCircle size={12} /> Hoàn thành
                </div>
            )}
            <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
                {lesson.thumbnail_url ? (
                    <img src={lesson.thumbnail_url} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <BookOpen size={40} strokeWidth={1.5} />
                        <span className="text-xs font-medium">{lesson.category === 'textbook' ? 'SGK' : 'MR'}</span>
                    </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${DIFFICULTY_COLORS[diff]}`}>
                        {diffLabel}
                    </span>
                </div>
            </div>
            <div className="p-5">
                <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 leading-snug">{lesson.title}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {lesson.description || 'Nhấn để xem nội dung bài học.'}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Clock size={12} />
                        <span>{new Date(lesson.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <motion.div
                        whileHover={{ x: 4 }}
                        className={`text-xs font-bold flex items-center gap-1 transition-colors ${
                            isCompleted ? 'text-emerald-600' : 'text-blue-600'
                        }`}
                    >
                        {isCompleted ? 'Xem lại' : 'Bắt đầu học'} <ChevronRight size={14} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tabKey, onExplore }) {
    const isTextbook = tabKey === 'textbook';
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6"
        >
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="w-32 h-32 mb-8 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center shadow-lg"
            >
                {isTextbook ? (
                    <BookMarked size={56} className="text-blue-500" strokeWidth={1.5} />
                ) : (
                    <Sparkles size={56} className="text-amber-500" strokeWidth={1.5} />
                )}
            </motion.div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-3">
                {isTextbook ? 'Chưa có sách giáo khoa' : 'Chưa có bài mở rộng'}
            </h3>
            <p className="text-slate-500 text-base text-center max-w-md mb-8 leading-relaxed">
                {isTextbook
                    ? 'Các bài học trong sách giáo khoa sẽ xuất hiện tại đây khi giáo viên cập nhật nội dung.'
                    : 'Bài viết kiến thức mở rộng sẽ được thêm vào để giúp bạn hiểu sâu hơn về các chủ đề Tin học.'
                }
            </p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExplore}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center gap-2"
            >
                <Compass size={18} /> Khám phá lộ trình học
            </motion.button>
        </motion.div>
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
                user ? supabase.from('lesson_progress').select('lesson_id').eq('student_id', user.id) : { data: [] }
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
            await supabase.from('lesson_progress').delete().eq('student_id', userId).eq('lesson_id', lessonId);
            setCompletedIds(prev => { const s = new Set(prev); s.delete(lessonId); return s; });
        } else {
            await supabase.from('lesson_progress').upsert({ student_id: userId, lesson_id: lessonId });
            setCompletedIds(prev => new Set([...prev, lessonId]));
        }
    };

    const tabs = [
        { key: 'textbook', label: lang === 'en' ? 'Textbooks' : 'Sách Giáo Khoa', icon: <GraduationCap size={16} /> },
        { key: 'extended', label: lang === 'en' ? 'Extended' : 'Kiến Thức Mở Rộng', icon: <Lightbulb size={16} /> }
    ];

    if (selectedLesson) {
        return (
            <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
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
    const totalCompleted = completedIds.size;
    const totalLessons = lessons.textbook.length + lessons.extended.length;

    return (
        <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
            <NotificationBar />

            {/* Top bar: breadcrumb + title + badges */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                <button onClick={onBack} className="hover:text-slate-600 transition-colors">
                                    Trang chủ
                                </button>
                                <span>/</span>
                                <span className="text-slate-600 font-medium">Bài giảng</span>
                            </nav>
                            {/* Title */}
                            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                                <BookOpen size={22} className="text-blue-600" />
                                Thư Viện Bài Giảng
                            </h1>
                        </div>
                        {/* Badges */}
                        {userId && (
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                                    📚 {totalLessons} bài học
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                                    ✅ {totalCompleted} hoàn thành
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                                    ⭐ {totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 flex gap-2">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.key;
                        return (
                            <motion.button
                                key={tab.key}
                                layout
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {loading ? '...' : lessons[tab.key].length}
                                </span>
                                {!loading && lessons[tab.key].some(l => completedIds.has(l.id)) && (
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        {lessons[tab.key].filter(l => completedIds.has(l.id)).length}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin text-blue-600" size={44} />
                                <p className="text-slate-500 text-sm font-medium">Đang tải bài giảng...</p>
                            </div>
                        </div>
                    ) : currentLessons.length === 0 ? (
                        <EmptyState
                            tabKey={activeTab}
                            onExplore={() => {
                                const otherKey = activeTab === 'textbook' ? 'extended' : 'textbook';
                                if (lessons[otherKey].length > 0) setActiveTab(otherKey);
                            }}
                        />
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {currentLessons.map(lesson => (
                                    <LessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        isCompleted={completedIds.has(lesson.id)}
                                        onClick={() => setSelectedLesson(lesson)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
