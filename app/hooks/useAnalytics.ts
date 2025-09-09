'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function useAnalytics() {
  const { data: session } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pathname,
            userAgent: navigator.userAgent,
          }),
        })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    // Track page view after a small delay to ensure the page is loaded
    const timer = setTimeout(trackPageView, 1000)
    
    return () => clearTimeout(timer)
  }, [pathname, session])

  const trackActivity = async (action: string, metadata?: Record<string, unknown>) => {
    if (!session?.user) return

    try {
      await fetch('/api/analytics/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          metadata,
        }),
      })
    } catch (error) {
      console.error('Failed to track activity:', error)
    }
  }

  return { trackActivity }
}
