"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface Periode {
  id: string
  name: string
  isActive: boolean
  startTime: string | null
  endTime: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    candidates: number
    votes: number
  }
}

export function usePeriodes() {
  return useQuery<Periode[]>({
    queryKey: ["periodes"],
    queryFn: async () => {
      const res = await fetch("/api/periodes")
      if (!res.ok) throw new Error("Failed to fetch periodes")
      return res.json()
    },
  })
}

export function useActivePeriode() {
  return useQuery<Periode | null>({
    queryKey: ["active-periode"],
    queryFn: async () => {
      const res = await fetch("/api/periodes/active")
      if (!res.ok) {
        if (res.status === 404) return null
        throw new Error("Failed to fetch active periode")
      }
      return res.json()
    },
  })
}

export function useCreatePeriode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch("/api/periodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to create periode")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodes"] })
      toast.success("Periode berhasil dibuat")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdatePeriode(successMessage?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Periode> }) => {
      const res = await fetch(`/api/periodes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to update periode")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodes"] })
      queryClient.invalidateQueries({ queryKey: ["active-periode"] })
      toast.success(successMessage || "Periode berhasil diperbarui")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeletePeriode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/periodes/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to delete periode")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodes"] })
      toast.success("Periode berhasil dihapus")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
