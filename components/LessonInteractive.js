'use client';
import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Trophy } from 'lucide-react';
import LessonComments from './LessonComments';

// ── BADGES ────────────────────────────────────────────────────────────────────
const BADGE_DEFS = [
    { id: 'first', icon: '🎯', name: 'Bước Đầu', desc: 'Hoàn thành bài đầu tiên', req: 1 },
    { id: 'five', icon: '🔥', name: 'Học Sinh Chăm', desc: 'Hoàn thành 5 bài', req: 5 },
    { id: 'ten', icon: '⚡', name: 'Chiến Binh', desc: 'Hoàn thành 10 bài', req: 10 },
    { id: 'twenty', icon: '🏆', name: 'Bậc Thầy', desc: 'Hoàn thành 20 bài', req: 20 },
];

export function BadgesPanel({ completedCount }) {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Trophy size={22} color="#f59e0b" />
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Huy Hiệu Thành Tích</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '16px' }}>
                {BADGE_DEFS.map(b => {
                    const earned = completedCount >= b.req;
                    return (
                        <div key={b.id} style={{ background: earned ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${earned ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', padding: '20px', textAlign: 'center', opacity: earned ? 1 : 0.4, transition: 'all 0.3s' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px', filter: earned ? 'none' : 'grayscale(1)' }}>{b.icon}</div>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 800, color: earned ? '#f59e0b' : '#4b5563' }}>{b.name}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#4b5563' }}>{b.desc}</p>
                            {earned && <div style={{ marginTop: '8px', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>✅ Đã đạt được!</div>}
                            {!earned && <div style={{ marginTop: '8px', fontSize: '11px', color: '#4b5563' }}>Cần {b.req - completedCount} bài nữa</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── FLASHCARD ─────────────────────────────────────────────────────────────────
function FlashcardPanel({ lessonId, lessonTitle, sections }) {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [generated, setGenerated] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/lesson-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonTitle, sections, type: 'flashcard' })
            });
            const json = await res.json();
            if (json.data) { setCards(json.data); setGenerated(true); setIdx(0); setFlipped(false); }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    if (!generated) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '60px 0' }}>
            <div style={{ fontSize: '64px' }}>🃏</div>
            <h3 style={{ margin: 0 }}>Flashcard Ôn Tập</h3>
            <p style={{ color: '#4b5563', textAlign: 'center', maxWidth: '400px' }}>AI sẽ phân tích nội dung bài học và tạo thẻ ôn tập phù hợp với bài này.</p>
            <button onClick={generate} disabled={loading} style={{ padding: '14px 36px', background: '#00f3ff', color: '#050a14', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loading ? <><Loader2 className="animate-spin" size={18} /> Đang phân tích bài...</> : '✨ Tạo Flashcard từ bài học'}
            </button>
        </div>
    );

    const card = cards[idx];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <p style={{ color: '#4b5563', fontSize: '13px' }}>Thẻ {idx + 1} / {cards.length}</p>
            <div onClick={() => setFlipped(f => !f)} style={{ width: '100%', maxWidth: '520px', minHeight: '220px', background: flipped ? 'rgba(0,243,255,0.08)' : 'rgba(255,255,255,0.04)', border: `2px solid ${flipped ? '#00f3ff' : 'rgba(255,255,255,0.08)'}`, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '32px', textAlign: 'center', transition: 'all 0.3s' }}>
                <div>
                    <p style={{ fontSize: '11px', color: flipped ? '#00f3ff' : '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>{flipped ? 'Giải thích' : 'Khái niệm'}</p>
                    <p style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.5, margin: 0 }}>{flipped ? card.back : card.front}</p>
                    <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '16px' }}>👆 Click để lật thẻ</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={() => { setIdx(i => Math.max(0, i-1)); setFlipped(false); }} disabled={idx === 0} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', cursor: 'pointer' }}><ChevronLeft size={18} /></button>
                <button onClick={() => { setIdx(0); setFlipped(false); setGenerated(false); }} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #4b5563', borderRadius: '10px', color: '#8899a6', cursor: 'pointer' }}><RotateCcw size={16} /></button>
                <button onClick={() => { setIdx(i => Math.min(cards.length-1, i+1)); setFlipped(false); }} disabled={idx === cards.length-1} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', cursor: 'pointer' }}><ChevronRight size={18} /></button>
            </div>
        </div>
    );
}

// ── QUIZ ──────────────────────────────────────────────────────────────────────
function QuizPanel({ lessonTitle, sections }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [generated, setGenerated] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/lesson-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonTitle, sections, type: 'quiz' })
            });
            const json = await res.json();
            if (json.data) { setQuestions(json.data); setGenerated(true); setAnswers({}); setSubmitted(false); }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    if (!generated) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '60px 0' }}>
            <div style={{ fontSize: '64px' }}>🧠</div>
            <h3 style={{ margin: 0 }}>Quiz Kiểm Tra Hiểu Bài</h3>
            <p style={{ color: '#4b5563', textAlign: 'center', maxWidth: '400px' }}>AI sẽ tạo câu hỏi DỰA TRÊN nội dung bài học này, không bịa câu hỏi không liên quan.</p>
            <button onClick={generate} disabled={loading} style={{ padding: '14px 36px', background: '#00f3ff', color: '#050a14', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loading ? <><Loader2 className="animate-spin" size={18} /> AI đang tạo câu hỏi...</> : '🤖 Tạo Quiz từ bài học'}
            </button>
        </div>
    );

    const score = submitted ? questions.filter((q, i) => answers[i] === q.correctIndex).length : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {submitted && (
                <div style={{ background: score >= questions.length * 0.7 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${score >= questions.length * 0.7 ? '#10b981' : '#f59e0b'}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{score >= questions.length * 0.7 ? '🎉' : '💪'}</p>
                    <p style={{ fontWeight: 800, fontSize: '1.3rem', margin: '0 0 4px 0' }}>{score}/{questions.length} câu đúng</p>
                    <p style={{ color: '#4b5563', margin: 0 }}>{score >= questions.length * 0.7 ? 'Xuất sắc! Bạn đã nắm vững bài.' : 'Hãy ôn lại và thử lại nhé!'}</p>
                </div>
            )}
            {questions.map((q, qi) => {
                const chosen = answers[qi];
                const isCorrect = chosen === q.correctIndex;
                return (
                    <div key={qi} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                        <p style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Câu {qi+1}: {q.question}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.options.map((opt, oi) => {
                                let bg = 'rgba(255,255,255,0.03)', border = 'rgba(255,255,255,0.06)', color = '#e0e6ed';
                                if (submitted) {
                                    if (oi === q.correctIndex) { bg = 'rgba(16,185,129,0.1)'; border = '#10b981'; color = '#10b981'; }
                                    else if (chosen === oi) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; color = '#f87171'; }
                                } else if (chosen === oi) { bg = 'rgba(0,243,255,0.1)'; border = '#00f3ff'; color = '#00f3ff'; }
                                return (
                                    <button key={oi} disabled={submitted} onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                                        style={{ padding: '12px 16px', background: bg, border: `1px solid ${border}`, borderRadius: '10px', color, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', fontWeight: chosen === oi ? 700 : 400, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                                        {submitted && oi === q.correctIndex && <CheckCircle size={16} />}
                                        {submitted && chosen === oi && oi !== q.correctIndex && <XCircle size={16} />}
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {submitted && q.explanation && (
                            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,243,255,0.05)', borderRadius: '10px', fontSize: '13px', color: '#8899a6', borderLeft: '3px solid #00f3ff' }}>
                                💡 {q.explanation}
                            </div>
                        )}
                    </div>
                );
            })}
            {!submitted ? (
                <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length}
                    style={{ padding: '14px', background: '#00f3ff', color: '#050a14', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '15px' }}>
                    Nộp bài ({Object.keys(answers).length}/{questions.length} câu)
                </button>
            ) : (
                <button onClick={() => { setGenerated(false); setAnswers({}); setSubmitted(false); }} style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    🔄 Tạo quiz mới
                </button>
            )}
        </div>
    );
}

// ── Main Tabs Component ───────────────────────────────────────────────────────
export default function LessonInteractive({ lessonId, lessonTitle, sections, completedCount }) {
    const [tab, setTab] = useState('flashcard');
    const tabs = [
        { key: 'flashcard', label: '🃏 Flashcard' },
        { key: 'quiz', label: '🧠 Quiz AI' },
        { key: 'badges', label: '🏆 Huy Hiệu' },
        { key: 'comments', label: '💬 Thảo Luận' },
    ];
    return (
        <div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 20px', background: tab === t.key ? 'rgba(0,243,255,0.08)' : 'transparent', color: tab === t.key ? '#00f3ff' : '#4b5563', border: 'none', borderBottom: tab === t.key ? '2px solid #00f3ff' : '2px solid transparent', cursor: 'pointer', fontWeight: 700, fontSize: '13px', borderRadius: '0', transition: 'all 0.2s' }}>
                        {t.label}
                    </button>
                ))}
            </div>
            {tab === 'flashcard' && <FlashcardPanel lessonId={lessonId} lessonTitle={lessonTitle} sections={sections} />}
            {tab === 'quiz' && <QuizPanel lessonTitle={lessonTitle} sections={sections} />}
            {tab === 'badges' && <BadgesPanel completedCount={completedCount} />}
            {tab === 'comments' && <LessonComments lessonId={lessonId} />}
        </div>
    );
}
