'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createPath, updateItemOrder, setUnlockCondition } from '@/actions/learning-path'
import { Plus, ArrowUp, ArrowDown, Lock, Unlock, Settings, Trash, RefreshCw } from 'lucide-react'

export default function TeacherLearningPathPage() {
  const [paths, setPaths] = useState<any[]>([])
  const [selectedPath, setSelectedPath] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const [itemTitle, setItemTitle] = useState('')
  const [itemType, setItemType] = useState<'lesson' | 'quiz' | 'lab_session'>('lesson')
  const [itemMinutes, setItemMinutes] = useState(30)

  const supabase = createClientComponentClient()

  const loadPaths = async () => {
    setLoading(true)
    const { data: lp } = await supabase.from('learning_paths').select('*').order('created_at', { ascending: false })
    if (lp && lp.length > 0) {
      setPaths(lp)
      setSelectedPath(lp[0])
      await loadItems(lp[0].id)
    }
    setLoading(false)
  }

  const loadItems = async (pathId: string) => {
    const { data: pi } = await supabase
      .from('path_items')
      .select('*')
      .eq('path_id', pathId)
      .order('order', { ascending: true })
    if (pi) setItems(pi)
  }

  useEffect(() => {
    loadPaths()
  }, [])

  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      const path = await createPath(newTitle, newDesc)
      setPaths([path, ...paths])
      setSelectedPath(path)
      setItems([])
      setNewTitle('')
      setNewDesc('')
    } catch (err) {
      alert('Lỗi khi tạo lộ trình.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemTitle.trim() || !selectedPath) return

    setSaving(true)
    const nextOrder = items.length + 1
    const defaultUnlock = nextOrder === 1 ? null : { type: 'complete_previous' }

    const { data: newItem, error } = await supabase
      .from('path_items')
      .insert({
        path_id: selectedPath.id,
        title: itemTitle,
        item_type: itemType,
        estimated_minutes: itemMinutes,
        order: nextOrder,
        unlock_condition: defaultUnlock
      })
      .select()
      .single()

    if (!error && newItem) {
      setItems([...items, newItem])
      setItemTitle('')
    }
    setSaving(false)
  }

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase.from('path_items').delete().eq('id', itemId)
    if (!error) {
      const updated = items.filter(i => i.id !== itemId).map((item, idx) => ({
        ...item,
        order: idx + 1
      }))
      setItems(updated)
      await updateItemOrder(selectedPath.id, updated.map(u => ({ id: u.id, order: u.order })))
    }
  }

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= newItems.length) return

    const temp = newItems[index]
    newItems[index] = newItems[targetIdx]
    newItems[targetIdx] = temp

    const updated = newItems.map((item, idx) => ({ ...item, order: idx + 1 }))
    setItems(updated)
    await updateItemOrder(selectedPath.id, updated.map(u => ({ id: u.id, order: u.order })))
  }

  const toggleUnlockCondition = async (item: any) => {
    const isCurrentlyLocked = !!item.unlock_condition
    const newCondition = isCurrentlyLocked ? null : { type: 'complete_previous' }
    setItems(items.map(i => i.id === item.id ? { ...i, unlock_condition: newCondition } : i))
    await setUnlockCondition(item.id, newCondition)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-2" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang tải cấu hình lộ trình...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="space-y-6">
          <div className="p-6 rounded-2xl shadow-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Lộ trình học tập</h2>
            <div className="space-y-2">
              {paths.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPath(p); loadItems(p.id); }}
                  className="w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all"
                  style={{
                    background: selectedPath?.id === p.id ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'transparent',
                    borderColor: selectedPath?.id === p.id ? 'var(--brand-primary)' : 'var(--border-default)',
                    color: selectedPath?.id === p.id ? 'var(--brand-primary)' : 'var(--text-muted)'
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl shadow-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Tạo lộ trình mới</h3>
            <form onSubmit={handleCreatePath} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Tên lộ trình..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors"
                style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              />
              <textarea
                placeholder="Mô tả lộ trình học..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors resize-none"
                style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: 'var(--brand-primary)', color: 'var(--bg-base)' }}
              >
                Tạo lộ trình
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {selectedPath ? (
            <>
              <div className="p-6 rounded-2xl shadow-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <h3 className="text-md font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Thêm nhiệm vụ vào lộ trình</h3>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Tên nhiệm vụ</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Lắp Ráp CPU vào Mainboard"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors"
                      style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Loại bài</label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as any)}
                      className="w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors"
                      style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      <option value="lesson">📖 Bài học</option>
                      <option value="quiz">📝 Trắc nghiệm</option>
                      <option value="lab_session">⚙️ Thực hành</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: 'var(--brand-primary)', color: 'var(--bg-base)' }}
                  >
                    Thêm bài
                  </button>
                </form>
              </div>

              <div className="p-6 rounded-2xl shadow-xl space-y-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <h3 className="text-md font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Chi tiết tiến trình bài giảng</h3>

                {items.length === 0 ? (
                  <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    Chưa có bài giảng nào trong lộ trình này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={item.id} className="p-4 rounded-xl flex items-center justify-between gap-4" style={{ background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)', border: '1px solid var(--border-default)' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold w-6" style={{ color: 'var(--brand-primary)' }}>#{item.order}</span>
                          <div>
                            <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                            <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {item.item_type === 'quiz' ? '📝 TRẮC NGHIỆM' : item.item_type === 'lab_session' ? '⚙️ THỰC HÀNH' : '📖 BÀI HỌC'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            disabled={idx === 0}
                            onClick={() => moveItem(idx, 'up')}
                            className="p-1.5 rounded hover:opacity-70 disabled:opacity-30"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            disabled={idx === items.length - 1}
                            onClick={() => moveItem(idx, 'down')}
                            className="p-1.5 rounded hover:opacity-70 disabled:opacity-30"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                          >
                            <ArrowDown size={14} />
                          </button>

                          <button
                            onClick={() => toggleUnlockCondition(item)}
                            className="p-1.5 rounded flex items-center gap-1 text-[10px] font-bold border transition-colors"
                            style={{
                              background: item.unlock_condition ? 'color-mix(in srgb, var(--accent-orange) 10%, transparent)' : 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                              borderColor: item.unlock_condition ? 'color-mix(in srgb, var(--accent-orange) 30%, transparent)' : 'color-mix(in srgb, var(--brand-primary) 30%, transparent)',
                              color: item.unlock_condition ? 'var(--accent-orange)' : 'var(--brand-primary)'
                            }}
                          >
                            {item.unlock_condition ? <Lock size={12} /> : <Unlock size={12} />}
                            {item.unlock_condition ? 'Khóa tuần tự' : 'Mở tự do'}
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded hover:opacity-80"
                            style={{ background: 'color-mix(in srgb, var(--accent-orange) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-orange) 20%, transparent)', color: 'var(--accent-orange)' }}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
              Hãy tạo hoặc chọn một Lộ trình ở cột bên trái để bắt đầu sắp xếp.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
