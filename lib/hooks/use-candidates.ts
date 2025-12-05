"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface Candidate {
  id: string
  chairmanName: string
  viceChairmanName: string
  photo: string | null
  visi: string | null
  misi: string | null
  type: "OSIS" | "MPK"
  orderNumber: number
  periodeId: string
  createdAt: string
  updatedAt: string
  _count?: {
    votes: number
  }
}

export function useCandidates(periodeId?: string) {
  return useQuery<Candidate[]>({
    queryKey: ["candidates", periodeId],
    queryFn: async () => {
      const url = periodeId ? `/api/candidates?periodeId=${periodeId}` : "/api/candidates"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch candidates")
      return res.json()
    },
    enabled: !!periodeId || periodeId === undefined,
  })
}

export function useCandidatesByType(periodeId: string, type: "OSIS" | "MPK") {
  return useQuery<Candidate[]>({
    queryKey: ["candidates", periodeId, type],
    queryFn: async () => {
      const res = await fetch(`/api/candidates?periodeId=${periodeId}&type=${type}`)
      if (!res.ok) throw new Error("Failed to fetch candidates")
      return res.json()
    },
    enabled: !!periodeId,
  })
}

export function useCreateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<Candidate, "id" | "createdAt" | "updatedAt" | "_count">) => {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to create candidate")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      toast.success("Kandidat berhasil ditambahkan")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Candidate> }) => {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to update candidate")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      toast.success("Kandidat berhasil diperbarui")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to delete candidate")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      toast.success("Kandidat berhasil dihapus")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
