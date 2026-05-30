'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { QUIZ_BANK } from '../data/quiz-bank';

const TOPIC_MAP = {
  'CPU': ['quiz-cpu-arch'],
  'RAM': ['quiz-ram-deep'],
  'GPU': ['quiz-gpu-advanced'],
  'PSU': ['quiz-psu-cooling', 'quiz-cooling-advanced'],
  'Mainboard': ['quiz-motherboard'],
  'Storage': ['quiz-storage'],
  'SSD': ['quiz-storage'],
  'Computer Case': ['quiz-case'],
  'Cooler': ['quiz-case', 'quiz-cooling-advanced'],
  'general': ['quiz-cpu-arch', 'quiz-ram-deep', 'quiz-gpu-advanced', 'quiz-psu-cooling', 'quiz-motherboard', 'quiz-storage', 'quiz-assembly']
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuestionsForTopic(topic, count = 10) {
  const quizIds = TOPIC_MAP[topic] || TOPIC_MAP['general'];
  let allQuestions = [];
  for (const qid of quizIds) {
    const quiz = QUIZ_BANK.find(q => q.id === qid);
    if (quiz) {
      allQuestions.push(...quiz.questions.map((qq, idx) => ({
        id: `${qid}-${idx}`,
        ...qq
      })));
    }
  }
  if (allQuestions.length === 0) {
    allQuestions = QUIZ_BANK.flatMap(q =>
      q.questions.map((qq, idx) => ({ id: `${q.id}-${idx}`, ...qq }))
    );
  }
  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function formatQuestion(q) {
  const letters = ['A', 'B', 'C', 'D'];
  return {
    question: q.q,
    options: q.options.map((opt, i) => `${letters[i]}. ${opt}`),
    correctAnswer: letters[q.answer],
    explanation: `Đáp án đúng là ${letters[q.answer]}: ${q.options[q.answer]}`
  };
}

const QuizModal = ({ onClose, lang, topic, level, onSuccess, onScore }) => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState(null);
    const [result, setResult] = useState(null);
    const [view, setView] = useState('quiz');

    useEffect(() => {
      const raw = getQuestionsForTopic(topic || 'general', 10);
      const formatted = raw.map(formatQuestion);
      setQuestions(formatted);
      setLoading(false);
    }, [topic]);

    useEffect(() => {
        if (view === 'score') {
            if (onScore) onScore(score);
            const saveResult = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('quiz_results').insert({
                        user_id: user.id,
                        topic: topic,
                        score: score,
                        total: 10,
                        lang: lang
                    });
                }
            };
            saveResult();
        }
    }, [view]);

    const handleAnswer = (option) => {
        if (selectedOption || view === 'score') return;
        setSelectedOption(option);
        const currentQ = questions[currentIndex];
        if (option === currentQ.correctAnswer) {
            setResult('correct');
            setScore(prev => prev + 1);
        } else {
            setResult('incorrect');
        }
    };

    const nextQuestion = () => {
        if (currentIndex < 9) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setResult(null);
        } else {
            setView('score');
        }
    };

    const retryQuiz = () => {
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setResult(null);
      setView('quiz');
      const raw = getQuestionsForTopic(topic || 'general', 10);
      const formatted = raw.map(formatQuestion);
      setQuestions(formatted);
    };

    const currentQuestion = questions[currentIndex];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '650px',
                    padding: '3rem',
                    border: loading ? '1px solid #555' : '1px solid var(--accent-purple)',
                    boxShadow: '0 0 50px rgba(139, 92, 246, 0.4)',
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#aaa',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >✕</button>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="neon-text-purple" style={{ animation: 'pulse 1.5s infinite', fontSize: '1.2rem' }}>
                            {lang === 'en' ? 'Loading questions...' : 'ĐANG TẢI CÂU HỎI...'}
                        </div>
                    </div>
                ) : questions.length === 0 ? (
                    <div style={{ color: 'red', textAlign: 'center', padding: '1rem' }}>
                        {lang === 'en' ? 'No questions available for this topic.' : 'Không có câu hỏi cho chủ đề này.'}
                    </div>
                ) : view === 'score' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '32px', margin: 0 }}>
                            {lang === 'en' ? 'QUIZ COMPLETED' : 'HOÀN THÀNH BÀI KIỂM TRA'}
                        </h2>

                        <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '24px' }}>
                            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border-strong)" strokeWidth="12" />
                                <circle cx="80" cy="80" r="70" fill="none" stroke={score >= 8 ? 'var(--success)' : 'var(--brand-primary)'} strokeWidth="12"
                                    strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * score) / 10}
                                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                            </svg>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '40px', fontWeight: 800, color: score >= 8 ? 'var(--success)' : 'var(--text-primary)', lineHeight: 1 }}>{score}</span>
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>/ 10</span>
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px', maxWidth: '80%' }}>
                            {score >= 8
                                ? (lang === 'en' ? 'Excellent! You demonstrated great knowledge.' : 'Xuất sắc! Kiến thức của bạn rất vững.')
                                : (lang === 'en' ? 'Good effort! Keep learning to improve your score.' : 'Nỗ lực tốt! Hãy tiếp tục học để cải thiện nhé.')}
                        </p>

                        <p style={{ color: 'var(--success)', fontSize: '14px', fontWeight: 700, marginBottom: '24px' }}>
                            +{(score * 100000).toLocaleString()} ₫ {lang === 'en' ? 'added to your budget!' : 'đã thêm vào ngân sách!'}
                        </p>

                        <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center' }}>
                            <button
                                onClick={retryQuiz}
                                style={{
                                    padding: '12px 24px', background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                                    border: '1px solid var(--border-default)', borderRadius: '8px', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseOut={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            >
                                {lang === 'en' ? 'Retry' : 'Thử lại'}
                            </button>
                            <button
                                onClick={() => {
                                    if (score >= 8 && onSuccess) onSuccess(score);
                                    onClose();
                                }}
                                style={{
                                    padding: '12px 24px', background: 'var(--brand-primary)', color: 'white',
                                    border: 'none', borderRadius: '8px', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {lang === 'en' ? 'Complete' : 'Hoàn thành'}
                            </button>
                        </div>
                    </motion.div>
                ) : currentQuestion ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                <span>{lang === 'en' ? `Question ${currentIndex + 1} of 10` : `Câu hỏi ${currentIndex + 1} trên 10`}</span>
                                <span>{lang === 'en' ? `Score: ${score}` : `Điểm: ${score}`}</span>
                            </div>

                            <h2 className="neon-text-blue" style={{ marginBottom: '2rem', fontSize: '1.4rem', lineHeight: '1.5' }}>
                                {currentQuestion.question}
                            </h2>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {currentQuestion.options.map((opt, idx) => {
                                    let bgColor = 'rgba(255,255,255,0.05)';
                                    let borderColor = 'rgba(255,255,255,0.1)';

                                    if (selectedOption) {
                                        const optionLetter = opt.charAt(0);
                                        if (optionLetter === currentQuestion.correctAnswer) {
                                            bgColor = 'rgba(0, 255, 157, 0.2)';
                                            borderColor = 'var(--accent-green)';
                                        } else if (selectedOption === optionLetter && result === 'incorrect') {
                                            bgColor = 'rgba(255, 0, 85, 0.2)';
                                            borderColor = '#ff0055';
                                        }
                                    }

                                    return (
                                        <motion.button
                                            whileHover={{ scale: selectedOption ? 1 : 1.02 }}
                                            whileTap={{ scale: selectedOption ? 1 : 0.98 }}
                                            key={idx}
                                            onClick={() => handleAnswer(opt.charAt(0))}
                                            style={{
                                                padding: '1.2rem',
                                                textAlign: 'left',
                                                background: bgColor,
                                                border: `1px solid ${borderColor}`,
                                                color: 'white',
                                                borderRadius: '8px',
                                                cursor: selectedOption ? 'default' : 'pointer',
                                                transition: 'background-color 0.2s, border-color 0.2s',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {opt}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: `4px solid ${result === 'correct' ? 'var(--accent-green)' : '#ff0055'}` }}
                                >
                                    <strong style={{ color: result === 'correct' ? 'var(--accent-green)' : '#ff0055', fontSize: '1.1rem', textShadow: `0 0 10px ${result === 'correct' ? 'var(--accent-green)' : '#ff0055'}` }}>
                                        {result === 'correct' ? (lang === 'en' ? 'CORRECT!' : 'CHÍNH XÁC!') : (lang === 'en' ? 'INCORRECT' : 'CHƯA ĐÚNG')}
                                    </strong>
                                    <p style={{ marginTop: '0.5rem', color: '#ccc', fontSize: '0.95rem', lineHeight: '1.4' }}>{currentQuestion.explanation}</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={nextQuestion}
                                        style={{
                                            marginTop: '1.5rem',
                                            padding: '0.8rem 1.8rem',
                                            background: 'var(--primary-neon)',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'black',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {lang === 'en' ? (currentIndex === 9 ? 'Show Score' : 'Next Question') : (currentIndex === 9 ? 'Xem Kết Quả' : 'Câu Tiếp Theo')}
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                ) : null}
            </motion.div>
        </div>
    );
};

export default QuizModal;
