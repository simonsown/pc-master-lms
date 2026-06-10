'use client'

import { useSessionTimeout } from '@/hooks/useSessionTimeout'

export default function SessionManager() {
  useSessionTimeout(30) // 30 minutes
  return null
}
