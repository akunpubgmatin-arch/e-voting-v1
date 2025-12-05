"use client"

import type React from "react"
import { useState, useRef } from "react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  useUsers,
  useCreateUser,
  useDeleteUser,
  useResetPassword,
  useImportUsers,
  type User,
} from "@/lib/hooks/use-users"
import { Plus, MoreHorizontal, Trash2, KeyRound, Upload, FileSpreadsheet, RotateCcw, AlertTriangle, Printer, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { downloadUserTemplate } from "@/lib/excel/user-template"
import { generateUserListPDF } from "@/lib/pdf/user-list"
import { parseUsersFromExcel } from "@/lib/excel/parser"

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()
  const resetPassword = useResetPassword()
  const importUsers = useImportUsers()
  const queryClient = useQueryClient()

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [isResetVoteOpen, setIsResetVoteOpen] = useState(false)
  const [isResetAllOpen, setIsResetAllOpen] = useState(false)
  const [resetConfirmationText, setResetConfirmationText] = useState("") 
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "USER",
  })

  // Filter User & Teacher Only
  const voterUsers = users?.filter((u) => ["USER", "TEACHER"].includes(u.role)) || []

  // --- MUTATION: Reset Vote ---
  const resetUserVote = useMutation({
    mutationFn: async (userId: string) => {
        const res = await fetch(`/api/users/${userId}/reset-vote`, { method: "POST" })
        if (!res.ok) throw new Error("Gagal mereset voting user")
        return res.json()
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] })
        toast.success("Status voting user berhasil direset")
        setIsResetVoteOpen(false)
        setSelectedUser(null)
    },
    onError: () => toast.error("Gagal mereset voting user"),
  })

  const resetAllVotes = useMutation({
    mutationFn: async () => {
        const res = await fetch(`/api/voting/reset-all`, { method: "POST" })
        if (!res.ok) throw new Error("Gagal mereset semua data voting")
        return res.json()
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] })
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
        toast.success("Semua data voting berhasil direset")
        setIsResetAllOpen(false)
        setResetConfirmationText("")
    },
    onError: () => toast.error("Gagal mereset data voting"),
  })

  // --- HANDLERS ---
  const handleCreate = async () => {
    if (!formData.username || !formData.password || !formData.fullName) {
      toast.error("Semua field harus diisi")
      return
    }
    await createUser.mutateAsync(formData)
    setFormData({ username: "", password: "", fullName: "", role: "USER" })
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

  const handleResetSingleVote = async () => {
    if (!selectedUser) return
    await resetUserVote.mutateAsync(selectedUser.id)
  }

  const handleResetAllVotes = async () => {
    if (resetConfirmationText !== "RESET") {
      toast.error("Konfirmasi gagal. Ketik 'RESET' dengan huruf besar.")
      return
    }
    await resetAllVotes.mutateAsync()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
        const result = await parseUsersFromExcel(file)
        
        if (!result.success) {
            result.errors.forEach(err => toast.error(err))
            return
        }
        
        if (result.warnings.length > 0) {
            result.warnings.forEach(warn => toast.warning(warn))
        }

        await importUsers.mutateAsync(result.data)
        
    } catch (e) {
        console.error(e)
        toast.error("Gagal membaca file")
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const columns: Column<User>[] = [
    {
      key: "username",
      header: "NISN / NIP",
      cell: (user: User) => <span className="font-medium">{user.username}</span>,
    },
    { key: "fullName", header: "Nama Lengkap" },
    {
      key: "role",
      header: "Role",
      cell: (user: User) => (
        <Badge variant={user.role === "TEACHER" ? "default" : "secondary"}>
          {user.role === "TEACHER" ? "Guru" : "Siswa"}
        </Badge>
      ),
    },
    {
      key: "hasVotedOsis",
      header: "Voted OSIS",
      cell: (user: User) => <Badge variant={user.hasVotedOsis ? "default" : "outline"}>{user.hasVotedOsis ? "Sudah" : "Belum"}</Badge>,
    },
    {
      key: "hasVotedMpk",
      header: "Voted MPK",
      cell: (user: User) => <Badge variant={user.hasVotedMpk ? "default" : "outline"}>{user.hasVotedMpk ? "Sudah" : "Belum"}</Badge>,
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
              <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsResetOpen(true); }}>
                <KeyRound className="mr-2 h-4 w-4" /> Reset Password
              </DropdownMenuItem>
              {(user.hasVotedOsis || user.hasVotedMpk) && (
                <DropdownMenuItem className="text-orange-600 focus:text-orange-600 bg-orange-50" onClick={() => { setSelectedUser(user); setIsResetVoteOpen(true); }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset Voting Status
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive bg-destructive/10" onClick={() => { setSelectedUser(user); setIsDeleteOpen(true); }}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        className: "w-12",
      },
  ]

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Data Pemilih" }]} />
      {/* WRAPPER UTAMA */}
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">
            
            {/* CONTAINER INDUK PUTIH */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="pb-2">
                <PageHeader title="Data Pemilih" description="Kelola data siswa dan guru sebagai pemilih">
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* RESET SEMUA */}
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsResetAllOpen(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Semua
                    </Button>

                    {/* CETAK PDF (DROPDOWN) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-white">
                                <Printer className="h-4 w-4" />
                                Cetak PDF
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white" align="end">
                            <DropdownMenuItem onClick={() => generateUserListPDF(users || [], "USER")}>
                                Data Siswa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generateUserListPDF(users || [], "TEACHER")}>
                                Data Guru
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* DOWNLOAD TEMPLATE (DROPDOWN) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-white">
                                <FileSpreadsheet className="h-4 w-4" />
                                Template
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white" align="end">
                            <DropdownMenuItem onClick={() => downloadUserTemplate("SISWA")}>
                                Template Siswa (NISN)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadUserTemplate("GURU")}>
                                Template Guru (NIP)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* IMPORT */}
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importUsers.isPending} className="bg-white">
                      <Upload className="mr-2 h-4 w-4" />
                      {importUsers.isPending ? "Importing..." : "Import"}
                    </Button>

                    {/* TAMBAH MANUAL */}
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah
                    </Button>
                  </div>
                </PageHeader>
              </div>

              <Separator />

              <Card className="bg-white border-gray-200 shadow-none p-0 gap-0 overflow-hidden">
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Daftar Pemilih</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Kelola semua data pemilih terdaftar
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable<User>
                    columns={columns}
                    data={voterUsers}
                    isLoading={isLoading}
                    emptyMessage="Belum ada data pemilih"
                    enablePagination={true}
                    defaultPageSize={10}
                    pageSizeOptions={[5, 10, 25, 50, 100]}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* --- DIALOGS --- */}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Tambah Pemilih Baru</DialogTitle>
              <DialogDescription>Tambahkan data siswa atau guru sebagai pemilih</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username (NISN/NIP)</Label>
                <Input
                  id="username"
                  placeholder="Masukkan NISN atau NIP"
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
                    <SelectItem value="USER">Siswa</SelectItem>
                    <SelectItem value="TEACHER">Guru</SelectItem>
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
          title="Hapus Pemilih"
          description={`Apakah Anda yakin ingin menghapus "${selectedUser?.fullName}"? Data voting user ini juga akan terhapus.`}
          confirmText="Hapus"
          onConfirm={handleDelete}
          isDestructive
          isLoading={deleteUser.isPending}
        />

        {/* Reset Vote Confirm */}
        <ConfirmDialog
          open={isResetVoteOpen}
          onOpenChange={setIsResetVoteOpen}
          title="Reset Voting User"
          description={`Apakah Anda yakin ingin mereset status voting untuk "${selectedUser?.fullName}"?`}
          confirmText="Reset Voting"
          onConfirm={handleResetSingleVote}
          isDestructive
          isLoading={resetUserVote.isPending}
        />

        {/* Reset All Votes Dialog */}
        <Dialog open={isResetAllOpen} onOpenChange={(open) => {
          if (!open) { setIsResetAllOpen(false); setResetConfirmationText(""); }
        }}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 text-destructive mb-2">
                <AlertTriangle className="h-6 w-6" />
                <DialogTitle className="text-xl">Reset SEMUA Voting?</DialogTitle>
              </div>
              <DialogDescription className="text-gray-600">
                Tindakan ini akan menghapus <strong>SELURUH DATA SUARA</strong>.
                <br />
                Tindakan ini <strong>TIDAK DAPAT DIBATALKAN</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="confirmText" className="text-gray-700 font-semibold">Ketik "RESET" untuk konfirmasi:</Label>
                <Input id="confirmText" value={resetConfirmationText} onChange={(e) => setResetConfirmationText(e.target.value)} placeholder="Ketik RESET disini..." className="bg-white border-red-200 focus:border-red-500 focus:ring-red-200" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetAllOpen(false)}>Batal</Button>
              <Button variant="destructive" onClick={handleResetAllVotes} disabled={resetAllVotes.isPending || resetConfirmationText !== "RESET"} className="bg-red-600 hover:bg-red-700 disabled:opacity-50">{resetAllVotes.isPending ? "Mereset..." : "Hapus Semua Suara"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  )
}