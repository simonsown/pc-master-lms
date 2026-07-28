'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Search, CheckCircle2, ArrowLeft, ArrowRight, ChevronDown, X } from 'lucide-react';
import { PC_HARDWARE_COURSE } from '@/data/pc-hardware-course';
import { GLOSSARY } from '@/data/glossary';

const STORAGE_KEY = 'pc_course_progress_v3';

function loadProgress() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

/* ── Tooltip nhỏ cho thuật ngữ ── */

function TermTooltip({ state, onClose }) {
  const data = GLOSSARY[state.term];
  if (!data) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: Math.min(state.x, window.innerWidth - 340),
        top: state.y + 12,
        zIndex: 9999,
        width: 300,
        background: '#fff',
        border: '1.5px solid #4f46e5',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(79,70,229,0.18)',
        padding: '14px 16px',
        animation: 'tooltipIn 0.18s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <style>{`@keyframes tooltipIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            {data.category || 'Thuật ngữ kỹ thuật'}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 2 }}>{state.term}</div>
          {data.fullTitle && (
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>{data.fullTitle}</div>
          )}
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, borderLeft: '3px solid #4f46e5', paddingLeft: 8 }}>
            {data.definition}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9ca3af', marginTop: -2, flexShrink: 0 }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Xử lý nội dung HTML – gắn thẻ thuật ngữ ── */
function processContent(html) {
  if (!html) return '';
  const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  let result = html;
  const used = new Set();

  terms.forEach(term => {
    if (used.has(term)) return;
    const regex = new RegExp(`(?<![\\w>])\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b(?![\\w<])`, 'g');
    if (regex.test(result)) {
      used.add(term);
      result = result.replace(
        new RegExp(`(?<![\\w>])\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b(?![\\w<])`, 'g'),
        `<mark class="gloss-term" data-term="${term}" style="background:none;color:inherit;font-weight:inherit;border-bottom:2px dashed #4f46e5;cursor:pointer;text-decoration:none;padding-bottom:1px;border-radius:0;transition:background .15s">${term}</mark>`
      );
    }
  });
  return result;
}

/* ── View: Đọc bài học ── */
function SectionReader({
  section, stage, partTitle, onBack, progress, onToggleComplete, prevSection, nextSection, onNavigate
}) {
  const [tooltip, setTooltip] = useState(null);
  const contentRef = useRef(null);
  const isDone = !!progress[section.id];

  const processedHtml = useMemo(() => processContent(section.content || ''), [section.content]);

  const handleContentClick = useCallback((e) => {
    const target = e.target.closest('[data-term]');
    if (target) {
      const term = target.getAttribute('data-term');
      if (term && GLOSSARY[term]) {
        const rect = target.getBoundingClientRect();
        setTooltip({ term, x: rect.left, y: rect.bottom });
      }
    }
  }, []);

  // Đóng tooltip khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      const el = document.getElementById('term-tooltip-wrapper');
      if (el && !el.contains(e.target)) setTooltip(null);
    };
    if (tooltip) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [tooltip]);

  // Scroll lên đầu khi đổi bài
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [section.id]);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 16px 80px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 600, fontSize: 13, padding: 0 }}>
          <ChevronLeft size={15} /> Danh sách bài
        </button>
        <span>/</span>
        <span style={{ color: '#374151' }}>{stage.titleVn}</span>
        <span>/</span>
        <span style={{ color: '#374151' }}>{partTitle}</span>
      </div>

      {/* Tiêu đề bài học */}
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1.35, margin: '0 0 20px', borderLeft: '4px solid #4f46e5', paddingLeft: 14 }}>
        {section.title}
      </h2>

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '10px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>💡 Bấm vào từ được <span style={{ borderBottom: '2px dashed #4f46e5', color: '#4f46e5', fontWeight: 600 }}>gạch chân</span> để xem giải thích</span>
        <button
          onClick={() => onToggleComplete(section.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: isDone ? '#d1fae5' : '#ede9fe', color: isDone ? '#065f46' : '#4f46e5',
            transition: 'all 0.2s'
          }}
        >
          <CheckCircle2 size={15} />
          {isDone ? 'Đã hoàn thành' : 'Đánh dấu xong'}
        </button>
      </div>

      {/* Nội dung bài học */}
      <article
        ref={contentRef}
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        style={{ fontSize: 15.5, lineHeight: 1.85, color: '#1f2937', background: '#fff', borderRadius: 14, padding: '32px 36px', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      />

      {/* Điều hướng bài trước/sau */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
        {prevSection ? (
          <button onClick={() => onNavigate(prevSection)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Bài trước
          </button>
        ) : <div />}
        {nextSection ? (
          <button onClick={() => onNavigate(nextSection)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
            Bài tiếp theo <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={() => onToggleComplete(section.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: '#10b981', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <CheckCircle2 size={16} /> Hoàn thành chương
          </button>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div id="term-tooltip-wrapper">
          <TermTooltip state={tooltip} onClose={() => setTooltip(null)} />
        </div>
      )}

      {/* CSS nội dung bài học */}
      <style jsx global>{`
        article img.course-img, article .course-img-wrapper img {
          max-width: 100%; height: auto; border-radius: 10px; margin: 18px 0;
          box-shadow: 0 3px 12px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;
          display: block;
        }
        article .course-img-wrapper { text-align: center; margin: 20px 0; }
        article h3 { font-size: 19px; font-weight: 700; color: #111827; margin: 28px 0 10px; border-left: 3px solid #4f46e5; padding-left: 10px; }
        article h4 { font-size: 16px; font-weight: 700; color: #4f46e5; margin: 20px 0 8px; }
        article p { margin-bottom: 14px; }
        article strong, article b { color: #111827; font-weight: 700; background: #fef9c3; padding: 1px 4px; border-radius: 3px; }
        article ul, article ol { margin: 12px 0 14px 20px; }
        article li { margin-bottom: 6px; line-height: 1.6; }
        article table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; border-radius: 8px; overflow: hidden; }
        article th { background: #4f46e5; color: #fff; padding: 10px 14px; text-align: left; font-size: 13px; }
        article td { border: 1px solid #e5e7eb; padding: 9px 14px; }
        article tr:nth-child(even) td { background: #f9fafb; }
        .gloss-term:hover { background: #ede9fe !important; border-radius: 3px; }
      `}</style>
    </div>
  );
}

/* ── View: Danh sách bài học trong chương ── */
function ChapterView({ stage, progress, onSelectSection, onBack }) {
  const allSections = stage.parts.flatMap((p) => (p.sections || []).map((s) => ({ ...s, partTitle: p.titleVn })));
  const total = allSections.length;
  const done = allSections.filter((s) => progress[s.id]).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 16px 80px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 600, fontSize: 14, padding: '0 0 20px', marginBottom: 4 }}>
        <ChevronLeft size={16} /> Danh sách chương
      </button>

      {/* Header chương */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 38 }}>{stage.icon}</div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{stage.titleVn}</h2>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{total} bài học · {pct}% hoàn thành</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 99, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', borderRadius: 99, transition: 'width 0.4s' }} />
      </div>

      {/* Danh sách bài học */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stage.parts.map((part) => (
          <div key={part.id}>
            {stage.parts.length > 1 && (
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 0 6px' }}>{part.titleVn}</div>
            )}
            {(part.sections || []).map((sec, idx) => {
              const isDone = !!progress[sec.id];
              return (
                <button
                  key={sec.id}
                  onClick={() => onSelectSection(sec, part.titleVn)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    background: isDone ? '#f0fdf4' : '#fff', border: `1px solid ${isDone ? '#bbf7d0' : '#e5e7eb'}`,
                    borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#a5b4fc')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = isDone ? '#bbf7d0' : '#e5e7eb')}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? '#4f46e5' : '#f3f4f6', color: isDone ? '#fff' : '#6b7280'
                  }}>
                    {isDone ? <CheckCircle2 size={18} /> : <span style={{ fontSize: 14, fontWeight: 700, color: '#6b7280' }}>{idx + 1}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sec.title}
                    </div>
                    {isDone && <div style={{ fontSize: 12, color: '#10b981', marginTop: 2 }}>✓ Đã hoàn thành</div>}
                  </div>
                  <ChevronRight size={16} color="#d1d5db" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── View: Trang chủ – Grid các Chương ── */
function CourseHome({ progress, onSelectStage }) {
  const [search, setSearch] = useState('');

  const totalAll = PC_HARDWARE_COURSE.reduce((acc, s) => acc + s.parts.flatMap((p) => p.sections || []).length, 0);
  const doneAll = Object.keys(progress).filter(k => progress[k]).length;
  const pctAll = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

  const filtered = PC_HARDWARE_COURSE.filter(s => s.titleVn.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 80px' }}>
      {/* Hero header */}
      <div style={{ textAlign: 'center', padding: '36px 0 28px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Giáo trình Kỹ thuật Phần cứng PC
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 24px' }}>
          {PC_HARDWARE_COURSE.length} chương · {totalAll} bài học · Toàn bộ lý thuyết & hình ảnh minh họa
        </p>
        {/* Progress tổng */}
        <div style={{ maxWidth: 480, margin: '0 auto', background: '#f3f4f6', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ width: `${pctAll}%`, height: '100%', background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', borderRadius: 99, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{doneAll}/{totalAll} bài đã học ({pctAll}%)</div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto 28px' }}>
        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm chương..."
          style={{ width: '100%', padding: '11px 16px 11px 40px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827' }}
        />
      </div>

      {/* Grid chương */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((stage, idx) => {
          const sections = stage.parts.flatMap((p) => p.sections || []);
          const done = sections.filter((s) => progress[s.id]).length;
          const total = sections.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isComplete = done === total && total > 0;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage)}
              style={{
                background: '#fff', border: `1.5px solid ${isComplete ? '#a7f3d0' : '#e5e7eb'}`,
                borderRadius: 14, padding: '20px 20px 16px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.18s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#a5b4fc'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isComplete ? '#a7f3d0' : '#e5e7eb'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 28 }}>{stage.icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', background: '#ede9fe', padding: '2px 8px', borderRadius: 99 }}>Chương {idx + 1}</span>
                </div>
                {isComplete && <CheckCircle2 size={18} color="#10b981" />}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.4, marginBottom: 12 }}>
                {stage.titleVn}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                <span>{total} bài học</span>
                <span style={{ fontWeight: 600, color: pct === 100 ? '#10b981' : '#4f46e5' }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10b981' : 'linear-gradient(90deg, #4f46e5, #7c3aed)', borderRadius: 99, transition: 'width 0.4s' }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function PCourseViewer({ onBack, isUnlocked = false, onRequestUpgrade }) {
  const [progress, setProgress] = useState({});
  const [view, setView] = useState('home');
  const [activeStage, setActiveStage] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activePartTitle, setActivePartTitle] = useState('');

  useEffect(() => { setProgress(loadProgress()); }, []);

  // Flat section list để điều hướng prev/next
  const flatSections = useMemo(() => {
    const list = [];
    PC_HARDWARE_COURSE.forEach(stage => {
      stage.parts.forEach((part) => {
        (part.sections || []).forEach((sec) => {
          list.push({ sec, stageId: stage.id, partTitle: part.titleVn });
        });
      });
    });
    return list;
  }, []);

  const currentIdx = activeSection ? flatSections.findIndex(f => f.sec.id === activeSection.id) : -1;
  const isCurrentLocked = currentIdx >= 3 && !isUnlocked;

  const prevFlat = currentIdx > 0 ? flatSections[currentIdx - 1] : null;
  const nextFlat = currentIdx >= 0 && currentIdx < flatSections.length - 1 ? flatSections[currentIdx + 1] : null;

  const handleToggleComplete = (id) => {
    const updated = { ...progress, [id]: !progress[id] };
    setProgress(updated);
    saveProgress(updated);
  };

  const handleSelectStage = (stage) => { setActiveStage(stage); setView('chapter'); };

  const handleSelectSection = (sec, partTitle) => {
    const idx = flatSections.findIndex(f => f.sec.id === sec.id);
    if (idx >= 3 && !isUnlocked) {
      if (onRequestUpgrade) onRequestUpgrade();
      return;
    }
    setActiveSection(sec);
    setActivePartTitle(partTitle);
    setView('section');
  };

  const handleNavigate = (flat) => {
    const idx = flatSections.findIndex(f => f.sec.id === flat.sec.id);
    if (idx >= 3 && !isUnlocked) {
      if (onRequestUpgrade) onRequestUpgrade();
      return;
    }
    const newStage = PC_HARDWARE_COURSE.find(s => s.id === flat.stageId);
    if (newStage) setActiveStage(newStage);
    setActiveSection(flat.sec);
    setActivePartTitle(flat.partTitle);
    setView('section');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingTop: 20 }}>
      {/* Back button header if onBack is provided */}
      {onBack && (
        <div style={{ maxWidth: 1100, margin: '0 auto 12px', padding: '0 16px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb',
              color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      )}

      {view === 'home' && (
        <CourseHome progress={progress} onSelectStage={handleSelectStage} />
      )}
      {view === 'chapter' && activeStage && (
        <ChapterView
          stage={activeStage}
          progress={progress}
          onSelectSection={handleSelectSection}
          onBack={() => setView('home')}
        />
      )}
      {view === 'section' && activeSection && activeStage && (
        isCurrentLocked ? (
          <div style={{ maxWidth: 600, margin: '60px auto', padding: 32, background: '#fff', borderRadius: 16, textAlign: 'center', border: '1.5px solid #f59e0b', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <Lock size={48} style={{ color: '#f59e0b', marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Bài Học 4+ Bị Khóa</h3>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
              Bạn đã học hết 3 bài miễn phí. Vui lòng nâng cấp Gói Cá Nhân (55k/tháng) hoặc Gói Trường Học (32k/học sinh) để học tiếp 17 bài còn lại.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setView('chapter')} style={{ padding: '10px 20px', borderRadius: 8, background: '#f3f4f6', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                Quay lại danh sách
              </button>
              <button onClick={onRequestUpgrade} style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                ⚡ Nâng Cấp (Tự Động 0đ)
              </button>
            </div>
          </div>
        ) : (
          <SectionReader
            section={activeSection}
            stage={activeStage}
            partTitle={activePartTitle}
            progress={progress}
            onBack={() => setView('chapter')}
            onToggleComplete={handleToggleComplete}
            prevSection={prevFlat}
            nextSection={nextFlat}
            onNavigate={handleNavigate}
          />
        )
      )}
    </div>
  );
}

