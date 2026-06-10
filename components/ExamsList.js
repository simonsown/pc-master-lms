'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { FileText, Clock, Trophy, ArrowRight, Loader2, Search, Calendar, ChevronRight } from 'lucide-react';

const ExamsList = ({ lang, onBack }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    async function fetchExams() {
        try {
            setLoading(true);
            const { data } = await supabase
                .from('assignments')
                .select(`
                    *,
                    classes (name)
                `)
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            setExams(data || []);
        } catch (err) {
            console.error('Error fetching exams:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredExams = exams.filter(exam => 
        exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', color: '#00f3ff' }}>
                    {lang === 'en' ? 'Examination Center' : 'Trung tâm Khảo thí'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    {lang === 'en' ? 'Access your official tests and assessments here.' : 'Truy cập các bài kiểm tra và đánh giá chính thức của bạn tại đây.'}
                </p>
            </div>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input 
                    type="text" 
                    placeholder={lang === 'en' ? "Search exams..." : "Tìm kiếm kỳ thi..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                        color: 'white', outline: 'none', transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                />
            </div>

            {loading ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Loader2 className="animate-spin" color="var(--brand-primary)" size={40} />
                </div>
            ) : filteredExams.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {filteredExams.map((exam, idx) => (
                        <motion.div 
                            key={exam.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                                borderRadius: '20px', padding: '24px', cursor: 'pointer',
                                transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ padding: '10px', background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', borderRadius: '12px' }}>
                                    <FileText size={20} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        {lang === 'en' ? 'Duration' : 'Thời lượng'}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
                                        <Clock size={12} /> 45'
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0', lineHeight: 1.3 }}>{exam.title}</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} /> {exam.classes?.name || (lang === 'en' ? 'General' : 'Toàn trường')}
                            </p>

                            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0 -24px 20px -24px' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Trophy size={14} color="var(--warning)" />
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>100 XP</span>
                                </div>
                                <button style={{
                                    padding: '8px 16px', background: '#00f3ff', color: '#000',
                                    fontSize: '11px', fontWeight: 800, borderRadius: '8px', border: 'none',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                    transition: 'all 0.2s'
                                }}>
                                    {lang === 'en' ? 'START EXAM' : 'BẮT ĐẦU THI'} <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', borderRadius: '24px', border: '2px dashed var(--border-subtle)', padding: '40px' }}>
                    <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
                        {lang === 'en' ? 'No exams found.' : 'Không tìm thấy kỳ thi nào.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ExamsList;
