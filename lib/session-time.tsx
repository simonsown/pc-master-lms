'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

const SESSION_START_KEY = 'session_start_time'

interface SessionTimeContextValue {
  elapsed: number
  formatted: string
}

const SessionTimeContext = createContext<SessionTimeContextValue>({
  elapsed: 0,
  formatted: '00:00:00',
})

export function useSessionTime() {
  return useContext(SessionTimeContext)
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function SessionTimeProvider({ children }: { children: React.ReactNode }) {
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    let storedStart = sessionStorage.getItem(SESSION_START_KEY)
    if (!storedStart) {
      storedStart = String(Date.now())
      sessionStorage.setItem(SESSION_START_KEY, storedStart)
    }
    startTimeRef.current = Number(storedStart)

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const value: SessionTimeContextValue = {
    elapsed,
    formatted: formatDuration(elapsed),
  }

  return (
    <SessionTimeContext.Provider value={value}>
      {children}
    </SessionTimeContext.Provider>
  )
}
