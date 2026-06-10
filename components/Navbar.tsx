'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BookOpen, Trophy, FileText, LayoutDashboard, Users, BarChart3, Bell, Menu, X, Settings, LogOut, User as UserIcon, HelpCircle } from 'lucide-react'
import { getProfile, logout } from '@/lib/auth-actions'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export default function Navbar() {
  const pathname = usePathname()
  
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false)

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error("Failed to fetch profile", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Menu items based on role
  const role = userProfile?.role || 'student'
  
  const studentMenu = [
    { name: 'Trang chủ', path: '/student', icon: <Home size={18} /> },
    { name: 'Bài học', path: '/courses', icon: <BookOpen size={18} /> },
    { name: 'Kỳ thi', path: '/exams', icon: <FileText size={18} /> },
    { name: 'Trắc nghiệm', path: '/quiz', icon: <HelpCircle size={18} /> },
    { name: 'Xếp hạng', path: '/leaderboard', icon: <Trophy size={18} /> },
    { name: 'Lộ trình', path: '/roadmap', icon: <LayoutDashboard size={18} /> },
  ]

  const teacherMenu = [
    { name: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={18} /> },
    { name: 'Bài học', path: '/teacher/lessons', icon: <BookOpen size={18} /> },
    { name: 'Ngân hàng', path: '/teacher/questions', icon: <FileText size={18} /> },
    { name: 'Lớp học', path: '/teacher/classes', icon: <Users size={18} /> },
    { name: 'Báo cáo', path: '/teacher/reports', icon: <BarChart3 size={18} /> },
  ]

  const activeMenu = role === 'teacher' ? teacherMenu : studentMenu

  const handleLogout = async () => {
    await logout()
  }

  // Don't show complex navbar on landing page or auth pages if not needed,
  // but usually this navbar is placed inside protected layouts (e.g. app/(dashboard)/layout.tsx)
  // We assume this component is used correctly by the parent.

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-[#1e293b] transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#0f0f1a]/90 backdrop-blur-md py-2 shadow-lg' 
            : 'bg-[#0f0f1a] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row items-center justify-between">
            
            {/* LOGO — bên trái */}
            <Link href="/" className="flex flex-row items-center gap-2 flex-shrink-0 group">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-110" />
              <span className="font-bold text-white tracking-tight hidden sm:block">PC MASTER <span className="text-[#00d2a0]">LMS</span></span>
            </Link>

            {/* NAV LINKS — giữa, CHỈ HIỆN DESKTOP */}
            <div className="hidden md:flex flex-row items-center gap-1">
              {activeMenu.map((item) => {
                const isActive = pathname === item.path || pathname?.startsWith(item.path + '/')
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={`relative px-4 py-2 rounded-full flex flex-row items-center gap-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-[#16213e]'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-[#1e293b] rounded-full -z-10 border border-[#2a3655]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* ACTIONS — bên phải */}
            <div className="flex flex-row items-center gap-2 sm:gap-4">
              
              {/* Notifications */}
              {userProfile && <NotificationBell userId={userProfile.id} />}

              {/* User Avatar & Dropdown (Desktop) */}
              <div className="hidden md:block relative">
                {loading ? (
                  <div className="w-9 h-9 rounded-full bg-[#1e293b] animate-pulse"></div>
                ) : userProfile ? (
                  <>
                    <button 
                      onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                      className="flex items-center gap-2 focus:outline-none"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00d2a0] to-[#00b4d8] p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#16213e] flex items-center justify-center overflow-hidden">
                          {userProfile.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={16} className="text-slate-300" />
                          )}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {avatarDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setAvatarDropdownOpen(false)}></div>
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-56 bg-[#16213e] border border-[#1e293b] rounded-xl shadow-2xl py-2 z-50"
                          >
                            <div className="px-4 py-2 border-b border-[#1e293b] mb-2">
                              <p className="text-sm font-bold text-white truncate">{userProfile.full_name}</p>
                              <p className="text-xs text-slate-400 truncate">{userProfile.email}</p>
                              <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00d2a0]/10 text-[#00d2a0] border border-[#00d2a0]/20">
                                {role}
                              </div>
                            </div>
                            
                            <Link href="/profile" onClick={() => setAvatarDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors">
                              <UserIcon size={16} /> Hồ sơ cá nhân
                            </Link>
                            <Link href="/settings" onClick={() => setAvatarDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-[#1e293b] transition-colors">
                              <Settings size={16} /> Cài đặt
                            </Link>
                            
                            <div className="h-[1px] bg-[#1e293b] my-2"></div>
                            
                            <button onClick={() => { setAvatarDropdownOpen(false); handleLogout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
                              <LogOut size={16} /> Đăng xuất
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link href="/login" className="px-4 py-2 bg-[#00d2a0] text-black text-sm font-bold rounded-lg hover:bg-[#00e6af] transition-colors">
                    Đăng nhập
                  </Link>
                )}
              </div>

              {/* Hamburger — CHỈ MOBILE */}
              <button 
                className="md:hidden p-2 text-slate-400 hover:text-white bg-[#16213e] rounded-lg border border-[#1e293b]"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0f0f1a] border-r border-[#1e293b] z-[70] flex flex-col md:hidden shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-[#16213e]/50">
                <div className="flex items-center gap-3">
                  {userProfile ? (
                    <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center border border-[#2a3655]">
                      <UserIcon size={20} className="text-[#00d2a0]" />
                    </div>
                  ) : (
                    <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                  )}
                  <div>
                    <div className="font-bold text-sm text-white">
                      {userProfile ? userProfile.full_name : 'PC MASTER LMS'}
                    </div>
                    {userProfile && (
                      <div className="text-xs text-[#00d2a0] uppercase font-bold">{role}</div>
                    )}
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white bg-[#1e293b] rounded-lg">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                {activeMenu.map(item => {
                  const isActive = pathname === item.path || pathname?.startsWith(item.path + '/')
                  return (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#00d2a0]/10 text-[#00d2a0] border border-[#00d2a0]/20' 
                          : 'text-slate-300 hover:bg-[#16213e] hover:text-white'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  )
                })}

                {userProfile && (
                  <>
                    <div className="h-[1px] bg-[#1e293b] my-3 mx-2"></div>
                    <Link 
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-300 hover:bg-[#16213e] hover:text-white transition-colors"
                    >
                      <UserIcon size={18} /> Hồ sơ cá nhân
                    </Link>
                    <Link 
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-300 hover:bg-[#16213e] hover:text-white transition-colors"
                    >
                      <Settings size={18} /> Cài đặt
                    </Link>
                  </>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#1e293b] bg-[#16213e]/30">
                {userProfile ? (
                  <button 
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut size={18} /> Đăng xuất
                  </button>
                ) : (
                  <Link 
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-3 rounded-xl font-bold bg-[#00d2a0] text-black hover:bg-[#00e6af] transition-colors shadow-[0_0_15px_rgba(0,210,160,0.2)]"
                  >
                    Đăng nhập / Đăng ký
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
