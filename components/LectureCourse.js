'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Cpu, Globe, ShieldAlert, Code, CheckCircle2, 
    ArrowRight, ChevronRight, Share2, Printer, Book, 
    GraduationCap, Layout, HelpCircle, Trophy, BookMarked, Terminal,
    FileText, Layers, XCircle, Info
} from 'lucide-react';

const BOOK_SETS = [
    { id: 'kntt', name: 'Kết nối tri thức', color: '#0284c7' },
    { id: 'cd_khmt', name: 'Cánh diều (KHMT)', color: '#dc2626' },
    { id: 'cd_thud', name: 'Cánh diều (THUD)', color: '#ea580c' }
];

const COURSE_CONTENT = {
    10: {
        kntt: {
            cover: 'https://hanhtrangso.nxbgd.vn/books/images/8/10/tin-hoc-10-kntt.jpg',
            topics: [
                {
                    id: 't1', title: 'Chủ đề 1: Máy tính và xã hội tri thức',
                    lessons: [
                        { id: 'l1.1', title: 'Bài 1: Thông tin và xử lí thông tin', content: 'Thông tin là những gì mang lại hiểu biết cho con người về thế giới xung quanh và về chính mình. Dữ liệu là các số liệu, kí hiệu, hình ảnh, âm thanh... được lưu trữ trong máy tính. Xử lí thông tin là quá trình biến đổi dữ liệu thành thông tin hữu ích thông qua 4 giai đoạn: Thu nhận, Lưu trữ, Biến đổi và Truyền tải.', summary: 'Thông tin mang lại tri thức. Dữ liệu là nguyên liệu thô.', quiz: [{ q: 'Dữ liệu sau khi được xử lý và có ý nghĩa gọi là gì?', options: ['Thông tin', 'Tín hiệu', 'Mã số', 'Tri thức'], correct: 0, explanation: 'Dữ liệu là các ký hiệu chưa có nghĩa, sau khi xử lý để có nghĩa thì gọi là Thông tin.' }] },
                        { id: 'l1.2', title: 'Bài 2: Vai trò của thiết bị thông minh', content: 'Thiết bị thông minh là thiết bị điện tử có khả năng hoạt động tự chủ và kết nối mạng. Đặc điểm: Có bộ xử lý (CPU), cảm biến và khả năng truyền thông. Ví dụ: Smartphone, Smart TV, Robot hút bụi.', summary: 'Thiết bị thông minh làm cuộc sống hiện đại hơn.', quiz: [{ q: 'Thiết bị nào sau đây là thiết bị thông minh?', options: ['Bàn phím cơ', 'Máy tính bỏ túi cũ', 'Smartphone', 'Quạt máy cơ'], correct: 2, explanation: 'Smartphone có bộ vi xử lý và khả năng kết nối mạng linh hoạt, thỏa mãn định nghĩa thiết bị thông minh.' }] },
                        { id: 'l1.3', title: 'Bài 3: Một số thiết bị thông dụng', content: 'Nội dung bài này giới thiệu về cấu tạo cơ bản của máy tính cá nhân, máy tính bảng và các thiết bị ngoại vi hiện đại như máy in 3D, kính VR.', summary: 'Hiểu các thiết bị giúp ta sử dụng hiệu quả hơn.', quiz: [{ q: 'Máy in 3D thuộc loại thiết bị nào?', options: ['Thiết bị vào', 'Thiết bị ra', 'Bộ nhớ', 'Bộ xử lý'], correct: 1, explanation: 'Máy in 3D tạo ra sản phẩm vật lý từ dữ liệu số, nên nó là thiết bị ra.' }] }
                    ]
                },
                { id: 't2', title: 'Chủ đề 2: Mạng máy tính và Internet', lessons: [{ id: 'l2.1', title: 'Bài 4: Mạng máy tính trong cuộc sống', content: 'Nội dung đang cập nhật chi tiết theo SGK...', summary: 'Mạng giúp chia sẻ tài nguyên.', quiz: [{ q: 'Mạng Internet là mạng?', options: ['Toàn cầu', 'Nội bộ', 'Cục bộ', 'Vùng'], correct: 0, explanation: 'Internet là mạng diện rộng toàn cầu (WAN).' }] }] },
                { id: 't3', title: 'Chủ đề 3: Đạo đức, pháp luật và văn hóa số', lessons: [{ id: 'l3.1', title: 'Bài 9: An toàn trên không gian mạng', content: 'Học về cách bảo vệ thông tin cá nhân, phòng chống mã độc và hành vi lừa đảo trực tuyến.', summary: 'Cẩn trọng khi chia sẻ thông tin.', quiz: [{ q: 'Hành vi nào vi phạm đạo đức số?', options: ['Dùng phần mềm lậu', 'Hỏi bài trên mạng', 'Mua hàng online', 'Xem phim'], correct: 0, explanation: 'Sử dụng phần mềm không bản quyền là vi phạm quyền sở hữu trí tuệ.' }] }] },
                { id: 't4', title: 'Chủ đề 4: Ứng dụng tin học (Bảng tính)', lessons: [{ id: 'l4.1', title: 'Bài 12: Phần mềm bảng tính', content: 'Làm quen với Excel: Ô, Hàng, Cột, Công thức cơ bản.', summary: 'Excel giúp quản lý dữ liệu số.', quiz: [{ q: 'Trong Excel, ô A1 nằm ở đâu?', options: ['Hàng A cột 1', 'Cột A hàng 1', 'Cột 1 hàng A', 'Không có ô này'], correct: 1, explanation: 'Địa chỉ ô gồm Tên cột trước, Tên hàng sau.' }] }] }
            ]
        },
        cd_khmt: {
            cover: 'https://sachcanhdieu.com/wp-content/uploads/2022/05/Tin-hoc-10-canh-dieu.jpg',
            topics: [
                { id: 't1', title: 'Chủ đề A: Máy tính và xã hội tri thức', lessons: [{ id: 'cd1.1', title: 'Bài 1: Dữ liệu, thông tin và tri thức', content: 'Sách Cánh Diều tập trung vào tháp tri thức: Dữ liệu -> Thông tin -> Tri thức.', summary: 'Tri thức là sự hiểu biết từ thông tin.', quiz: [{ q: 'Tri thức hình thành từ đâu?', options: ['Từ dữ liệu thô', 'Từ việc xử lý thông tin', 'Từ máy tính', 'Từ Internet'], correct: 1, explanation: 'Thông tin sau khi được con người tiếp nhận và áp dụng sẽ trở thành tri thức.' }] }] }
            ]
        }
    },
    11: {
        kntt: {
            cover: 'https://hanhtrangso.nxbgd.vn/books/images/8/11/tin-hoc-11-kntt.jpg',
            topics: [
                { id: 't1', title: 'Chủ đề 1: Máy tính và xã hội tri thức', lessons: [{ id: 'l11.1', title: 'Bài 1: Hệ điều hành', content: 'Hệ điều hành quản lý tài nguyên máy tính và làm môi trường cho phần mềm ứng dụng.', summary: 'HĐH là cầu nối.', quiz: [{ q: 'Hệ điều hành là gì?', options: ['Phần mềm ứng dụng', 'Phần mềm hệ thống', 'Phần mềm tiện ích', 'Phần cứng'], correct: 1, explanation: 'Hệ điều hành là phần mềm nền tảng quản lý hệ thống.' }] }] }
            ]
        },
        cd_khmt: {
            cover: 'https://sachcanhdieu.com/wp-content/uploads/2023/05/Tin-hoc-11-CD-KHMT.jpg',
            topics: [
                { id: 't1', title: 'Khoa học máy tính (11 - CD)', lessons: [{ id: 'l11cd.1', title: 'Bài 1: Kiến trúc máy tính', content: 'Tìm hiểu sâu về CPU, RAM, Cache và Bus.', summary: 'Phần cứng là nền tảng hiệu năng.', quiz: [{ q: 'Bộ nhớ đệm trong CPU gọi là gì?', options: ['RAM', 'ROM', 'Cache', 'SSD'], correct: 2, explanation: 'Cache là bộ nhớ tốc độ cao nằm trong hoặc gần CPU.' }] }] }
            ]
        },
        cd_thud: {
            cover: 'https://sachcanhdieu.com/wp-content/uploads/2023/05/Tin-hoc-11-CD-THUD.jpg',
            topics: [
                { id: 't1', title: 'Tin học ứng dụng (11 - CD)', lessons: [{ id: 'l11tu.1', title: 'Bài 1: Cơ sở dữ liệu', content: 'Khái niệm về CSDL, Hệ quản trị CSDL và vai trò của chúng trong quản lý.', summary: 'CSDL giúp lưu trữ tập trung.', quiz: [{ q: 'MySQL là loại gì?', options: ['Hệ điều hành', 'Phần mềm văn phòng', 'Hệ quản trị CSDL', 'Trình duyệt'], correct: 2, explanation: 'MySQL là một hệ quản trị cơ sở dữ liệu quan hệ phổ biến.' }] }] }
            ]
        }
    },
    12: {
        kntt: {
            cover: 'https://hanhtrangso.nxbgd.vn/books/images/8/12/tin-hoc-12-kntt.jpg',
            topics: [
                { id: 't1', title: 'Chủ đề 1: Mạng máy tính và Internet', lessons: [{ id: 'l12.1', title: 'Bài 1: Giao thức mạng TCP/IP', content: 'Tìm hiểu về mô hình TCP/IP, địa chỉ IP tĩnh, động và cách Internet vận hành.', summary: 'Giao thức là ngôn ngữ chung của mạng.', quiz: [{ q: 'Tầng nào trong TCP/IP chứa HTTP?', options: ['Tầng mạng', 'Tầng vận chuyển', 'Tầng ứng dụng', 'Tầng vật lý'], correct: 2, explanation: 'HTTP là giao thức bậc cao thuộc tầng Ứng dụng.' }] }] }
            ]
        }
    }
};

const LectureCourse = ({ lang, onBack }) => {
    const [view, setView] = useState('grade'); 
    const [selectedGrade, setSelectedGrade] = useState(10);
    const [selectedBookSet, setSelectedBookSet] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizAnswered, setQuizAnswered] = useState(null); // { selectedIdx, isCorrect }
    const [score, setScore] = useState(0);

    const bookData = useMemo(() => {
        if (!selectedBookSet) return null;
        return COURSE_CONTENT[selectedGrade][selectedBookSet];
    }, [selectedGrade, selectedBookSet]);

    const handleBack = () => {
        if (view === 'result') setView('topics');
        else if (view === 'quiz') setView('lesson');
        else if (view === 'lesson') setView('topics');
        else if (view === 'topics') setView('book');
        else if (view === 'book') setView('grade');
        else onBack();
    };

    const renderHeader = (title) => (
        <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2rem' }}>
            <button onClick={handleBack} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>{title}</h1>
        </header>
    );

    if (view === 'grade') {
        return (
            <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontWeight: 800 }}>{lang === 'en' ? 'Select Your Grade' : 'Chọn Khối Lớp Của Bạn'}</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                    {GRADES.map(g => (
                        <motion.div 
                            key={g} 
                            whileHover={{ y: -10, scale: 1.02 }}
                            onClick={() => { setSelectedGrade(g); setView('book'); }}
                            style={{ 
                                padding: '4rem 2rem', borderRadius: '32px', background: 'var(--bg-surface)', 
                                border: '2px solid var(--border-subtle)', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--brand-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GraduationCap size={40} color="var(--brand-primary)" />
                            </div>
                            <h2 style={{ fontSize: '2rem', margin: 0 }}>LỚP {g}</h2>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    if (view === 'book') {
        const books = Object.keys(COURSE_CONTENT[selectedGrade]);
        return (
            <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
                {renderHeader(`Lớp ${selectedGrade} - Danh Mục Sách`)}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    {books.map(bId => {
                        const book = BOOK_SETS.find(s => s.id === bId);
                        const bookContent = COURSE_CONTENT[selectedGrade][bId];
                        return (
                            <motion.div 
                                key={bId}
                                whileHover={{ scale: 1.03 }}
                                onClick={() => { setSelectedBookSet(bId); setView('topics'); }}
                                style={{ 
                                    background: 'var(--bg-surface)', borderRadius: '24px', overflow: 'hidden',
                                    border: '1px solid var(--border-subtle)', cursor: 'pointer',
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                                }}
                            >
                                <div style={{ height: '420px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img 
                                        src={bookContent.cover} 
                                        alt={book.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=Sách+Tin+Học'; }}
                                    />
                                </div>
                                <div style={{ padding: '1.5rem', borderTop: `4px solid ${book.color}`, background: 'rgba(255,255,255,0.02)' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{book.name}</h3>
                                    <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chương trình mới 2018</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (view === 'topics') {
        return (
            <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                {renderHeader(`Học liệu ${BOOK_SETS.find(s => s.id === selectedBookSet).name}`)}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {bookData.topics.map(topic => (
                        <div key={topic.id} className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: 'var(--brand-light)' }}>
                                <div style={{ background: 'var(--brand-subtle)', padding: '10px', borderRadius: '10px' }}>
                                    <Layers size={22} />
                                </div>
                                <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 700 }}>{topic.title}</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {topic.lessons.map(ls => (
                                    <button 
                                        key={ls.id} 
                                        onClick={() => { setCurrentLesson(ls); setView('lesson'); }}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '1.25rem 1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
                                            cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                                            fontSize: '1rem'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <FileText size={18} color="var(--brand-light)" />
                                            <span>{ls.title}</span>
                                        </div>
                                        <ChevronRight size={18} color="var(--text-muted)" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (view === 'lesson') {
        return (
            <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
                <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '3.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <BookOpen size={16} />
                            <span>BÀI HỌC TRỰC TUYẾN</span>
                        </div>
                        <div style={{ padding: '6px 12px', background: 'var(--brand-subtle)', color: 'var(--brand-light)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>
                            KHỐI {selectedGrade}
                        </div>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '2.5rem', fontWeight: 800, lineHeight: 1.2 }}>{currentLesson.title}</h1>
                    <div style={{ fontSize: '1.25rem', lineHeight: '1.9', color: 'var(--text-secondary)', marginBottom: '3.5rem', whiteSpace: 'pre-line' }}>
                        {currentLesson.content}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="neon-button-sm" onClick={() => { setQuizIndex(0); setQuizAnswered(null); setScore(0); setView('quiz'); }} style={{ flex: 1, padding: '20px' }}>
                            KIỂM TRA KIẾN THỨC
                        </button>
                    </div>
                </motion.article>
            </div>
        );
    }

    if (view === 'quiz') {
        const q = currentLesson.quiz[quizIndex];
        return (
            <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
                <div className="glass-panel" style={{ padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--brand-light)', fontSize: '0.9rem' }}>CÂU HỎI {quizIndex + 1}/{currentLesson.quiz.length}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {currentLesson.quiz.map((_, i) => (
                                <div key={i} style={{ width: '20px', height: '6px', borderRadius: '3px', background: i < quizIndex ? 'var(--brand-primary)' : i === quizIndex ? 'var(--brand-light)' : 'rgba(255,255,255,0.1)' }} />
                            ))}
                        </div>
                    </div>
                    
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '2.5rem', fontWeight: 700 }}>{q.q}</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {q.options.map((opt, i) => {
                            const isSelected = quizAnswered?.selectedIdx === i;
                            const isCorrect = q.correct === i;
                            const showFeedback = quizAnswered !== null;
                            
                            let borderColor = 'var(--border-subtle)';
                            let bgColor = 'rgba(255,255,255,0.03)';
                            
                            if (showFeedback) {
                                if (isCorrect) {
                                    borderColor = 'var(--success)';
                                    bgColor = 'rgba(16, 185, 129, 0.1)';
                                } else if (isSelected) {
                                    borderColor = 'var(--danger)';
                                    bgColor = 'rgba(239, 68, 68, 0.1)';
                                }
                            }

                            return (
                                <button 
                                    key={i} 
                                    disabled={showFeedback}
                                    onClick={() => setQuizAnswered({ selectedIdx: i, isCorrect: i === q.correct })}
                                    style={{ 
                                        padding: '1.5rem', borderRadius: '16px', background: bgColor,
                                        border: `2px solid ${borderColor}`, color: 'var(--text-primary)',
                                        cursor: showFeedback ? 'default' : 'pointer', textAlign: 'left', fontSize: '1.1rem',
                                        display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <span style={{ flex: 1 }}>{opt}</span>
                                    {showFeedback && isCorrect && <CheckCircle2 size={24} color="var(--success)" />}
                                    {showFeedback && isSelected && !isCorrect && <XCircle size={24} color="var(--danger)" />}
                                </button>
                            );
                        })}
                    </div>

                    {quizAnswered && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid var(--brand-subtle)' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', color: quizAnswered.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                                <Info size={18} />
                                <span style={{ fontWeight: 800 }}>{quizAnswered.isCorrect ? 'CHÍNH XÁC!' : 'CHƯA ĐÚNG!'}</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.explanation}</p>
                            
                            <button className="neon-button-sm" onClick={() => {
                                if (quizAnswered.isCorrect) setScore(s => s + 1);
                                if (quizIndex < currentLesson.quiz.length - 1) {
                                    setQuizIndex(q => q + 1);
                                    setQuizAnswered(null);
                                } else {
                                    setView('result');
                                }
                            }} style={{ width: '100%', marginTop: '1.5rem', padding: '15px' }}>
                                {quizIndex < currentLesson.quiz.length - 1 ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ'}
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    if (view === 'result') {
        const pass = score >= currentLesson.quiz.length / 2;
        return (
            <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--brand-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={60} color={pass ? 'var(--warning)' : 'var(--text-muted)'} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>{pass ? 'Hoàn Thành!' : 'Cố Gắng Lên!'}</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Bạn đạt {score}/{currentLesson.quiz.length} điểm chính xác.</p>
                    
                    <div style={{ width: '100%', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', textAlign: 'left', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ color: 'var(--brand-light)', marginBottom: '12px', fontSize: '0.9rem', letterSpacing: '1px' }}>TÓM TẮT KIẾN THỨC:</h4>
                        <p style={{ margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>{currentLesson.summary}</p>
                    </div>
                    
                    <button className="neon-button-sm" onClick={() => setView('topics')} style={{ width: '100%', padding: '20px' }}>
                        QUAY LẠI DANH SÁCH BÀI
                    </button>
                </motion.div>
            </div>
        );
    }
};

export default LectureCourse;
