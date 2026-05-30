'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Users, Shield, Activity, Database, Settings, Search, Filter,
  Loader2, AlertCircle, BarChart3, TrendingUp, Award, Clock,
  BookOpen, GraduationCap, Monitor, Bell, FileText, MessageSquare,
  Cpu, Wifi, HardDrive, Globe, ChevronRight, Plus, RefreshCw,
  Zap, Download, Upload, CheckCircle, XCircle, Radio, HeartPulse, UserPlus
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const SYSTEM_START = Date.now()

function formatUptime(ms: number) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`
}

function formatTime(ts: string | number) {
  const d = new Date(ts)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function timeAgo(ts: string | number) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vài giây trước'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  return `${Math.floor(hrs / 24)} ngày trước`
}

type RealtimeEvent = {
  id: string
  type: 'user_created' | 'lesson_created' | 'exam_completed' | 'submission' | 'system'
  label: string
  detail: string
  time: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({ totalUsers: 0, teachers: 0, students: 0, activeClasses: 0, totalLessons: 0, totalExams: 0 })
  const [loading, setLoading] = useState(true)
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  const [uptime, setUptime] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [weeklyData, setWeeklyData] = useState([
    { day: 'T2', users: 0, lessons: 0, exams: 0 },
    { day: 'T3', users: 0, lessons: 0, exams: 0 },
    { day: 'T4', users: 0, lessons: 0, exams: 0 },
    { day: 'T5', users: 0, lessons: 0, exams: 0 },
    { day: 'T6', users: 0, lessons: 0, exams: 0 },
    { day: 'T7', users: 0, lessons: 0, exams: 0 },
    { day: 'CN', users: 0, lessons: 0, exams: 0 },
  ])
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const latencyRef = useRef<number[]>([])
  const eventsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth !== 'true') { router.push('/login'); return }
    fetchAdminData()

    const uptimeInt = setInterval(() => {
      setUptime(formatUptime(Date.now() - SYSTEM_START))
    }, 1000)

    return () => {
      clearInterval(uptimeInt)
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    pollRef.current = setInterval(fetchAdminData, 30000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [autoRefresh])

  useEffect(() => {
    const channel = supabase.channel('admin-dashboard-realtime', {
      config: { broadcast: { self: true } },
    })

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profiles',
      }, (payload) => {
        const newUser = payload.new as any
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }))
        const evt: RealtimeEvent = {
          id: `user-${payload.commit_timestamp}`,
          type: 'user_created',
          label: '👤 Người dùng mới',
          detail: `${newUser.full_name || 'Unknown'} (${newUser.role || 'student'})`,
          time: formatTime(payload.commit_timestamp || Date.now()),
        }
        setRealtimeEvents(prev => [evt, ...prev].slice(0, 50))
        setUsers(prev => [newUser, ...prev])
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'lessons',
      }, (payload) => {
        const newLesson = payload.new as any
        setStats(prev => ({ ...prev, totalLessons: prev.totalLessons + 1 }))
        const evt: RealtimeEvent = {
          id: `lesson-${payload.commit_timestamp}`,
          type: 'lesson_created',
          label: '📚 Bài giảng mới',
          detail: newLesson.title || 'Bài giảng không tiêu đề',
          time: formatTime(payload.commit_timestamp || Date.now()),
        }
        setRealtimeEvents(prev => [evt, ...prev].slice(0, 50))
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'exams',
      }, (payload) => {
        setStats(prev => ({ ...prev, totalExams: prev.totalExams + 1 }))
        const evt: RealtimeEvent = {
          id: `exam-${payload.commit_timestamp}`,
          type: 'exam_completed',
          label: '📝 Bài kiểm tra mới',
          detail: (payload.new as any).title || 'Kiểm tra không tiêu đề',
          time: formatTime(payload.commit_timestamp || Date.now()),
        }
        setRealtimeEvents(prev => [evt, ...prev].slice(0, 50))
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    const latInt = setInterval(async () => {
      const start = Date.now()
      try {
        const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
        if (!error) {
          const ms = Date.now() - start
          latencyRef.current.push(ms)
          if (latencyRef.current.length > 10) latencyRef.current.shift()
          setLatency(Math.round(latencyRef.current.reduce((a, b) => a + b, 0) / latencyRef.current.length))
        }
      } catch { }
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(latInt)
    }
  }, [])

  async function fetchAdminData() {
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (profiles) setUsers(profiles)
      const teachers = profiles?.filter(u => u.role === 'teacher').length || 0
      const students = profiles?.filter(u => u.role === 'student').length || 0
      const { count: classesCount } = await supabase.from('classes').select('*', { count: 'exact', head: true })
      const { count: lessonsCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true })
      const { count: examsCount } = await supabase.from('exams').select('*', { count: 'exact', head: true })
      setStats({ totalUsers: profiles?.length || 0, teachers, students, activeClasses: classesCount || 0, totalLessons: lessonsCount || 0, totalExams: examsCount || 0 })

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      const weeklyMap: Record<string, { users: number; lessons: number; exams: number }> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000)
        const key = dayNames[d.getDay()]
        weeklyMap[key] = { users: 0, lessons: 0, exams: 0 }
      }
      const { data: recentProfiles } = await supabase.from('profiles').select('created_at').gte('created_at', sevenDaysAgo)
      recentProfiles?.forEach(p => {
        const key = dayNames[new Date(p.created_at).getDay()]
        if (weeklyMap[key]) weeklyMap[key].users++
      })
      const { data: recentLessons } = await supabase.from('lessons').select('created_at').gte('created_at', sevenDaysAgo)
      recentLessons?.forEach(l => {
        const key = dayNames[new Date(l.created_at).getDay()]
        if (weeklyMap[key]) weeklyMap[key].lessons++
      })
      const { data: recentExams } = await supabase.from('exams').select('created_at').gte('created_at', sevenDaysAgo)
      recentExams?.forEach(e => {
        const key = dayNames[new Date(e.created_at).getDay()]
        if (weeklyMap[key]) weeklyMap[key].exams++
      })
      setWeeklyData(dayNames.map(day => ({ day, ...weeklyMap[day] || { users: 0, lessons: 0, exams: 0 } })))
    } catch (err) { console.error('fetchAdminData error:', err) }
    finally { setLoading(false) }
  }

  const addSystemEvent = useCallback((label: string, detail: string) => {
    const evt: RealtimeEvent = {
      id: `sys-${Date.now()}-${Math.random()}`,
      type: 'system', label, detail,
      time: formatTime(Date.now()),
    }
    setRealtimeEvents(prev => [evt, ...prev].slice(0, 50))
  }, [])

  useEffect(() => {
    if (!eventsRef.current) return
    eventsRef.current.scrollTop = 0
  }, [realtimeEvents.length])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
      <Loader2 size={48} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Đang tải dữ liệu admin...</p>
    </div>
  )

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    borderRadius: '12px', padding: '20px',
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Tổng quan hệ thống</h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px',
              borderRadius: '99px', fontSize: '10px', fontWeight: 700,
              background: connected ? 'rgba(8,158,96,0.1)' : 'rgba(244,106,106,0.1)',
              color: connected ? 'var(--brand-primary)' : 'var(--danger)',
              textTransform: 'uppercase', letterSpacing: '0.3px',
            }}>
              <Radio size={10} />
              {connected ? 'Real-time' : 'Disconnected'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Dashboard quản trị · PC Master LMS v2.4.1
            {latency !== null && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px',
                color: latency < 100 ? 'var(--brand-primary)' : latency < 300 ? 'var(--accent-amber)' : 'var(--danger)',
              }}>
                · <HeartPulse size={11} /> {latency}ms
              </span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· Uptime: {uptime}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} style={{ accentColor: 'var(--brand-primary)' }} />
            Tự động
          </label>
          <button onClick={fetchAdminData} style={{
            padding: '8px 14px', borderRadius: '8px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
          }}>
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Tổng người dùng', value: stats.totalUsers, icon: Users, color: '#6366f1', change: '+12%' },
          { label: 'Giáo viên', value: stats.teachers, icon: Shield, color: 'var(--accent-blue)', change: '+2' },
          { label: 'Học sinh', value: stats.students, icon: GraduationCap, color: 'var(--brand-primary)', change: '+10%' },
          { label: 'Lớp học', value: stats.activeClasses, icon: Database, color: 'var(--warning)', change: '0' },
          { label: 'Bài giảng', value: stats.totalLessons, icon: BookOpen, color: 'var(--info)', change: '+5' },
          { label: 'Bài kiểm tra', value: stats.totalExams, icon: FileText, color: 'var(--accent-amber)', change: '+3' },
        ].map((s, i) => (
          <div key={i} style={{
            ...cardStyle, padding: '16px 18px', transition: 'all 0.2s',
            borderLeft: `3px solid ${s.color}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '8px',
                background: `${s.color}15`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={16} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--brand-primary)', background: 'var(--brand-subtle)', padding: '2px 7px', borderRadius: '99px' }}>{s.change}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>
              <TrendingUp size={16} color="var(--brand-primary)" /> Hoạt động 7 ngày
            </h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><div style={{ width: '7px', height: '7px', borderRadius: '2px', background: 'var(--brand-primary)' }} /> Người dùng</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><div style={{ width: '7px', height: '7px', borderRadius: '2px', background: 'var(--accent-blue)' }} /> Bài giảng</span>
            </div>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="users" fill="var(--brand-primary)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="lessons" fill="var(--accent-blue)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Cpu size={16} color="var(--brand-primary)" /> Hệ thống
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: Cpu, label: 'CPU Server', value: 'N/A', status: 'ok' as const },
              { icon: HardDrive, label: 'RAM', value: 'N/A', status: 'ok' as const },
              { icon: Database, label: 'Database', value: latency ? `${latency}ms latency` : 'Đo...', status: latency !== null && latency < 200 ? 'ok' as const : 'warn' as const },
              { icon: Globe, label: 'Uptime', value: uptime || 'Đang tính...', status: 'ok' as const },
              { icon: Wifi, label: 'API', value: latency ? `${latency}ms` : 'Đo...', status: latency !== null && latency < 300 ? 'ok' as const : 'warn' as const },
              { icon: Activity, label: 'Realtime', value: connected ? 'Đã kết nối' : 'Mất kết nối', status: connected ? 'ok' as const : 'error' as const },
            ].map((item, i) => {
              const statusColor = item.status === 'ok' ? 'var(--brand-primary)' : item.status === 'warn' ? 'var(--accent-amber)' : 'var(--danger)'
              const statusBg = item.status === 'ok' ? 'rgba(8,158,96,0.1)' : item.status === 'warn' ? 'rgba(255,163,0,0.1)' : 'rgba(244,106,106,0.1)'
              return (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: statusBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor }}>
                    <item.icon size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}60` }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Activity size={16} color="var(--brand-primary)" /> Sự kiện realtime
              {realtimeEvents.length > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '99px',
                  background: 'var(--brand-subtle)', color: 'var(--brand-primary)', marginLeft: '4px',
                }}>
                  {realtimeEvents.length}
                </span>
              )}
            </h3>
            {realtimeEvents.length > 0 && (
              <button onClick={() => setRealtimeEvents([])}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit', padding: '2px 6px', borderRadius: '4px' }}>
                Xóa tất cả
              </button>
            )}
          </div>
          <div ref={eventsRef} style={{
            maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px',
          }}>
            {realtimeEvents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Radio size={28} style={{ opacity: 0.15, marginBottom: '8px' }} />
                <p>Đang chờ sự kiện realtime...</p>
                <p style={{ fontSize: '11px', opacity: 0.6 }}>Các thay đổi trong database sẽ hiển thị tại đây</p>
              </div>
            ) : (
              realtimeEvents.map((evt, i) => (
                <div key={evt.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                  borderRadius: '6px', transition: 'background 0.15s',
                  background: i === 0 ? 'rgba(8,158,96,0.04)' : 'transparent',
                  animation: i === 0 ? 'fadeIn 0.3s ease' : undefined,
                }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{evt.label.split(' ')[0]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{evt.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{evt.detail}</div>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{evt.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Zap size={16} color="var(--brand-primary)" /> Thao tác nhanh
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { icon: Plus, label: 'Tạo người dùng', color: '#6366f1', desc: 'Thêm học sinh/giáo viên', action: () => router.push('/admin/users') },
              { icon: BookOpen, label: 'Bài giảng mới', color: 'var(--brand-primary)', desc: 'Tạo nội dung học tập', action: () => { } },
              { icon: FileText, label: 'Tạo bài kiểm tra', color: 'var(--accent-amber)', desc: 'Thiết lập đề thi', action: () => { } },
              { icon: Bell, label: 'Gửi thông báo', color: 'var(--accent-blue)', desc: 'Thông báo đến lớp học', action: () => { } },
              { icon: Download, label: 'Báo cáo CSV', color: 'var(--info)', desc: 'Xuất dữ liệu thống kê', action: () => { } },
              { icon: Settings, label: 'Cấu hình', color: 'var(--warning)', desc: 'Cài đặt hệ thống', action: () => router.push('/admin/settings') },
            ].map((item, i) => (
              <button key={i} onClick={item.action} style={{
                display: 'flex', flexDirection: 'column', gap: '4px', padding: '14px',
                borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s',
              }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={14} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.desc}</div>
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '20px 0 10px 0', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Users size={16} color="var(--brand-primary)" /> Người dùng gần đây
            {users.length > 0 && (
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '99px', background: 'var(--brand-subtle)', color: 'var(--brand-primary)', marginLeft: '4px' }}>
                {users.length}
              </span>
            )}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '220px', overflowY: 'auto' }}>
            {users.slice(0, 8).map((user) => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-blue))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: '#fff', fontSize: '10px', flexShrink: 0,
                }}>
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '12px' }}>{user.full_name || 'Unknown'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{user.email}</div>
                </div>
                <span style={{
                  fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px',
                  background: user.role === 'admin' ? 'rgba(244,106,106,0.1)' : user.role === 'teacher' ? 'rgba(40,156,249,0.1)' : 'rgba(8,158,96,0.1)',
                  color: user.role === 'admin' ? 'var(--danger)' : user.role === 'teacher' ? 'var(--accent-blue)' : 'var(--brand-primary)',
                }}>
                  {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'GV' : 'HS'}
                </span>
                {user.created_at && (
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(user.created_at)}</span>
                )}
              </div>
            ))}
            {users.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                <AlertCircle size={28} style={{ opacity: 0.15, marginBottom: '8px' }} />
                <p>Chưa có người dùng nào.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 99px; }
      `}</style>
    </div>
  )
}
