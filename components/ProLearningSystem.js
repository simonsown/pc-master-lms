'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const SKILLS = [
  {
    id: 'scenarios',
    title: 'Build Scenarios',
    titleVn: 'Kịch bản Build',
    desc: 'Xây dựng cấu hình PC theo yêu cầu thực tế',
    descEn: 'Build PCs for real-world requirements',
    icon: '\uD83D\uDEE0\uFE0F',
    route: '/builder/scenarios',
    category: 'planning',
    color: '#22c55e',
    xp: 150,
    prerequisites: [],
  },
  {
    id: 'cable',
    title: 'Cable Management',
    titleVn: 'Quản lý Cáp',
    desc: 'Kết nối dây nguồn và dây dữ liệu chuẩn xác',
    descEn: 'Connect power and data cables correctly',
    icon: '\uD83D\uDD0C',
    route: '/builder/cable-game',
    category: 'assembly',
    color: '#FFD700',
    xp: 100,
    prerequisites: ['scenarios'],
  },
  {
    id: 'diagnosis',
    title: 'Diagnosis Mode',
    titleVn: 'Chẩn đoán lỗi',
    desc: 'Phát hiện và sửa lỗi phần cứng máy tính',
    descEn: 'Detect and fix hardware issues',
    icon: '\uD83D\uDD0D',
    route: '/builder/diagnosis',
    category: 'troubleshooting',
    color: '#3742FA',
    xp: 200,
    prerequisites: ['cable'],
  },
  {
    id: 'os-install',
    title: 'OS Installation',
    titleVn: 'Cài đặt HĐH',
    desc: 'Cài đặt Windows và driver cho PC mới ráp',
    descEn: 'Install Windows and drivers for new PC',
    icon: '\uD83D\uDCBB',
    route: '/builder/os-install',
    category: 'software',
    color: '#00CEC9',
    xp: 120,
    prerequisites: ['diagnosis'],
  },
  {
    id: 'thermal',
    title: 'Thermal Heatmap',
    titleVn: 'Bản đồ Nhiệt',
    desc: 'Mô phỏng nhiệt độ và luồng khí trong case',
    descEn: 'Simulate temperature and airflow inside case',
    icon: '\uD83D\uDD25',
    route: '/builder/thermal',
    category: 'optimization',
    color: '#FF6348',
    xp: 180,
    prerequisites: ['os-install'],
  },
  {
    id: 'mac-check',
    title: 'Mac Compatibility',
    titleVn: 'Tương thích Mac',
    desc: 'Kiểm tra phần mềm tương thích với Mac',
    descEn: 'Check software compatibility on Mac',
    icon: '\uD83C\uDF4E',
    route: '/builder/mac-check',
    category: 'compatibility',
    color: '#A29BFE',
    xp: 80,
    prerequisites: ['thermal'],
  },
];

const CATEGORIES = [
  { id: 'planning', label: 'Lập kế hoạch', labelEn: 'Planning', color: '#22c55e' },
  { id: 'assembly', label: 'Lắp ráp', labelEn: 'Assembly', color: '#FFD700' },
  { id: 'troubleshooting', label: 'Chẩn đoán', labelEn: 'Troubleshooting', color: '#3742FA' },
  { id: 'software', label: 'Phần mềm', labelEn: 'Software', color: '#00CEC9' },
  { id: 'optimization', label: 'Tối ưu', labelEn: 'Optimization', color: '#FF6348' },
  { id: 'compatibility', label: 'Tương thích', labelEn: 'Compatibility', color: '#A29BFE' },
];

const STORAGE_KEY = 'pcm_pro_learning';

function loadProgress() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function getLevel(xp) {
  if (xp < 100) return { level: 1, nextAt: 100, progress: xp / 100 };
  if (xp < 250) return { level: 2, nextAt: 250, progress: (xp - 100) / 150 };
  if (xp < 500) return { level: 3, nextAt: 500, progress: (xp - 250) / 250 };
  if (xp < 830) return { level: 4, nextAt: 830, progress: (xp - 500) / 330 };
  return { level: 5, nextAt: null, progress: 1 };
}

function SkillNode({ skill, status, progress, lang, onSelect, selected }) {
  const isSelected = selected === skill.id;
  const isLocked = status === 'locked';
  const isComplete = status === 'mastered';
  const isActive = status === 'available' || status === 'in-progress';

  const borderColor = isComplete ? skill.color : isSelected ? skill.color : isLocked ? 'rgba(255,255,255,0.06)' : skill.color + '66';
  const bgColor = isComplete ? `${skill.color}15` : isSelected ? `${skill.color}20` : isLocked ? 'rgba(255,255,255,0.02)' : `${skill.color}08`;

  return (
    <div onClick={() => !isLocked && onSelect(skill.id)}
      onMouseOver={e => { if (!isLocked && !isSelected) { e.currentTarget.style.borderColor = skill.color + '99'; e.currentTarget.style.background = `${skill.color}12`; } }}
      onMouseOut={e => { if (!isLocked && !isSelected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; } }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
        borderRadius: 12, border: `1.5px solid ${borderColor}`,
        background: bgColor, cursor: isLocked ? 'not-allowed' : 'pointer',
        transition: 'all 0.25s', opacity: isLocked ? 0.35 : 1,
        position: 'relative', overflow: 'hidden',
      }}>
      {isComplete && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, background: `linear-gradient(135deg, transparent 50%, ${skill.color}22 50%)` }} />
      )}
      <div style={{
        fontSize: 28, width: 44, height: 44, display: 'flex', alignItems: 'center',
        justifyContent: 'center', borderRadius: 10, background: isComplete ? `${skill.color}22` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isComplete ? skill.color + '44' : 'rgba(255,255,255,0.06)'}`,
        flexShrink: 0,
      }}>
        {isLocked ? '\uD83D\uDD12' : skill.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ color: isLocked ? 'rgba(255,255,255,0.3)' : 'var(--text-primary, #dde0ed)', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {lang === 'vn' ? skill.titleVn : skill.title}
          </span>
          {isComplete && <span style={{ fontSize: 10, color: skill.color, fontWeight: 700 }}>\u2713</span>}
          {isActive && !isComplete && <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 99, background: `${skill.color}22`, color: skill.color, fontWeight: 600 }}>{lang === 'vn' ? 'MỞ' : 'OPEN'}</span>}
        </div>
        <div style={{ color: isLocked ? 'rgba(255,255,255,0.2)' : 'var(--text-muted, #636678)', fontSize: 11, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lang === 'vn' ? skill.desc : skill.descEn}
        </div>
        {isComplete && (
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)` }} />
            </div>
            <span style={{ fontSize: 9, color: skill.color, fontWeight: 600, fontFamily: 'monospace' }}>100%</span>
          </div>
        )}
        {isActive && !isComplete && progress > 0 && (
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ width: `${progress}%`, height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)` }} />
            </div>
            <span style={{ fontSize: 9, color: skill.color, fontWeight: 600, fontFamily: 'monospace' }}>{progress}%</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
        +{skill.xp}XP
      </div>
      {!isLocked && (
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.15)', marginLeft: 4, flexShrink: 0 }}>\u203A</div>
      )}
    </div>
  );
}

export default function ProLearningSystem() {
  const [lang, setLang] = useState('vn');
  const [progress, setProgress] = useState({});
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [earnedXp, setEarnedXp] = useState(0);

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    let xp = 0;
    Object.entries(p).forEach(([id, data]) => {
      if (data.mastered) {
        const skill = SKILLS.find(s => s.id === id);
        if (skill) xp += skill.xp;
      }
    });
    setEarnedXp(xp);
  }, []);

  const userLevel = getLevel(earnedXp);
  const masteredCount = Object.values(progress).filter(p => p.mastered).length;
  const inProgressCount = Object.values(progress).filter(p => p.inProgress).length;
  const totalSkills = SKILLS.length;

  const getSkillStatus = useCallback((skillId) => {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return 'locked';
    const p = progress[skillId];
    if (p?.mastered) return 'mastered';
    if (p?.inProgress) return 'in-progress';
    const prereqsMet = skill.prerequisites.every(preId => progress[preId]?.mastered);
    if (skill.prerequisites.length === 0 || prereqsMet) return 'available';
    return 'locked';
  }, [progress]);

  const getSkillProgress = useCallback((skillId) => {
    const p = progress[skillId];
    return p?.progress || 0;
  }, [progress]);

  const handleSelect = useCallback((skillId) => {
    setSelected(prev => prev === skillId ? null : skillId);
  }, []);

  const handleMasterSkill = useCallback((skillId) => {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return;
    const status = getSkillStatus(skillId);
    if (status !== 'available' && status !== 'in-progress') return;
    const newProgress = { ...progress };
    newProgress[skillId] = { mastered: true, inProgress: false, progress: 100 };
    setProgress(newProgress);
    saveProgress(newProgress);
    setEarnedXp(prev => prev + skill.xp);
    setSelected(null);
  }, [progress, getSkillStatus]);

  const handleProgress = useCallback((skillId, pct) => {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return;
    const newProgress = { ...progress };
    newProgress[skillId] = { mastered: false, inProgress: true, progress: pct };
    setProgress(newProgress);
    saveProgress(newProgress);
  }, [progress]);

  const resetAll = useCallback(() => {
    setProgress({});
    saveProgress({});
    setEarnedXp(0);
    setSelected(null);
  }, []);

  const selectedSkill = selected ? SKILLS.find(s => s.id === selected) : null;
  const selectedStatus = selected ? getSkillStatus(selected) : null;

  const t = (vn, en) => lang === 'vn' ? vn : en;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base, #080910)',
      color: 'var(--text-primary, #d8dbe8)',
      fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 8px rgba(0,212,170,0.2); } 50% { box-shadow: 0 0 20px rgba(0,212,170,0.5); } }
        .skill-detail { animation: slideUp 0.3s ease-out; }
        * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'var(--bg-surface, #0f1018)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #00d4aa, #00aaff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#000',
          }}>P</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.3px' }}>{t('Hệ thống Pro Learning', 'Pro Learning System')}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted, #5a5d72)' }}>{t('Từ kịch bản Build đến Tương thích Mac', 'From Build Scenarios to Mac Compatibility')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
          }}>
            {['dashboard', 'skills'].map(tabId => (
              <button key={tabId} onClick={() => { setTab(tabId); setSelected(null); }}
                style={{
                  padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: tab === tabId ? 'rgba(0,212,170,0.12)' : 'transparent',
                  border: 'none', color: tab === tabId ? '#00d4aa' : 'var(--text-muted, #5a5d72)',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                }}>
                {tabId === 'dashboard' ? t('Tổng quan', 'Dashboard') : t('Kỹ năng', 'Skills')}
              </button>
            ))}
          </div>
          <button onClick={() => setLang(prev => prev === 'vn' ? 'en' : 'vn')}
            style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-muted, #5a5d72)', cursor: 'pointer', fontFamily: 'inherit',
            }}>
            {lang === 'vn' ? 'EN' : 'VN'}
          </button>
          <Link href="/builder"
            style={{
              padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.2)',
              color: '#00d4aa', cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.12)'; }}
          >{t('Vào Builder', 'Open Builder')}</Link>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 28px' }}>
        {tab === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              <div style={{
                padding: '18px 20px', borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,170,255,0.04))',
                border: '1px solid rgba(0,212,170,0.15)',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted, #5a5d72)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: 4 }}>
                  {t('Cấp độ', 'Level')}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#00d4aa' }}>{userLevel.level}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted, #5a5d72)' }}>/ 5</span>
                </div>
                {userLevel.nextAt && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted, #5a5d72)', marginBottom: 3 }}>
                      <span>{earnedXp} / {userLevel.nextAt} XP</span>
                      <span>{Math.round(userLevel.progress * 100)}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${userLevel.progress * 100}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #00d4aa, #00aaff)' }} />
                    </div>
                  </div>
                )}
              </div>

              {[
                { label: t('Tổng XP', 'Total XP'), value: earnedXp, color: '#FFD700', suffix: '' },
                { label: t('Đã thành thạo', 'Mastered'), value: `${masteredCount}/${totalSkills}`, color: '#22c55e', suffix: t(' kỹ năng', ' skills') },
                { label: t('Đang học', 'In Progress'), value: inProgressCount, color: '#3742FA', suffix: '' },
              ].map(item => (
                <div key={item.label} style={{ padding: '18px 20px', borderRadius: 12, background: 'var(--bg-surface, #0f1018)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted, #5a5d72)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: item.color }}>{item.value}<span style={{ fontSize: 12, color: 'var(--text-muted, #5a5d72)', fontWeight: 400 }}>{item.suffix}</span></div>
                </div>
              ))}
            </div>

            {/* Skill progress overview */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #5a5d72)', marginBottom: 12 }}>
                {t('Lộ trình kỹ năng', 'Skill Progression')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SKILLS.map((skill, i) => {
                  const status = getSkillStatus(skill.id);
                  const pct = getSkillProgress(skill.id);
                  const mastered = status === 'mastered';
                  const locked = status === 'locked';
                  const active = !locked && !mastered;
                  return (
                    <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28 }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%',
                          background: mastered ? skill.color : active ? `${skill.color}44` : 'rgba(255,255,255,0.08)',
                          border: `2px solid ${mastered ? skill.color : active ? skill.color + '88' : 'rgba(255,255,255,0.1)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: mastered ? `0 0 8px ${skill.color}66` : 'none',
                        }}>
                          {mastered && <span style={{ fontSize: 8, color: '#000', fontWeight: 800 }}>\u2713</span>}
                        </div>
                        {i < SKILLS.length - 1 && (
                          <div style={{
                            width: 2, flex: 1, minHeight: 16,
                            background: mastered ? `linear-gradient(to bottom, ${skill.color}, ${SKILLS[i + 1] ? (getSkillStatus(SKILLS[i + 1].id) === 'mastered' ? SKILLS[i + 1].color : 'rgba(255,255,255,0.06)') : 'rgba(255,255,255,0.06)'})` : 'rgba(255,255,255,0.06)',
                          }} />
                        )}
                      </div>
                      <div onClick={() => !locked && setSelected(skill.id)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 14px', borderRadius: 8, cursor: locked ? 'default' : 'pointer',
                          opacity: locked ? 0.4 : 1, transition: 'all 0.2s',
                          background: selected === skill.id ? `${skill.color}10` : 'transparent',
                        }}>
                        <span style={{ fontSize: 18 }}>{skill.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: mastered ? skill.color : locked ? 'rgba(255,255,255,0.3)' : 'var(--text-primary, #dde0ed)' }}>
                            {lang === 'vn' ? skill.titleVn : skill.title}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted, #5a5d72)' }}>
                            {locked ? t('Khóa - cần hoàn thành kỹ năng trước', 'Locked - complete previous skill first') : mastered ? t('Đã thành thạo', 'Mastered') : t('Nhấp để xem chi tiết', 'Click for details')}
                          </div>
                        </div>
                        {!locked && !mastered && (
                          <div style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 600,
                            background: `${skill.color}18`, color: skill.color,
                          }}>+{skill.xp}XP</div>
                        )}
                        {mastered && <span style={{ color: skill.color, fontSize: 14 }}>\u2713</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
              <button onClick={() => setTab('skills')}
                style={{
                  padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.2)',
                  color: '#00d4aa', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.2)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.12)'; }}
              >{t('Xem tất cả kỹ năng', 'View All Skills')}</button>
              <button onClick={resetAll}
                style={{
                  padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-muted, #5a5d72)', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >{t('Đặt lại tiến độ', 'Reset Progress')}</button>
            </div>
          </div>
        )}

        {tab === 'skills' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            {/* Category filter row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} style={{
                  padding: '4px 12px', borderRadius: 99, fontSize: 10, fontWeight: 600,
                  background: `${cat.color}12`, border: `1px solid ${cat.color}33`,
                  color: cat.color,
                }}>
                  {lang === 'vn' ? cat.label : cat.labelEn}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SKILLS.map(skill => {
                const status = getSkillStatus(skill.id);
                const pct = getSkillProgress(skill.id);
                return (
                  <SkillNode
                    key={skill.id}
                    skill={skill}
                    status={status}
                    progress={pct}
                    lang={lang}
                    onSelect={handleSelect}
                    selected={selected}
                  />
                );
              })}
            </div>

            {selectedSkill && (
              <div className="skill-detail" style={{
                marginTop: 20, padding: '20px 24px', borderRadius: 14,
                background: 'var(--bg-surface, #0f1018)',
                border: `1px solid ${selectedSkill.color}33`,
                boxShadow: `0 0 30px ${selectedSkill.color}08`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    fontSize: 42, width: 60, height: 60, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', borderRadius: 12, background: `${selectedSkill.color}15`,
                    border: `1px solid ${selectedSkill.color}33`, flexShrink: 0,
                  }}>
                    {selectedSkill.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>
                      {lang === 'vn' ? selectedSkill.titleVn : selectedSkill.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted, #5a5d72)', marginBottom: 10 }}>
                      {lang === 'vn' ? selectedSkill.desc : selectedSkill.descEn}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                      <div style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: `${selectedSkill.color}15`, color: selectedSkill.color, border: `1px solid ${selectedSkill.color}33` }}>
                        +{selectedSkill.xp} XP
                      </div>
                      <div style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted, #5a5d72)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {t('Danh mục:', 'Category:')} {lang === 'vn' ? CATEGORIES.find(c => c.id === selectedSkill.category)?.label : CATEGORIES.find(c => c.id === selectedSkill.category)?.labelEn}
                      </div>
                      <div style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted, #5a5d72)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {t('Trạng thái:', 'Status:')} {selectedStatus === 'mastered' ? t('Đã thành thạo', 'Mastered') : selectedStatus === 'locked' ? t('Bị khóa', 'Locked') : t('Sẵn sàng', 'Available')}
                      </div>
                    </div>

                    {selectedSkill.prerequisites.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted, #5a5d72)', marginBottom: 4 }}>
                          {t('Yêu cầu trước:', 'Prerequisites:')}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {selectedSkill.prerequisites.map(preId => {
                            const pre = SKILLS.find(s => s.id === preId);
                            const preStatus = getSkillStatus(preId);
                            return (
                              <div key={preId} style={{
                                padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                                background: preStatus === 'mastered' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${preStatus === 'mastered' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                color: preStatus === 'mastered' ? '#22c55e' : '#ef4444',
                              }}>
                                {preStatus === 'mastered' ? '\u2713 ' : '\u2717 '}
                                {lang === 'vn' ? pre?.titleVn : pre?.title}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Link href={selectedSkill.route}
                        style={{
                          padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                          background: `linear-gradient(135deg, ${selectedSkill.color}, ${selectedSkill.color}88)`,
                          border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'none',
                          fontFamily: 'inherit', transition: 'all 0.2s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.opacity = '0.85'; }}
                        onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
                      >
                        {selectedStatus === 'mastered' ? t('Ôn tập', 'Review') : t('Bắt đầu', 'Start')} \u2192
                      </Link>
                      {selectedStatus !== 'mastered' && (
                        <button onClick={() => handleMasterSkill(selectedSkill.id)}
                          style={{
                            padding: '10px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                            color: '#22c55e', cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }}
                        >{t('Đánh dấu hoàn thành', 'Mark Complete')}</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
