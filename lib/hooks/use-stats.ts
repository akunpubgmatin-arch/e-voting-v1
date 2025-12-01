"use client"

import { useQuery } from "@tanstack/react-query"

export interface DashboardStats {
  totalUsers: number
  totalVoters: number
  totalCandidates: number
  totalPeriodes: number
  votedOsis: number
  votedMpk: number
  participationRate: number
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats/dashboard")
      if (!res.ok) throw new Error("Failed to fetch dashboard stats")
      return res.json()
    },
  })
}
