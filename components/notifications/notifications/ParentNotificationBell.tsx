'use client'

import React from 'react'
import { NotificationBell } from './NotificationBell'

export function ParentNotificationBell({ userId }: { userId?: string }) {
  return (
    <NotificationBell
      userId={userId}
      filterTypes={[
        'child_absent',
        'child_low_score',
        'child_completed_path',
        'lesson_completed',
        'quiz_graded',
        'achievement_earned'
      ]}
    />
  )
}
