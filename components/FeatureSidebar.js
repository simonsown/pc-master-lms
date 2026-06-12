'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BookOpen, Cpu, Map, BarChart2, History, GraduationCap,
    ChevronLeft, PanelRightClose, BookMarked, Sparkles, TestTube,
    Sun, Moon, LogOut, Clock
} from 'lucide-react';
import { logout } from '@/lib/auth-actions';

const FEATURES = [
    { id: 'lessons', label: 'Bài giảng', href: '/student/lessons', icon: BookOpen, color: '#2563EB' },
    { id: 'learning-path', label: 'Lộ trình học', href: '/student/learning-path', icon: Map, color: '#10B981' },
    { id: 'progress', label: 'Tiến độ', href: '/student/progress', icon: BarChart2, color: '#F59E0B' },
    { id: 'builder', label: 'Lắp ráp PC', href: '/builder', icon: Cpu, color: '#8B5CF6' },
    { id: 'quiz', label: 'Kiểm tra', href: '/student/quiz', icon: TestTube, color: '#EF4444' },
    { id: 'sgk', label: 'SGK', href: '/student/sgk', icon: BookMarked, color: '#06B6D4' },
    { id: 'history', label: 'Lịch sử', href: '/student/history', icon: History, color: '#6366F1' },
];

const STORAGE_KEY = 'feature_toggles';

function loadToggles() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
        const defaults = {};
        FEATURES.forEach(f => defaults[f.id] = true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
    } catch {
        const defaults = {};
        FEATURES.forEach(f => defaults[f.id] = true);
        return defaults;
    }
}

function loadCollapsed() {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; }
    catch { return false; }
}

export default function FeatureSidebar({ onToggle = () => {} }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(loadCollapsed);
    const [toggles, setToggles] = useState({});
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        setToggles(loadToggles());
        const saved = localStorage.getItem('theme') || 'light';
        setTheme(saved);
    }, []);

    const saveCollapsed = (val) => {
        setCollapsed(val);
        localStorage.setItem('sidebar_collapsed', val);
    };

    const toggleFeature = (id) => {
        setToggles(prev => {
            const next = { ...prev, [id]: !(prev[id] ?? true) };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            if (onToggle) onToggle(id, next[id]);
            return next;
        });
    };

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    const isEnabled = (id) => toggles[id] ?? true;
    const activeFeature = FEATURES.find(f => pathname?.startsWith(f.href));

    if (collapsed) {
        return (
            <motion.aside
                initial={false}
                animate={{ width: 52 }}
                className="flex-shrink-0 bg-white border-r border-slate-200 flex flex-col items-center gap-1.5 py-3 overflow-hidden"
            >
                <button
                    onClick={() => saveCollapsed(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors mb-2"
                    title="Mở rộng sidebar"
                >
                    <PanelRightClose size={18} />
                </button>
                {FEATURES.map(f => {
                    const enabled = isEnabled(f.id);
                    const isActive = activeFeature?.id === f.id;
                    return (
                        <Link
                            key={f.id}
                            href={f.href}
                            className={`p-2 rounded-lg transition-all ${
                                isActive && enabled
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : enabled
                                        ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                        : 'text-slate-200 cursor-not-allowed'
                            }`}
                            title={`${f.label}${!enabled ? ' (đã tắt)' : ''}`}
                            onClick={e => { if (!enabled) e.preventDefault(); }}
                        >
                            <f.icon size={18} />
                        </Link>
                    );
                })}
                <div className="mt-auto pt-2 border-t border-slate-100 w-full flex flex-col items-center gap-1.5">
                    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Đổi theme">
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    <button onClick={() => logout()} className="p-2 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors" title="Đăng xuất">
                        <LogOut size={16} />
                    </button>
                </div>
            </motion.aside>
        );
    }

    return (
        <motion.aside
            initial={false}
            animate={{ width: 240 }}
            className="flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden"
        >
            {/* Brand */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                <Link href="/student/dashboard" className="flex items-center gap-2.5 no-underline">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-sm">
                        <GraduationCap size={18} className="text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-slate-900 leading-tight">PC Master</div>
                        <div className="text-[10px] font-semibold text-blue-600 leading-tight">Học sinh</div>
                    </div>
                </Link>
                <button
                    onClick={() => saveCollapsed(true)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Thu gọn"
                >
                    <ChevronLeft size={16} />
                </button>
            </div>

            {/* Feature list */}
            <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
                {FEATURES.map((f, i) => {
                    const enabled = isEnabled(f.id);
                    const isActive = activeFeature?.id === f.id;
                    const Icon = f.icon;
                    return (
                        <div key={f.id} className="flex items-center gap-1">
                            <Link
                                href={enabled ? f.href : '#'}
                                onClick={e => { if (!enabled) e.preventDefault(); }}
                                className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all no-underline ${
                                    isActive && enabled
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : enabled
                                            ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-medium'
                                            : 'text-slate-300 cursor-not-allowed'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    isActive && enabled
                                        ? 'bg-white shadow-sm'
                                        : enabled
                                            ? 'bg-slate-100'
                                            : 'bg-slate-50'
                                }`}>
                                    <Icon size={16} style={{ color: enabled ? f.color : '#CBD5E1' }} />
                                </div>
                                <span className="flex-1 truncate">{f.label}</span>
                            </Link>
                            <button
                                onClick={() => toggleFeature(f.id)}
                                className={`relative w-9 h-5 rounded-full transition-all shrink-0 ${
                                    enabled ? 'bg-blue-600' : 'bg-slate-200'
                                }`}
                                title={enabled ? `Tắt ${f.label}` : `Bật ${f.label}`}
                            >
                                <motion.div
                                    animate={{ x: enabled ? 18 : 2 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="absolute top-1 w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Bottom */}
            <div className="px-3 py-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-400 text-[11px] font-medium">
                    <Clock size={12} />
                    <span id="session-timer" />
                </div>
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-sm font-medium transition-all"
                >
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
                </button>
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-all"
                >
                    <LogOut size={16} /> Đăng xuất
                </button>
            </div>
        </motion.aside>
    );
}
