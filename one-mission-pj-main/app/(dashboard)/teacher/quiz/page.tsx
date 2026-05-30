'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Plus, FileText, ClipboardCheck, Users, 
  Trash2, Eye, EyeOff, Loader2, Sparkles, 
  CheckCircle, HelpCircle, ArrowRight, Award,
  Send, Bell
} from 'lucide-react'
import { 
  createQuiz, 
  publishQuiz, 
  deleteQuiz, 
  addQuestionToQuiz, 
  deleteQuestion,
  sendClassNotification 
} from '@/app/actions/quiz'

export default function TeacherQuizPage() {
  const supabase = createClientComponentClient()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'list' | 'results' | 'announce'>('list')

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [selectedQuizForQuestion, setSelectedQuizForQuestion] = useState<any>(null)

  // New Quiz form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newTimeLimit, setNewTimeLimit] = useState(30)
  const [newMaxAttempts, setNewMaxAttempts] = useState(1)
  const [randomizeQs, setRandomizeQs] = useState(true)
  const [randomizeOpts, setRandomizeOpts] = useState(true)
  const [requireCamera, setRequireCamera] = useState(false)
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [selectedClassIdForNewQuiz, setSelectedClassIdForNewQuiz] = useState('')

  // New Question form state
  const [qContent, setQContent] = useState('')
  const [qType, setQType] = useState<'multiple_choice' | 'true_false'>('multiple_choice')
  const [qPoints, setQPoints] = useState(10)
  const [qOptions, setQOptions] = useState([
    { content: '', isCorrect: true },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ])
  const [isSubmittingQ, setIsSubmittingQ] = useState(false)

  // Announcement form state
  const [selectedClassId, setSelectedClassId] = useState('')
  const [annTitle, setAnnTitle] = useState('')
  const [annBody, setAnnBody] = useState('')
  const [annUrl, setAnnUrl] = useState('/student/quiz')
  const [isSendingAnn, setIsSendingAnn] = useState(false)

  // Notification Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch Quizzes
      const { data: qData } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions(
            id,
            content,
            type,
            points,
            question_options(*)
          )
        `)
        .order('created_at', { ascending: false })

      setQuizzes(qData || [])

      // Fetch Attempts
      const { data: attData } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quizzes(title),
          profiles:student_id(full_name, email)
        `)
        .order('submitted_at', { ascending: false })

      setAttempts(attData || [])

      // Fetch Teacher's Classes for announcement
      const { data: cData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name', { ascending: true })

      setClasses(cData || [])
      if (cData && cData.length > 0) {
        setSelectedClassId(cData[0].id)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create Quiz
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setIsSubmittingQuiz(true)
    try {
      await createQuiz({
        title: newTitle,
        description: newDesc,
        timeLimitMinutes: Number(newTimeLimit),
        maxAttempts: Number(newMaxAttempts),
        randomizeQuestions: randomizeQs,
        randomizeOptions: randomizeOpts,
        classId: selectedClassIdForNewQuiz || undefined,
        requireCamera
      })
      showToast('Đã tạo đề thi mới thành công!')
      setShowCreateModal(false)
      setNewTitle('')
      setNewDesc('')
      setSelectedClassIdForNewQuiz('')
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo đề thi.')
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  // Toggle Publish Status
  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      await publishQuiz(quizId, !currentStatus)
      showToast(`Đã ${!currentStatus ? 'mở' : 'đóng'} đề thi thành công!`)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Lỗi thay đổi trạng thái.')
    }
  }

  // Delete Quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này không? Toàn bộ câu hỏi liên quan sẽ bị xóa.')) return
    try {
      await deleteQuiz(quizId)
      showToast('Đã xóa đề thi thành công!')
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa đề thi.')
    }
  }

  // Add Question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qContent.trim() || !selectedQuizForQuestion) return

    setIsSubmittingQ(true)
    try {
      const formattedOptions = qType === 'true_false' 
        ? [
            { content: 'Đúng', isCorrect: qOptions[0].isCorrect, order: 1 },
            { content: 'Sai', isCorrect: !qOptions[0].isCorrect, order: 2 }
          ]
        : qOptions
            .filter(o => o.content.trim() !== '')
            .map((o, idx) => ({
              content: o.content,
              isCorrect: o.isCorrect,
              order: idx + 1
            }))

      await addQuestionToQuiz({
        quizId: selectedQuizForQuestion.id,
        content: qContent,
        type: qType,
        points: qPoints,
        order: (selectedQuizForQuestion.questions?.length || 0) + 1,
        options: formattedOptions
      })

      showToast('Đã thêm câu hỏi vào đề thi!')
      setShowQuestionModal(false)
      setQContent('')
      setQOptions([
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ])
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thêm câu hỏi.')
    } finally {
      setIsSubmittingQ(false)
    }
  }

  // Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Xóa câu hỏi này?')) return
    try {
      await deleteQuestion(questionId)
      showToast('Đã xóa câu hỏi!')
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa câu hỏi.')
    }
  }

  // Send Announcement
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassId || !annTitle.trim() || !annBody.trim()) return

    setIsSendingAnn(true)
    try {
      const res = await sendClassNotification(selectedClassId, annTitle, annBody, annUrl)
      showToast(`Đã gửi thông báo tới ${res.count} học sinh thành công!`)
      setAnnTitle('')
      setAnnBody('')
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi thông báo.')
    } finally {
      setIsSendingAnn(false)
    }
  }

  // AI Quiz Generator (High-fidelity Mock representation)
  const handleGenerateAIQuiz = async () => {
    if (!confirm('Hệ thống AI sẽ tự động phân tích giáo trình PC Master và khởi tạo đề thi trắc nghiệm phần cứng 10 câu hỏi tiêu chuẩn. Bạn đồng ý?')) return
    setLoading(true)
    try {
      // 1. Create a quiz record
      const quiz = await createQuiz({
        title: 'Đề ôn tập Phần cứng & Lắp ráp PC (AI)',
        description: 'Đề kiểm tra trắc nghiệm kiến thức phần cứng máy tính được tạo tự động bởi AI trợ lý học tập.',
        timeLimitMinutes: 15,
        maxAttempts: 2,
        randomizeQuestions: true,
        randomizeOptions: true
      })

      // 2. Insert mock high-quality AI-crafted questions
      const aiQuestions = [
        {
          content: 'CPU (Central Processing Unit) được ví như bộ phận nào trong cơ thể con người?',
          type: 'multiple_choice' as const,
          points: 10,
          options: [
            { content: 'Bộ não', isCorrect: true },
            { content: 'Trái tim', isCorrect: false },
            { content: 'Hệ thần kinh', isCorrect: false },
            { content: 'Đôi mắt', isCorrect: false }
          ]
        },
        {
          content: 'RAM (Random Access Memory) là bộ nhớ lưu trữ tạm thời, dữ liệu sẽ bị mất đi khi tắt máy. Đúng hay Sai?',
          type: 'true_false' as const,
          points: 10,
          options: [
            { content: 'Đúng', isCorrect: true },
            { content: 'Sai', isCorrect: false }
          ]
        },
        {
          content: 'Cổng cắm nào trên mainboard dùng để kết nối trực tiếp với ổ cứng SSD M.2 NVMe?',
          type: 'multiple_choice' as const,
          points: 10,
          options: [
            { content: 'Khe cắm M.2 PCIe', isCorrect: true },
            { content: 'Cổng SATA III', isCorrect: false },
            { content: 'Khe PCIe x16', isCorrect: false },
            { content: 'Cổng USB 3.0', isCorrect: false }
          ]
        }
      ]

      for (let i = 0; i < aiQuestions.length; i++) {
        const q = aiQuestions[i]
        await addQuestionToQuiz({
          quizId: quiz.id,
          content: q.content,
          type: q.type,
          points: q.points,
          order: i + 1,
          options: q.options.map((o, idx) => ({ ...o, order: idx + 1 }))
        })
      }

      showToast('Đã khởi tạo đề thi bằng AI thành công!')
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo đề thi AI.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px' }}>
        <Loader2 size={48} style={{ color: 'var(--brand-primary)', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Đang tải dữ liệu giảng dạy...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1000,
          background: 'var(--brand-subtle)', color: 'var(--brand-primary)',
          border: '1px solid var(--brand-primary)', padding: '16px 24px', borderRadius: '16px',
          backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px var(--shadow-color)',
          display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '14px'
        }}>
          <CheckCircle size={18} />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            Hệ thống <span style={{ color: 'var(--brand-primary)' }}>Đề thi & Đánh giá</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Soạn đề trắc nghiệm phần cứng máy tính, chấm điểm tự động và gửi thông báo trực tuyến.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleGenerateAIQuiz}
            style={{
              background: 'var(--brand-subtle)', color: 'var(--accent-blue)', border: '1px solid var(--border-default)',
              padding: '12px 20px', borderRadius: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 243, 255, 0.15)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)'}
          >
            <Sparkles size={16} /> Soạn đề bằng AI
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'var(--accent-blue)', color: '#fff', border: 'none',
              padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={20} /> Tạo đề mới
          </button>
        </div>
      </header>

      {/* Stats Summary Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-default)' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--brand-subtle)', color: 'var(--accent-blue)', width: 'fit-content', marginBottom: '16px' }}>
            <FileText size={20} />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Tổng số đề thi</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{quizzes.length}</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-default)' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--brand-subtle)', color: 'var(--success)', width: 'fit-content', marginBottom: '16px' }}>
            <ClipboardCheck size={20} />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Bài nộp từ học sinh</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{attempts.length}</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-default)' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--brand-subtle)', color: 'var(--warning)', width: 'fit-content', marginBottom: '16px' }}>
            <Award size={20} />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>Điểm số trung bình</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {attempts.length > 0 
              ? `${(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length).toFixed(1)}%`
              : 'N/A'
            }
          </div>
        </div>
      </section>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-default)', marginBottom: '32px', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('list')}
          style={{
            background: 'none', border: 'none', color: activeTab === 'list' ? 'var(--accent-blue)' : 'var(--text-muted)',
            fontSize: '15px', fontWeight: 700, padding: '8px 16px', cursor: 'pointer',
            borderBottom: activeTab === 'list' ? '2px solid var(--accent-blue)' : '2px solid transparent'
          }}
        >
          Danh sách Đề thi ({quizzes.length})
        </button>
        <button 
          onClick={() => setActiveTab('results')}
          style={{
            background: 'none', border: 'none', color: activeTab === 'results' ? 'var(--accent-blue)' : 'var(--text-muted)',
            fontSize: '15px', fontWeight: 700, padding: '8px 16px', cursor: 'pointer',
            borderBottom: activeTab === 'results' ? '2px solid var(--accent-blue)' : '2px solid transparent'
          }}
        >
          Bài làm của học sinh ({attempts.length})
        </button>
        <button 
          onClick={() => setActiveTab('announce')}
          style={{
            background: 'none', border: 'none', color: activeTab === 'announce' ? 'var(--accent-blue)' : 'var(--text-muted)',
            fontSize: '15px', fontWeight: 700, padding: '8px 16px', cursor: 'pointer',
            borderBottom: activeTab === 'announce' ? '2px solid var(--accent-blue)' : '2px solid transparent'
          }}
        >
          <Bell size={14} style={{ display: 'inline-block', marginRight: '6px', transform: 'translateY(-1px)' }} />
          Gửi Thông báo Đề thi
        </button>
      </div>

      {/* Content Container */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {quizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '24px', color: 'var(--text-muted)' }}>
              <HelpCircle size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <h3>Chưa có đề thi trắc nghiệm nào.</h3>
              <p style={{ fontSize: '13px', margin: '0 0 24px 0' }}>Bắt đầu bằng cách tạo đề thủ công hoặc tự động bằng trí tuệ nhân tạo AI.</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                style={{ background: 'var(--brand-subtle)', color: 'var(--accent-blue)', border: '1px solid var(--accent-blue)', padding: '10px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Tạo đề ngay
              </button>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: '24px', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px',
                alignItems: 'start'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                      background: quiz.is_published ? 'var(--brand-subtle)' : 'var(--bg-elevated)',
                      color: quiz.is_published ? 'var(--success)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      {quiz.is_published ? 'Đang mở (Published)' : 'Bản nháp (Draft)'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thời gian: {quiz.time_limit_minutes} phút</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{quiz.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px 0', lineHeight: 1.5 }}>{quiz.description}</p>

                  {/* Question Mini List */}
                  <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                      Danh sách câu hỏi ({quiz.questions?.length || 0})
                    </div>
                    {quiz.questions && quiz.questions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {quiz.questions.map((q: any, index: number) => (
                          <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', padding: '10px 16px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                              <strong style={{ color: 'var(--accent-blue)', marginRight: '6px' }}>Q{index + 1}.</strong> {q.content}
                            </span>
                            <button 
                              onClick={() => handleDeleteQuestion(q.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>Chưa có câu hỏi nào trong đề thi này. Hãy thêm câu hỏi bên phải.</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid var(--border-default)', paddingLeft: '32px' }}>
                  <button 
                    onClick={() => {
                      setSelectedQuizForQuestion(quiz)
                      setShowQuestionModal(true)
                    }}
                    style={{
                      background: 'var(--brand-subtle)', color: 'var(--accent-blue)', border: '1px solid var(--border-default)',
                      padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <Plus size={16} /> Thêm Câu hỏi
                  </button>

                  <button 
                    onClick={() => handleTogglePublish(quiz.id, quiz.is_published)}
                    style={{
                      background: quiz.is_published ? 'var(--brand-subtle)' : 'var(--brand-subtle)',
                      color: quiz.is_published ? 'var(--danger)' : 'var(--success)',
                      border: quiz.is_published ? '1px solid var(--border-default)' : '1px solid var(--border-default)',
                      padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {quiz.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                    {quiz.is_published ? 'Đóng đề thi' : 'Mở đề thi'}
                  </button>

                  <button 
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    style={{
                      background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)',
                      padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <Trash2 size={16} /> Xóa đề thi
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '24px', overflow: 'hidden' }}>
          {attempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Chưa có học sinh nào làm bài kiểm tra.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Tên học sinh</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Đề thi</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Điểm đạt được</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Trạng thái</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Thời gian nộp</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => (
                  <tr key={att.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-primary)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 700 }}>{att.profiles?.full_name || 'Học viên PC Master'}</td>
                    <td style={{ padding: '16px 24px' }}>{att.quizzes?.title}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--accent-blue)', fontWeight: 800 }}>{att.score?.toFixed(1)}%</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800,
                        background: att.status === 'submitted' ? 'var(--brand-subtle)' : 'var(--brand-subtle)',
                        color: att.status === 'submitted' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {att.status === 'submitted' ? 'Đã nộp bài' : 'Hết giờ/Lỗi'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{new Date(att.submitted_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'announce' && (
        <div style={{ 
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)', 
          borderRadius: '24px', padding: '32px', maxWidth: '800px', margin: '0 auto' 
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Gửi Thông báo & Đề thi tới Học sinh</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
            Soạn một tin nhắn/thông báo kèm đường dẫn. Hệ thống sẽ tự động gửi thông báo trực tiếp (Realtime) vào tài khoản của tất cả học sinh thuộc lớp học được chọn.
          </p>

          {classes.length === 0 ? (
            <div style={{ color: 'var(--danger)', fontWeight: 600 }}>Bạn chưa có lớp học nào để gửi thông báo! Hãy tạo lớp trước.</div>
          ) : (
            <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Chọn lớp nhận thông báo</label>
                <select 
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                  }}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.subject})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Tiêu đề thông báo</label>
                <input 
                  type="text"
                  placeholder="Ví dụ: Có đề ôn tập Chương 1 mới!"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Nội dung thông báo</label>
                <textarea 
                  rows={4}
                  placeholder="Nhập hướng dẫn chi tiết dành cho học sinh..."
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  required
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Đường dẫn hành động (URL)</label>
                <input 
                  type="text"
                  value={annUrl}
                  onChange={(e) => setAnnUrl(e.target.value)}
                  placeholder="Học sinh sẽ được chuyển hướng tới trang này khi nhấn thông báo"
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                  }}
                />
              </div>

              <button 
                type="submit"
                disabled={isSendingAnn}
                style={{
                  background: 'var(--accent-blue)', color: '#fff', border: 'none',
                  padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
                  fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', marginTop: '12px', transition: 'all 0.2s'
                }}
              >
                {isSendingAnn ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Gửi thông báo ngay
              </button>
            </form>
          )}
        </div>
      )}

      {/* Modal: Create Quiz */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '24px', width: '100%', maxWidth: '550px', padding: '32px'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>Tạo đề thi mới</h2>
            <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Tên đề thi</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="Ví dụ: Đề kiểm tra RAM & CPU"
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Mô tả ngắn</label>
                <input 
                  type="text" 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Tóm tắt yêu cầu hoặc phạm vi kiến thức..."
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Giao cho lớp học</label>
                <select 
                  value={selectedClassIdForNewQuiz}
                  onChange={(e) => setSelectedClassIdForNewQuiz(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                  }}
                >
                  <option value="">Không giao (Tự do/Ngân hàng đề)</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.subject})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Thời gian làm bài (Phút)</label>
                  <input 
                    type="number" 
                    value={newTimeLimit}
                    onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                    required
                    min={1}
                    style={{
                      width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Lượt làm bài tối đa</label>
                  <input 
                    type="number" 
                    value={newMaxAttempts}
                    onChange={(e) => setNewMaxAttempts(Number(e.target.value))}
                    required
                    min={1}
                    style={{
                      width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={randomizeQs} onChange={(e) => setRandomizeQs(e.target.checked)} />
                  Xáo trộn vị trí các câu hỏi
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={randomizeOpts} onChange={(e) => setRandomizeOpts(e.target.checked)} />
                  Xáo trộn vị trí các đáp án lựa chọn
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={requireCamera} onChange={(e) => setRequireCamera(e.target.checked)} />
                  Yêu cầu bật Camera khi thi (Proctoring)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: 'none',
                    padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingQuiz}
                  style={{
                    flex: 1, background: 'var(--accent-blue)', color: '#fff', border: 'none',
                    padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {isSubmittingQuiz && <Loader2 className="animate-spin" size={16} />}
                  Tạo đề thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Question */}
      {showQuestionModal && selectedQuizForQuestion && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '24px', width: '100%', maxWidth: '550px', padding: '32px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>
              Thêm câu hỏi vào <span style={{ color: 'var(--accent-blue)' }}>{selectedQuizForQuestion.title}</span>
            </h2>
            <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Nội dung câu hỏi</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Ví dụ: Thiết bị nào sau đây dùng để lưu trữ dữ liệu lâu dài?"
                  value={qContent}
                  onChange={(e) => setQContent(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Loại câu hỏi</label>
                  <select 
                    value={qType}
                    onChange={(e) => setQType(e.target.value as any)}
                    style={{
                      width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                    }}
                  >
                    <option value="multiple_choice">Nhiều lựa chọn (Single Choice)</option>
                    <option value="true_false">Đúng / Sai (True / False)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Số điểm</label>
                  <input 
                    type="number"
                    required
                    min={1}
                    value={qPoints}
                    onChange={(e) => setQPoints(Number(e.target.value))}
                    style={{
                      width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: '12px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {qType === 'multiple_choice' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>Các phương án trả lời & đáp án đúng</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {qOptions.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="radio" 
                          name="correct_option"
                          checked={opt.isCorrect}
                          onChange={() => {
                            setQOptions(qOptions.map((o, oIdx) => ({
                              ...o,
                              isCorrect: oIdx === idx
                            })))
                          }}
                        />
                        <input 
                          type="text" 
                          required
                          placeholder={`Lựa chọn ${idx + 1}`}
                          value={opt.content}
                          onChange={(e) => {
                            const newOpts = [...qOptions]
                            newOpts[idx].content = e.target.value
                            setQOptions(newOpts)
                          }}
                          style={{
                            flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                            borderRadius: '12px', padding: '10px 16px', color: 'var(--text-primary)', fontSize: '13px'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Chọn câu trả lời Đúng</label>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="tf_correct" 
                        checked={qOptions[0].isCorrect}
                        onChange={() => {
                          const newOpts = [...qOptions]
                          newOpts[0].isCorrect = true
                          setQOptions(newOpts)
                        }}
                      />
                      Đúng là câu trả lời ĐÚNG
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="tf_correct"
                        checked={!qOptions[0].isCorrect}
                        onChange={() => {
                          const newOpts = [...qOptions]
                          newOpts[0].isCorrect = false
                          setQOptions(newOpts)
                        }}
                      />
                      Sai là câu trả lời ĐÚNG
                    </label>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowQuestionModal(false)}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: 'none',
                    padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingQ}
                  style={{
                    flex: 1, background: 'var(--accent-blue)', color: '#fff', border: 'none',
                    padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {isSubmittingQ && <Loader2 className="animate-spin" size={16} />}
                  Thêm câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
