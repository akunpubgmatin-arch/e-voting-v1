"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

export interface VoteResult {
  candidateId: string
  candidateName: string
  type: "OSIS" | "MPK"
  voteCount: number
  percentage: number
}

export interface QuickCountData {
  totalVoters: number
  votedOsis: number
  votedMpk: number
  osisResults: VoteResult[]
  mpkResults: VoteResult[]
}

export function useQuickCount(periodeId?: string) {
  return useQuery<QuickCountData>({
    queryKey: ["quick-count", periodeId],
    queryFn: async () => {
      const url = periodeId ? `/api/voting/quick-count?periodeId=${periodeId}` : "/api/voting/quick-count"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch quick count")
      return res.json()
    },
    refetchInterval: 5000, // Auto refresh every 5 seconds
  })
}

export function useSubmitVote() {
  const queryClient = useQueryClient()
  const { update } = useSession()

  return useMutation({
    mutationFn: async (data: { candidateId: string; type: "OSIS" | "MPK" }) => {
      const res = await fetch("/api/voting/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to submit vote")
      }
      return res.json()
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quick-count"] })
      // Update session to reflect voted status
      await update({
        hasVotedOsis: variables.type === "OSIS" ? true : undefined,
        hasVotedMpk: variables.type === "MPK" ? true : undefined,
      })
      toast.success(`Berhasil memilih kandidat ${variables.type}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useVotingStatus() {
  return useQuery({
    queryKey: ["voting-status"],
    queryFn: async () => {
      const res = await fetch("/api/voting/status")
      if (!res.ok) throw new Error("Failed to fetch voting status")
      return res.json()
    },
  })
}
