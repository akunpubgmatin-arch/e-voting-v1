"use client"

import { useSession } from "next-auth/react"
import { useActivityTimeout } from "@/hooks/use-activity-timeout"

export function ActivityTimeoutProvider() {
  const { data: session } = useSession()

  useActivityTimeout({
    timeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes warning
    onWarning: () => {
      // Additional warning logic can be added here
      console.log("Activity timeout warning triggered")
    },
    onLogout: () => {
      // Additional logout logic can be added here
      console.log("Auto logout due to inactivity")
    },
  })

  // Only render if user is authenticated
  if (!session) {
    return null
  }

  return null // This component doesn't render anything visible
}