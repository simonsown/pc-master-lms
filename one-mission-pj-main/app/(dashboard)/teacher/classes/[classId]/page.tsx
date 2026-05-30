'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, ClipboardList, Plus, Loader2, ArrowLeft, 
  Settings, UserPlus, Info, Calendar, BookOpen, Bell, Send, Megaphone
} from 'lucide-react';
import Link from 'next/link';
import AssignmentCard from '@/components/classes/AssignmentCard';

export default function ClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.classId;

  const [classData, setClassData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assignments' | 'students'>('assignments');

  // Settings Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMaxStudents, setEditMaxStudents] = useState(40);
  const [editSubject, setEditSubject] = useState('Tin học');
  const [updating, setUpdating] = useState(false);

  // Notification Modal states
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    fetchClassInfo();
  }, [classId]);

  async function fetchClassInfo() {
    setLoading(true);
    try {
      // 1. Fetch Class Info
      const { data: cls, error: clsError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      
      if (clsError) throw clsError;
      setClassData(cls);
      setEditName(cls.name);
      setEditMaxStudents(cls.max_students);
      setEditSubject(cls.subject || 'Tin học');

      // 2. Fetch Assignments
      const { data: asgs, error: asgsError } = await supabase
        .from('assignments')
        .select('*, submissions(count)')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });
      
      if (asgsError) throw asgsError;
      setAssignments(asgs || []);

      // 3. Fetch Members (Profiles)
      const { data: mems, error: memsError } = await supabase
        .from('class_members')
        .select(`
          *,
          student:profiles(*)
        `)
        .eq('class_id', classId);
      
      if (memsError) throw memsError;
      setMembers(mems || []);

    } catch (err) {
      console.error('Error fetching class info:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateClass() {
    if (!editName) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('classes')
        .update({
          name: editName,
          max_students: editMaxStudents,
          subject: editSubject
        })
        .eq('id', classId);
      if (error) throw error;
      setClassData({ ...classData, name: editName, max_students: editMaxStudents, subject: editSubject });
      setShowSettingsModal(false);
      alert('Cập nhật thông tin lớp học thành công!');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật lớp học');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteClass() {
    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này không? Hành động này không thể hoàn tác!')) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);
      if (error) throw error;
      alert('Đã xóa lớp học thành công!');
      window.location.href = '/teacher/classes';
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi xóa lớp học');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" color="#00f3ff" size={48} />
      </div>
    );
  }

  if (!classData) return <div>Không tìm thấy lớp học.</div>;

  return (
    <div style={{ padding: '32px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/teacher/classes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Danh sách lớp
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 12px 0', color: '#fff' }}>{classData.name}</h1>
            <div style={{ display: 'flex', gap: '24px', color: '#8899a6', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={16} /> Mã lớp: <strong style={{ color: '#00f3ff' }}>{classData.code}</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> {members.length}/{classData.max_students} Học sinh</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Năm học: {classData.school_year}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setShowNotifModal(true)}
              style={{ padding: '12px', borderRadius: '12px', background: 'rgba(249,168,37,0.1)', border: '1px solid rgba(249,168,37,0.2)', color: '#f9a825', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}
              title="Gửi thông báo đến lớp"
            >
              <Megaphone size={18} /> Thông báo
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
            >
              <Settings size={20} />
            </button>
            <Link href={`/teacher/classes/${classId}/assignments/new`} style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'var(--brand-primary)', color: '#000', border: 'none',
                padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
              }}>
                <Plus size={20} /> Giao nhiệm vụ
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('assignments')}
          style={{ 
            padding: '12px 0', background: 'none', border: 'none', 
            borderBottom: activeTab === 'assignments' ? '2px solid #00f3ff' : '2px solid transparent',
            color: activeTab === 'assignments' ? '#00f3ff' : '#8899a6',
            fontSize: '16px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <ClipboardList size={20} /> Nhiệm vụ ({assignments.length})
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          style={{ 
            padding: '12px 0', background: 'none', border: 'none', 
            borderBottom: activeTab === 'students' ? '2px solid #00f3ff' : '2px solid transparent',
            color: activeTab === 'students' ? '#00f3ff' : '#8899a6',
            fontSize: '16px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Users size={20} /> Danh sách lớp ({members.length})
        </button>
      </div>

      {activeTab === 'assignments' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {assignments.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#4b5563' }}>
              <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>Chưa có nhiệm vụ nào được giao cho lớp này.</p>
            </div>
          ) : (
            assignments.map(asg => (
              <AssignmentCard
                key={asg.id}
                id={asg.id}
                classId={classId}
                title={asg.title}
                type={asg.type}
                deadline={asg.deadline}
                requirements={asg.requirements}
                submittedCount={asg.submissions?.[0]?.count || 0}
                totalMembers={members.length}
                role="teacher"
              />
            ))
          )}
        </div>
      ) : (
        <div style={{ background: 'rgba(12, 20, 36, 0.8)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Họ tên học sinh</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Email</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Ngày tham gia</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Trạng thái</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {members.map(mem => (
                <tr key={mem.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 24px', color: '#fff', fontWeight: 600 }}>{mem.student?.full_name}</td>
                  <td style={{ padding: '16px 24px', color: '#8899a6' }}>{mem.student?.email}</td>
                  <td style={{ padding: '16px 24px', color: '#8899a6' }}>{new Date(mem.joined_at).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: 700 }}>Hoạt động</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Xóa khỏi lớp</button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>Lớp học hiện chưa có học sinh nào tham gia.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotifModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(20, 28, 48, 0.95)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Megaphone size={22} color="#f9a825" /> Gửi thông báo
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#8899a6' }}>Thông báo sẽ được gửi đến tất cả học sinh trong lớp <strong style={{ color: '#fff' }}>{classData.name}</strong>.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8899a6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Tiêu đề</label>
                <input 
                  type="text" 
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  placeholder="VD: Lịch thi giữa kỳ"
                  style={{ width: '100%', background: 'rgba(5, 10, 20, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8899a6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Nội dung</label>
                <textarea 
                  value={notifMessage}
                  onChange={e => setNotifMessage(e.target.value)}
                  rows={4}
                  placeholder="Nhập nội dung thông báo..."
                  style={{ width: '100%', background: 'rgba(5, 10, 20, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', minHeight: '100px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button 
                onClick={() => { setShowNotifModal(false); setNotifTitle(''); setNotifMessage(''); }}
                style={{ background: 'transparent', color: '#8899a6', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Hủy
              </button>
              <button 
                onClick={async () => {
                  if (!notifTitle.trim() || !notifMessage.trim()) return
                  setSendingNotif(true)
                  try {
                    const res = await fetch('/api/notifications/send-class', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ class_id: classId, title: notifTitle, message: notifMessage, type: 'info' })
                    })
                    const data = await res.json()
                    if (data.success) {
                      alert(`Đã gửi thông báo thành công đến ${data.count} học sinh!`)
                      setShowNotifModal(false)
                      setNotifTitle('')
                      setNotifMessage('')
                    } else {
                      alert(data.error || 'Có lỗi xảy ra')
                    }
                  } catch (err) {
                    alert('Lỗi kết nối đến máy chủ')
                  } finally {
                    setSendingNotif(false)
                  }
                }}
                disabled={sendingNotif || !notifTitle.trim() || !notifMessage.trim()}
                style={{ background: 'var(--brand-primary)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', opacity: sendingNotif || !notifTitle.trim() || !notifMessage.trim() ? 0.6 : 1 }}
              >
                {sendingNotif ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Settings Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(20, 28, 48, 0.95)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: '#fff' }}>⚙️ Cài đặt lớp học</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#8899a6' }}>Chỉnh sửa thông tin hoặc xóa lớp học này.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8899a6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Tên lớp học</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', background: 'rgba(5, 10, 20, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8899a6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Môn học</label>
                <input 
                  type="text" 
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  style={{ width: '100%', background: 'rgba(5, 10, 20, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8899a6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Sĩ số tối đa</label>
                <input 
                  type="number" 
                  value={editMaxStudents}
                  onChange={e => setEditMaxStudents(parseInt(e.target.value) || 40)}
                  style={{ width: '100%', background: 'rgba(5, 10, 20, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '12px' }}>
              <button 
                onClick={handleDeleteClass}
                disabled={updating}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Xóa lớp
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  disabled={updating}
                  style={{ background: 'transparent', color: '#8899a6', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleUpdateClass}
                  disabled={updating}
                  style={{ background: 'var(--brand-primary)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
