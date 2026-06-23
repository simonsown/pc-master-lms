'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtime } from '@/lib/realtime-provider'
import { createBrowserClient } from '@supabase/ssr'
import { Zap, ChevronRight, Clock, Award, Flame, CheckCircle, Trophy, Star, ChevronDown, ChevronUp } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS_ICONS: Record<string, string> = {
  lesson_completed: '📖',
  exam_completed: '📝',
  quiz_completed: '🧠',
  builder_session: '🛠️',
  quest_completed: '📋',
  daily_reward: '🎁',
}

export default function LevelPage() {
  const { state, refetch } = useRealtime()
  const [activeTab, setActiveTab] = useState<'level' | 'quests' | 'titles' | 'history'>('level')
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  const {
    level, levelTitle, levelIcon, levelColor, levelProgress, xp, xpToNext, xpInLevel,
    streak, studyMinutes, levelDefs, quests, titles, xpHistory, allQuests,
  } = state

  const tabItems = [
    { key: 'level' as const, label: 'Cấp Độ', icon: <Zap size={16} /> },
    { key: 'quests' as const, label: 'Nhiệm Vụ', icon: <CheckCircle size={16} /> },
    { key: 'titles' as const, label: 'Danh Hiệu', icon: <Award size={16} /> },
    { key: 'history' as const, label: 'Lịch Sử XP', icon: <Clock size={16} /> },
  ]

  return (
    <div className="p-6 md:p-8 lg:p-10" style={{ background: 'transparent', minHeight: '100vh' }}>
      <div className="max-w-[1200px] mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-lg shadow-lg">
              {levelIcon}
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Cấp Độ &amp; Nhiệm Vụ</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Theo dõi hành trình học tập và hoàn thành nhiệm vụ mỗi ngày</p>
            </div>
          </div>
        </motion.div>

        {/* Level Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lms-card relative overflow-hidden"
          style={{
            padding: '32px',
            background: `linear-gradient(135deg, ${levelColor}15, transparent)`,
            border: `1px solid ${levelColor}30`,
          }}
        >
          <div className="absolute top-[-60px] right-[-40px] opacity-[0.04] pointer-events-none">
            <span style={{ fontSize: '180px' }}>{levelIcon}</span>
          </div>
          <div className="flex items-center gap-6 relative z-10" style={{ flexWrap: 'wrap' }}>
            <div className="text-center" style={{ minWidth: '80px' }}>
              <div style={{ fontSize: '52px', lineHeight: 1, marginBottom: '4px' }}>{levelIcon}</div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: levelColor }}>Level {level}</div>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{levelTitle}</div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${levelColor}, ${levelColor}88)` }}
                  />
                </div>
                <span className="text-xs font-bold whitespace-nowrap" style={{ color: levelColor }}>
                  {levelProgress.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{xpInLevel.toLocaleString()}</span> / {xpToNext.toLocaleString()} XP
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tổng: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{xp.toLocaleString()}</span> XP</span>
              </div>
            </div>
            <div className="flex gap-6" style={{ flexShrink: 0 }}>
              <div className="text-center">
                <Flame size={20} className="mx-auto mb-1" style={{ color: '#f59e0b' }} />
                <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{streak}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ngày</div>
              </div>
              <div className="text-center">
                <Clock size={20} className="mx-auto mb-1" style={{ color: 'var(--brand-primary)' }} />
                <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{(studyMinutes / 60).toFixed(1)}h</div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Đã học</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
          {tabItems.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer"
              style={{
                flex: 1,
                background: activeTab === tab.key ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                border: activeTab === tab.key ? '1px solid var(--border-default)' : '1px solid transparent',
              }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'level' && (
            <motion.div key="level" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="lms-card" style={{ padding: '24px' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Cây Cấp Độ</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Hành trình 20 cấp độ từ Tân Thủ đến Bất Tử</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {levelDefs.map((lvl, i) => {
                    const unlocked = xp >= lvl.xp_required
                    const isCurrent = lvl.level === level
                    const isExpanded = expandedLevel === lvl.level
                    const nextXp = levelDefs[i + 1]?.xp_required || lvl.xp_required
                    const progressInLevel = nextXp > lvl.xp_required
                      ? Math.min(((xp - lvl.xp_required) / (nextXp - lvl.xp_required)) * 100, 100)
                      : 100

                    return (
                      <div key={lvl.level}>
                        <div
                          onClick={() => setExpandedLevel(isExpanded ? null : lvl.level)}
                          className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer"
                          style={{
                            background: isCurrent ? `${levelColor}15` : unlocked ? 'var(--bg-elevated)' : 'transparent',
                            border: isCurrent ? `1px solid ${levelColor}30` : '1px solid transparent',
                            opacity: unlocked ? 1 : 0.4,
                          }}
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg text-lg" style={{
                            background: unlocked ? `${levelColor}20` : 'var(--bg-elevated)',
                            border: `1px solid ${unlocked ? levelColor + '40' : 'var(--border-default)'}`,
                          }}>
                            {lvl.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="text-sm font-bold" style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              Level {lvl.level} - {lvl.title}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {lvl.description} · yêu cầu {lvl.xp_required.toLocaleString()} XP
                            </div>
                            {unlocked && !isCurrent && (
                              <div className="text-xs font-bold mt-1" style={{ color: levelColor }}>✓ Đã đạt được</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isCurrent && (
                              <div className="text-xs font-bold px-2 py-1 rounded" style={{ background: `${levelColor}20`, color: levelColor }}>
                                Hiện tại
                              </div>
                            )}
                            <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
                          </div>
                        </div>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="px-4 py-3 mx-4 mb-2 rounded-lg"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
                          >
                            <div className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Chi tiết cấp độ</div>
                            <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <div>Yêu cầu XP: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{lvl.xp_required.toLocaleString()}</span></div>
                              <div>Danh hiệu: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{lvl.title}</span></div>
                              <div>Biểu tượng: <span>{lvl.icon}</span></div>
                            </div>
                            {unlocked && (
                              <div className="mt-3">
                                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Tiến độ trong cấp độ</div>
                                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${Math.min(progressInLevel, 100)}%`, background: levelColor }} />
                                </div>
                                <div className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
                                  {Math.min(progressInLevel, 100).toFixed(0)}%
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'quests' && (
            <motion.div key="quests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="lms-card" style={{ padding: '24px' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nhiệm Vụ Hằng Ngày</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Hoàn thành nhiệm vụ để nhận XP và danh hiệu</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Flame size={16} style={{ color: '#f59e0b' }} />
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{streak}</span> ngày liên tiếp
                  </div>
                </div>

                {allQuests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có nhiệm vụ nào. Quay lại sau!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {allQuests.map((quest) => {
                      const userQuest = quests.find(q => q.quest_id === quest.id)
                      const completed = userQuest?.is_completed || false
                      const progress = userQuest?.progress || 0
                      return (
                        <div
                          key={quest.id}
                          className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
                          style={{
                            background: completed ? 'rgba(8,158,96,0.08)' : 'var(--bg-elevated)',
                            border: `1px solid ${completed ? 'rgba(8,158,96,0.2)' : 'var(--border-default)'}`,
                            opacity: completed ? 0.7 : 1,
                          }}
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg text-lg" style={{
                            background: completed ? 'rgba(8,158,96,0.15)' : 'var(--bg-base)',
                          }}>
                            {completed ? '✅' : (quest.icon || '📋')}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="text-sm font-bold" style={{ color: completed ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                              {quest.title}
                              {completed && <span className="ml-2 text-xs">✓ Hoàn thành</span>}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{quest.description}</div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                                background: quest.difficulty === 'hard' ? 'rgba(239,68,68,0.15)' : quest.difficulty === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(8,158,96,0.15)',
                                color: quest.difficulty === 'hard' ? '#EF4444' : quest.difficulty === 'medium' ? '#F59E0B' : '#10B981',
                              }}>
                                {quest.difficulty === 'hard' ? 'Khó' : quest.difficulty === 'medium' ? 'TB' : 'Dễ'}
                              </span>
                              <span className="text-[10px] font-bold" style={{ color: 'var(--brand-primary)' }}>+{quest.xp_reward} XP</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {!completed && quest.requirement_value > 0 && (
                              <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                {progress} / {quest.requirement_value}
                              </div>
                            )}
                            <Star size={16} style={{ color: completed ? 'var(--brand-primary)' : 'var(--text-muted)', opacity: completed ? 1 : 0.3 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Completed Quests */}
              {quests.filter(q => q.is_completed).length > 0 && (
                <div className="lms-card mt-4" style={{ padding: '24px' }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
                    Nhiệm Vụ Đã Hoàn Thành ({quests.filter(q => q.is_completed).length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {quests.filter(q => q.is_completed).slice(0, 5).map(uq => (
                      <div key={uq.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                        <span>✅</span>
                        <span className="text-sm flex-1" style={{ color: 'var(--text-muted)' }}>{uq.daily_quests?.title || 'Nhiệm vụ'}</span>
                        <span className="text-xs" style={{ color: 'var(--brand-primary)' }}>+{uq.xp_earned || uq.daily_quests?.xp_reward || 0} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'titles' && (
            <motion.div key="titles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="lms-card" style={{ padding: '24px' }}>
                <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Danh Hiệu</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Mở khóa danh hiệu bằng cách hoàn thành các mốc quan trọng</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'first_lesson', title: 'Khởi Đầu', desc: 'Hoàn thành bài học đầu tiên', icon: '🎯', xp: 50 },
                    { id: 'diligent', title: 'Cần Cù', desc: 'Học 7 ngày liên tiếp', icon: '🔥', xp: 100 },
                    { id: 'perfect_score', title: 'Hoàn Hảo', desc: 'Đạt điểm 10 tuyệt đối', icon: '⭐', xp: 150 },
                    { id: 'pc_builder', title: 'Thợ PC', desc: 'Lắp ráp thành công PC đầu tiên', icon: '🖥️', xp: 100 },
                    { id: 'speed_demon', title: 'Tốc Độ', desc: 'Hoàn thành quiz trong 2 phút', icon: '⚡', xp: 120 },
                    { id: 'scholar', title: 'Học Giả', desc: 'Hoàn thành 10 bài học', icon: '📚', xp: 200 },
                    { id: 'collector', title: 'Nhà Sưu Tập', desc: 'Đạt 5000 XP', icon: '💎', xp: 300 },
                    { id: 'quest_master', title: 'Vua Nhiệm Vụ', desc: 'Hoàn thành 50 nhiệm vụ ngày', icon: '📋', xp: 250 },
                  ].map(t => {
                    const earned = titles.some(ut => ut.title_id === t.id)
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                        style={{
                          background: earned ? 'rgba(8,158,96,0.06)' : 'var(--bg-elevated)',
                          border: `1px solid ${earned ? 'rgba(8,158,96,0.15)' : 'var(--border-default)'}`,
                          opacity: earned ? 1 : 0.5,
                        }}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg text-lg" style={{
                          background: earned ? 'rgba(8,158,96,0.12)' : 'var(--bg-base)',
                        }}>
                          {earned ? t.icon : '🔒'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="text-sm font-bold" style={{ color: earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {t.title}
                            {earned && <span className="ml-1.5 text-xs" style={{ color: 'var(--brand-primary)' }}>✓</span>}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.desc}</div>
                          <div className="text-[10px] font-bold mt-0.5" style={{ color: earned ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                            +{t.xp} XP
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="lms-card" style={{ padding: '24px' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Lịch Sử XP</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>20 giao dịch XP gần nhất</p>
                  </div>
                  <div className="text-lg font-black" style={{ color: levelColor }}>
                    {xp.toLocaleString()} XP
                  </div>
                </div>

                {xpHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có giao dịch XP nào. Bắt đầu học để nhận XP!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {xpHistory.map(tx => (
                      <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all hover:bg-white/5" style={{ background: 'var(--bg-elevated)' }}>
                        <span className="text-lg">{STATUS_ICONS[tx.reference_type] || '⭐'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tx.reason}</div>
                          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(tx.created_at).toLocaleDateString('vi-VN', {
                              day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div className="text-sm font-bold flex-shrink-0" style={{ color: tx.amount > 0 ? 'var(--brand-primary)' : '#EF4444' }}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
