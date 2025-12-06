"use client"

import { useEffect, useRef, useCallback } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

interface UseActivityTimeoutOptions {
  timeout?: number // in milliseconds
  warningTime?: number // show warning before logout (in milliseconds)
  onWarning?: () => void
  onLogout?: () => void
}

export function useActivityTimeout({
  timeout = 30 * 60 * 1000, // 30 minutes default
  warningTime = 5 * 60 * 1000, // 5 minutes before logout
  onWarning,
  onLogout,
}: UseActivityTimeoutOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current)
    }

    // Set warning timer
    warningRef.current = setTimeout(() => {
      toast.warning("Sesi akan berakhir dalam 5 menit karena tidak ada aktivitas. Silakan lakukan aktivitas untuk memperpanjang sesi.", {
        duration: 10000,
      })
      onWarning?.()
    }, timeout - warningTime)

    // Set logout timer
    timeoutRef.current = setTimeout(async () => {
      toast.error("Sesi telah berakhir karena tidak ada aktivitas.")
      onLogout?.()
      await signOut({ callbackUrl: "/login" })
    }, timeout)
  }, [timeout, warningTime, onWarning, onLogout])

  const handleActivity = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    // Set initial timer
    resetTimer()

    // Activity events to track
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ]

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current)
      }
    }
  }, [handleActivity, resetTimer])

  // Return function to manually reset timer (useful for API calls)
  return {
    resetTimer,
    getTimeRemaining: () => {
      const elapsed = Date.now() - lastActivityRef.current
      return Math.max(0, timeout - elapsed)
    },
  }
}