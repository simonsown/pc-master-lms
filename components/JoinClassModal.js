'use client';

import React, { useState } from 'react';
import { X, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { joinClass, getAllClasses } from '@/lib/lesson-store';

const JoinClassModal = ({ isOpen, onClose, lang }) => {
    const [classCode, setClassCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const code = classCode.trim().toUpperCase();
            if (!code) throw new Error(lang === 'en' ? 'Enter a class code' : 'Vui lòng nhập mã lớp');

            const classes = getAllClasses();
            const known = classes.some(c => c.code.toUpperCase() === code);
            if (!known) {
                throw new Error(lang === 'en' ? 'Invalid class code' : 'Mã lớp không tồn tại. Hãy kiểm tra lại mã lớp của bạn.');
            }

            joinClass(code);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setClassCode('');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(12, 15, 20, 0.85)', backdropFilter: 'blur(8px)',
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'
        }}>
            <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '24px',
                padding: '40px', maxWidth: '400px', width: '100%', color: 'var(--text-primary)',
                position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                ><X size={24} /></button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ 
                        width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(0, 243, 255, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <Users size={32} color="var(--brand-primary)" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
                        {lang === 'en' ? 'Join Class' : 'Tham gia lớp học'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                        {lang === 'en' ? 'Enter the code provided by your teacher' : 'Nhập mã lớp được giáo viên cung cấp'}
                    </p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
                        <p style={{ color: 'var(--success)', fontWeight: 600 }}>
                            {lang === 'en' ? 'Successfully joined!' : 'Đã tham gia lớp học thành công!'}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <input
                                type="text"
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                placeholder="VD: TIN001"
                                required
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '12px',
                                    background: 'var(--bg-base)', border: '1px solid var(--border-strong)',
                                    color: 'white', fontSize: '18px', fontWeight: 700, textAlign: 'center',
                                    textTransform: 'uppercase', letterSpacing: '2px'
                                }}
                            />
                        </div>

                        {error && (
                            <p style={{ color: '#ef4444', fontSize: '13px', margin: 0, textAlign: 'center', fontWeight: 500 }}>
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                background: 'var(--brand-primary)', color: '#000',
                                fontSize: '16px', fontWeight: 700, border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (lang === 'en' ? 'Join Now' : 'Tham gia ngay')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default JoinClassModal;
