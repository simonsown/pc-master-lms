'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type AutoSaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  values: T
  onSave: (values: T) => Promise<void>
  delay?: number
  disabled?: boolean
}

export function useAutoSave<T>({ values, onSave, delay = 800, disabled = false }: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const lastSaved = useRef<T>(values)
  const latestRef = useRef<T>(values)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSaveRef = useRef(onSave)
  const delayRef = useRef(delay)
  const disabledRef = useRef(disabled)

  latestRef.current = values
  onSaveRef.current = onSave
  delayRef.current = delay
  disabledRef.current = disabled

  const isDirty = JSON.stringify(values) !== JSON.stringify(lastSaved.current)

  const performSave = useCallback(async (snapshot: T) => {
    if (disabledRef.current) return
    if (JSON.stringify(snapshot) === JSON.stringify(lastSaved.current)) {
      setStatus('idle')
      return
    }
    setStatus('saving')
    try {
      await onSaveRef.current(snapshot)
      lastSaved.current = snapshot
      const stillDirty = JSON.stringify(latestRef.current) !== JSON.stringify(snapshot)
      setStatus(stillDirty ? 'dirty' : 'saved')
      if (stillDirty) {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          timerRef.current = null
          performSave(latestRef.current)
        }, delayRef.current)
      }
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (disabled) {
      lastSaved.current = values
      setStatus('idle')
      return
    }
    if (!isDirty) {
      setStatus(prev => (prev === 'saving' ? prev : 'idle'))
      return
    }
    setStatus('dirty')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      performSave(latestRef.current)
    }, delay)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    performSave(latestRef.current)
  }, [performSave])

  return { status, isDirty, flush }
}
