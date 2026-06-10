'use client'

import React, { useEffect, useState } from 'react'
import { startBuilderSession, endBuilderSession } from '@/app/actions/trackingActions'

// HOC for adding tracking to the builder component
export function withTracking(WrappedComponent: React.ComponentType<any>) {
  return function TrackingWrapper(props: any) {
    const [sessionId, setSessionId] = useState<string | null>(null)

    useEffect(() => {
      let activeSession: string | null = null;
      
      const initTracking = async () => {
        try {
          const sid = await startBuilderSession(props.lessonId)
          activeSession = sid
          setSessionId(sid)
        } catch (e) {
          console.error("Failed to start builder session tracking", e)
        }
      }
      
      initTracking()

      return () => {
        if (activeSession) {
          // Send final stats when unmounting
          // In a real app, you would pass refs or state values here
          endBuilderSession(activeSession, {
            components_used: [], // Mock data
            tdp_calculated: 0,
            compatibility_score: 100
          }).catch(console.error)
        }
      }
    }, [props.lessonId])

    return <WrappedComponent {...props} sessionId={sessionId} />
  }
}
