"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface User {
  id: string
  username: string
  fullName: string
  role: "USER" | "TEACHER" | "COMMITTEE" | "ADMIN"
  hasVotedOsis: boolean
  hasVotedMpk: boolean
  createdAt: string
  updatedAt: string
}

export function useUsers(role?: string) {
  return useQuery<User[]>({
    queryKey: ["users", role],
    queryFn: async () => {
      const url = role ? `/api/users?role=${role}` : "/api/users"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch users")
      return res.json()
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { username: string; password: string; fullName: string; role: string }) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to create user")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User berhasil dibuat")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to update user")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User berhasil diperbarui")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to delete user")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User berhasil dihapus")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const res = await fetch(`/api/users/${id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to reset password")
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success("Password berhasil direset")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useImportUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (users: { username: string; fullName: string; role?: string }[]) => {
      const res = await fetch("/api/users/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to import users")
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success(`${data.count} user berhasil diimport`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
