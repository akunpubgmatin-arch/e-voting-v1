"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  usePeriodes,
  useCreatePeriode,
  useUpdatePeriode,
  useDeletePeriode,
  type Periode,
} from "@/lib/hooks/use-periodes"
import { Plus, MoreHorizontal, Pencil, Trash2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function PeriodePage() {
  const { data: periodes, isLoading } = usePeriodes()
  const createPeriode = useCreatePeriode()
  const updatePeriode = useUpdatePeriode()
  const deletePeriode = useDeletePeriode()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPeriode, setSelectedPeriode] = useState<Periode | null>(null)
  const [newName, setNewName] = useState("")

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Nama periode harus diisi")
      return
    }
    await createPeriode.mutateAsync({ name: newName })
    setNewName("")
    setIsCreateOpen(false)
  }

  const handleEdit = async () => {
    if (!selectedPeriode || !newName.trim()) return
    await updatePeriode.mutateAsync({
      id: selectedPeriode.id,
      data: { name: newName },
    })
    setIsEditOpen(false)
    setSelectedPeriode(null)
    setNewName("")
  }

  const handleDelete = async () => {
    if (!selectedPeriode) return
    await deletePeriode.mutateAsync(selectedPeriode.id)
    setIsDeleteOpen(false)
    setSelectedPeriode(null)
  }

  const handleSetActive = async (periode: Periode) => {
    await updatePeriode.mutateAsync({
      id: periode.id,
      data: { isActive: !periode.isActive },
    })
  }

  const columns = [
    {
      key: "name",
      header: "Nama Periode",
      cell: (periode: Periode) => <span className="font-medium">{periode.name}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      cell: (periode: Periode) => (
        <Badge variant={periode.isActive ? "default" : "secondary"}>{periode.isActive ? "Aktif" : "Nonaktif"}</Badge>
      ),
    },
    {
      key: "_count",
      header: "Kandidat",
      cell: (periode: Periode) => periode._count?.candidates || 0,
    },
    {
      key: "votes",
      header: "Suara",
      cell: (periode: Periode) => periode._count?.votes || 0,
    },
    {
      key: "createdAt",
      header: "Dibuat",
      cell: (periode: Periode) => new Date(periode.createdAt).toLocaleDateString("id-ID"),
    },
    {
      key: "actions",
      header: "",
      cell: (periode: Periode) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSetActive(periode)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {periode.isActive ? "Nonaktifkan" : "Aktifkan"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedPeriode(periode)
                setNewName(periode.name)
                setIsEditOpen(true)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSelectedPeriode(periode)
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
      <DashboardHeader breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Periode" }]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader title="Manajemen Periode" description="Kelola periode pemilihan OSIS dan MPK">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Periode
          </Button>
        </PageHeader>

        <DataTable columns={columns} data={periodes || []} isLoading={isLoading} emptyMessage="Belum ada periode" />

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Periode Baru</DialogTitle>
              <DialogDescription>Buat periode pemilihan baru untuk OSIS dan MPK</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Periode</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Pemilihan 2024/2025"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreate} disabled={createPeriode.isPending}>
                {createPeriode.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Periode</DialogTitle>
              <DialogDescription>Ubah nama periode pemilihan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Nama Periode</Label>
                <Input id="editName" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEdit} disabled={updatePeriode.isPending}>
                {updatePeriode.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Hapus Periode"
          description={`Apakah Anda yakin ingin menghapus periode "${selectedPeriode?.name}"? Semua data kandidat dan suara pada periode ini akan ikut terhapus.`}
          confirmText="Hapus"
          onConfirm={handleDelete}
          isDestructive
          isLoading={deletePeriode.isPending}
        />
      </div>
    </>
  )
}
