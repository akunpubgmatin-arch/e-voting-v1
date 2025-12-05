"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, Column } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUsers, useCreateUser, useDeleteUser, useResetPassword, type User } from "@/lib/hooks/use-users"
import { Plus, MoreHorizontal, Trash2, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator" // 1. Import Separator

export default function AdministratorPage() {
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()
  const resetPassword = useResetPassword()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "COMMITTEE",
  })

  const adminUsers = users?.filter((u) => ["ADMIN", "COMMITTEE"].includes(u.role)) || []

  const handleCreate = async () => {
    if (!formData.username || !formData.password || !formData.fullName) {
      toast.error("Semua field harus diisi")
      return
    }
    await createUser.mutateAsync(formData)
    setFormData({ username: "", password: "", fullName: "", role: "COMMITTEE" })
    setIsCreateOpen(false)
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    await deleteUser.mutateAsync(selectedUser.id)
    setIsDeleteOpen(false)
    setSelectedUser(null)
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return
    await resetPassword.mutateAsync({ id: selectedUser.id, newPassword })
    setIsResetOpen(false)
    setSelectedUser(null)
    setNewPassword("")
  }

  const columns: Column<User>[] = [
    {
      key: "username",
      header: "Username",
      cell: (user: User) => <span className="font-medium">{user.username}</span>,
    },
    {
      key: "fullName",
      header: "Nama Lengkap",
    },
    {
      key: "role",
      header: "Role",
      cell: (user: User) => (
        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
          {user.role === "ADMIN" ? "Administrator" : "Panitia"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Dibuat",
      cell: (user: User) => new Date(user.createdAt).toLocaleDateString("id-ID"),
    },
    {
      key: "actions",
      header: "",
      cell: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem
              onClick={() => {
                setSelectedUser(user)
                setIsResetOpen(true)
              }}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSelectedUser(user)
                setIsDeleteOpen(true)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ]

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Administrator" }]} />
      {/* 2. Main Wrapper */}
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">
            
            {/* 3. CONTAINER INDUK PUTIH */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              
              {/* Header Page */}
              <div className="pb-2">
                <PageHeader title="Administrator" description="Kelola akun administrator dan panitia">
                  <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Admin
                  </Button>
                </PageHeader>
              </div>

              <Separator />

              {/* Card Tabel Flat */}
              <Card className="bg-white border-gray-200 shadow-none p-0 gap-0 overflow-hidden">
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Daftar Administrator</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Kelola semua akun administrator dan panitia
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable<User>
                    columns={columns}
                    data={adminUsers}
                    isLoading={isLoading}
                    emptyMessage="Belum ada administrator"
                    enablePagination={true}
                    defaultPageSize={10}
                    pageSizeOptions={[5, 10, 25, 50, 100]}
                  />
                </CardContent>
              </Card>
            </div>
            {/* END CONTAINER INDUK */}

          </div>
        </div>
      </div>

      {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Tambah Administrator</DialogTitle>
              <DialogDescription>Tambahkan akun administrator atau panitia baru</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Username untuk login"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  className="bg-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password untuk login"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="bg-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  placeholder="Nama lengkap"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="bg-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="COMMITTEE">Panitia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreate} disabled={createUser.isPending}>
                {createUser.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>Reset password untuk {selectedUser?.fullName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleResetPassword} disabled={resetPassword.isPending}>
                {resetPassword.isPending ? "Menyimpan..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Hapus Administrator"
          description={`Apakah Anda yakin ingin menghapus "${selectedUser?.fullName}"?`}
          confirmText="Hapus"
          onConfirm={handleDelete}
          isDestructive
          isLoading={deleteUser.isPending}
        />
    </>
  )
}