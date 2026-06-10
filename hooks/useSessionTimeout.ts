'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth-actions'

export function useSessionTimeout(timeoutMinutes: number = 30) {
  const router = useRouter()
  const timeoutMs = timeoutMinutes * 60 * 1000

  const handleLogout = useCallback(async () => {
    await logout()
    router.push('/login?session=expired')
  }, [router])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleLogout, timeoutMs)
    }

    // Events to reset the timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    resetTimer() // Initialize timer

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [handleLogout, timeoutMs])
}
