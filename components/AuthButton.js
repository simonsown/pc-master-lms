'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, User, LogIn } from 'lucide-react';
import Link from 'next/link';

const AuthButton = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
            setLoading(false);
        };

        checkUser();

        // Lắng nghe sự kiện đăng nhập/đăng xuất để cập nhật UI ngay lập tức
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (loading) return <div style={{ width: '40px' }} />;

    if (user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', cursor: 'pointer' }}>
                    <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: 'rgba(0, 243, 255, 0.1)', border: '1px solid #00f3ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f3ff'
                    }}>
                        <User size={18} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#e0e6ed' }}>
                        {user.user_metadata?.display_name || user.email.split('@')[0]}
                    </span>
                </Link>
                <button 
                    onClick={handleSignOut}
                    style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', 
                        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                >
                    <LogOut size={16} /> Đăng xuất
                </button>
            </div>
        );
    }

    return (
        <Link href="/login">
            <button style={{ 
                background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', border: '1px solid #00f3ff', 
                padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
            }}>
                <LogIn size={18} /> Đăng nhập
            </button>
        </Link>
    );
};

export default AuthButton;
