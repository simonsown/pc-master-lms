'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    GraduationCap, LayoutDashboard, Cpu, History, LogOut, Users,
    BookOpen, Sun, Moon, Map, BarChart2, Menu, X, BookMarked,
    ShoppingCart, Swords, FileQuestion, Gamepad2, User, ChevronRight, Zap
} from 'lucide-react'
import { logout } from '@/lib/auth-actions'
import { createBrowserClient } from '@supabase/ssr'
import PageTransition from '@/components/PageTransition'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useSessionTime } from '@/lib/session-time'

function SessionTimer() {
    const { formatted } = useSessionTime()
    return (
        <div className="flex items-center gap-2 px-4 py-2 mx-3 my-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock size={14} />
            <span>{formatted}</span>
        </div>
    )
}

function ThemeToggle() {
    const [theme, setThemeState] = useState<'light' | 'dark'>('dark')
    useEffect(() => {
        const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
        setThemeState(saved)
        document.documentElement.setAttribute('data-theme', saved)
    }, [])
    const toggle = useCallback(() => {
        const next = theme === 'light' ? 'dark' : 'light'
        setThemeState(next)
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('theme', next)
    }, [theme])
    return (
        <button onClick={toggle} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-transparent border-none text-white/40 font-medium cursor-pointer text-sm font-sans transition-all hover:text-white/60">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
        </button>
    )
}

const ALL_NAV_ITEMS = [
    { href: '/student/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, mobileOnly: false },
    { href: '/student/lessons', label: 'Bài Giảng', icon: BookOpen, mobileOnly: false },

    { href: '/builder', label: 'Luyện Tập', icon: Cpu, mobileOnly: false },
    { href: '/student/level', label: 'Cấp Độ & Nhiệm Vụ', icon: Zap, mobileOnly: false },
    { href: '/student/sgk', label: 'Chợ Máy Tính', icon: ShoppingCart, mobileOnly: true },
    { href: '/student/quiz', label: 'Kỳ Thi', icon: FileQuestion, mobileOnly: true },
    { href: '/student/multiplayer', label: '2 Người Chơi', icon: Swords, mobileOnly: true },
    { href: '/student/quiz-bank', label: 'Ngân Hàng Đề Thi', icon: Gamepad2, mobileOnly: true },
    { href: '/student/history', label: 'Lịch Sử Học Tập', icon: History, mobileOnly: false },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const [hasClass, setHasClass] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const checkClass = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                if (p) { setProfile(p); if (p.school_id || p.class_id) setHasClass(true) }
            }
        }
        checkClass()
    }, [])

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen])

    const closeMobile = () => setMobileOpen(false)

    const desktopNavItems = ALL_NAV_ITEMS.filter(n => !n.mobileOnly)
    const mobileNavItems = ALL_NAV_ITEMS

    const sidebarContent = (
        <>
            <div className="p-6 flex items-center gap-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center">
                    <GraduationCap size={20} color="#fff" />
                </div>
                <div className="flex-1">
                    <div className="font-extrabold text-lg text-white">PC Master</div>
                    <div className="text-[11px] text-[var(--brand-primary)] font-semibold opacity-90">Học sinh</div>
                </div>
            </div>

            <SessionTimer />
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {desktopNavItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all ${
                            active
                                ? 'bg-emerald-500/15 text-white font-bold'
                                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                        }`}>
                            <Icon size={20} />
                            <span className="flex-1">{label}</span>
                            {active && <ChevronRight size={16} className="text-emerald-400" />}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/10 flex flex-col gap-1">
                <ThemeToggle />
                <button onClick={() => { closeMobile(); logout(); }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-transparent border-none text-red-400/70 font-semibold cursor-pointer text-sm font-sans transition-all hover:text-red-400">
                    <LogOut size={18} /> Đăng xuất
                </button>
            </div>
        </>
    )

    return (
        <div className="flex min-h-screen bg-[var(--bg-base)]">
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-[280px] bg-gradient-to-b from-[#031f3b] to-[#1a2f53] flex-col shrink-0">
                {sidebarContent}
            </aside>

            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-3 left-3 z-[1001] md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-b from-[#031f3b] to-[#1a2f53] border-none cursor-pointer text-white shadow-lg"
                aria-label="Mở menu"
            >
                <Menu size={22} />
            </button>

            {/* Mobile header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
                <div className="w-11" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center">
                    <GraduationCap size={14} color="#fff" />
                </div>
                <span className="text-sm font-extrabold text-[var(--text-primary)]">PC Master</span>
            </div>
            <div className="w-9" />
            </header>

            {/* Spacer for mobile header */}
            <div className="md:hidden h-14 shrink-0" />

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeMobile}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1002] md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-[290px] z-[1003] md:hidden flex flex-col bg-gradient-to-b from-[#031f3b] to-[#1a2f53] shadow-2xl overflow-y-auto"
                        >
                            <div className="p-5 flex items-center gap-3 border-b border-white/10">
                                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center">
                                    <GraduationCap size={20} color="#fff" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-extrabold text-lg text-white">PC Master</div>
                                    <div className="text-[11px] text-[var(--brand-primary)] font-semibold opacity-90">Học sinh</div>
                                </div>
                                <button onClick={closeMobile}
                                    className="w-9 h-9 rounded-lg bg-white/10 border-none flex items-center justify-center text-white/60 cursor-pointer hover:bg-white/20 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                                {mobileNavItems.map(({ href, label, icon: Icon }) => {
                                    const active = pathname === href
                                    return (
                                        <Link key={href} href={href} onClick={closeMobile}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm no-underline transition-all ${
                                                active
                                                    ? 'bg-emerald-500/15 text-white font-bold'
                                                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                                            }`}>
                                            <Icon size={20} />
                                            <span className="flex-1">{label}</span>
                                            {active && <ChevronRight size={16} className="text-emerald-400" />}
                                        </Link>
                                    )
                                })}
                            </nav>
                            <div className="p-4 border-t border-white/10 flex flex-col gap-1">
                                <ThemeToggle />
                                <button onClick={() => { closeMobile(); logout(); }}
                                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-transparent border-none text-red-400/70 font-semibold cursor-pointer text-sm font-sans transition-all hover:text-red-400">
                                    <LogOut size={18} /> Đăng xuất
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 overflow-y-auto min-w-0 md:pt-0 pt-0">
                <PageTransition>{children}</PageTransition>
            </main>
        </div>
    )
}
