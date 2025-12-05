"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EmptyState } from "@/components/ui/empty-state"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePeriodes } from "@/lib/hooks/use-periodes"
import {
  useCandidates,
  useCreateCandidate,
  useUpdateCandidate,
  useDeleteCandidate,
  type Candidate,
} from "@/lib/hooks/use-candidates"
import { Plus, Pencil, Trash2, UserCircle } from "lucide-react"
import { toast } from "sonner"

export default function KandidatPage() {
  const { data: periodes } = usePeriodes()
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>("")
  const { data: candidates, isLoading } = useCandidates(selectedPeriodeId || undefined)
  const createCandidate = useCreateCandidate()
  const updateCandidate = useUpdateCandidate()
  const deleteCandidate = useDeleteCandidate()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [formData, setFormData] = useState({
    chairmanName: "",
    viceChairmanName: "",
    photo: "",
    visi: "",
    misi: "",
    type: "OSIS" as "OSIS" | "MPK",
    orderNumber: 1,
  })

  const resetForm = () => {
    setFormData({
      chairmanName: "",
      viceChairmanName: "",
      photo: "",
      visi: "",
      misi: "",
      type: "OSIS",
      orderNumber: 1,
    })
    setPreviewUrl("")
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 4MB")
      return
    }

    setIsUploading(true)

    try {
      const filename = `candidate-${Date.now()}-${file.name}`
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const { url } = await response.json()
      setPreviewUrl(url)
      setFormData((prev) => ({ ...prev, photo: url }))
      toast.success("Foto berhasil diupload")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Gagal mengupload foto")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreate = async () => {
    if (!selectedPeriodeId) return
    await createCandidate.mutateAsync({
      ...formData,
      periodeId: selectedPeriodeId,
    })
    resetForm()
    setIsCreateOpen(false)
  }

  const handleEdit = async () => {
    if (!selectedCandidate) return
    await updateCandidate.mutateAsync({
      id: selectedCandidate.id,
      data: formData,
    })
    setIsEditOpen(false)
    setSelectedCandidate(null)
    resetForm()
  }

  const handleDelete = async () => {
    if (!selectedCandidate) return
    await deleteCandidate.mutateAsync(selectedCandidate.id)
    setIsDeleteOpen(false)
    setSelectedCandidate(null)
  }

  const osisCandidates = candidates?.filter((c) => c.type === "OSIS") || []
  const mpkCandidates = candidates?.filter((c) => c.type === "MPK") || []

  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={candidate.photo || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">{candidate.orderNumber}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{candidate.chairmanName} & {candidate.viceChairmanName}</CardTitle>
              <CardDescription>Kandidat No. {candidate.orderNumber}</CardDescription>
            </div>
          </div>
          <Badge>{candidate.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {candidate.visi && (
          <div>
            <p className="text-sm font-medium">Visi:</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{candidate.visi}</p>
          </div>
        )}
        {candidate.misi && (
          <div>
            <p className="text-sm font-medium">Misi:</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{candidate.misi}</p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCandidate(candidate)
              setFormData({
                chairmanName: candidate.chairmanName,
                viceChairmanName: candidate.viceChairmanName,
                photo: candidate.photo || "",
                visi: candidate.visi || "",
                misi: candidate.misi || "",
                type: candidate.type as "OSIS" | "MPK",
                orderNumber: candidate.orderNumber,
              })
              setPreviewUrl(candidate.photo || "")
              setIsEditOpen(true)
            }}
          >
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive bg-transparent"
            onClick={() => {
              setSelectedCandidate(candidate)
              setIsDeleteOpen(true)
            }}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Hapus
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Kandidat" }]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader title="Manajemen Kandidat" description="Kelola kandidat OSIS dan MPK">
          <div className="flex items-center gap-2">
            <Select value={selectedPeriodeId} onValueChange={setSelectedPeriodeId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                {periodes?.map((periode) => (
                  <SelectItem key={periode.id} value={periode.id}>
                    {periode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                resetForm()
                setIsCreateOpen(true)
              }}
              disabled={!selectedPeriodeId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kandidat
            </Button>
          </div>
        </PageHeader>

        {!selectedPeriodeId ? (
          <EmptyState
            icon={UserCircle}
            title="Pilih Periode"
            description="Silakan pilih periode untuk melihat dan mengelola kandidat"
          />
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="osis">
            <TabsList>
              <TabsTrigger value="osis">OSIS ({osisCandidates.length})</TabsTrigger>
              <TabsTrigger value="mpk">MPK ({mpkCandidates.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="osis" className="mt-4">
              {osisCandidates.length === 0 ? (
                <EmptyState
                  icon={UserCircle}
                  title="Belum Ada Kandidat OSIS"
                  description="Tambahkan kandidat OSIS untuk periode ini"
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {osisCandidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="mpk" className="mt-4">
              {mpkCandidates.length === 0 ? (
                <EmptyState
                  icon={UserCircle}
                  title="Belum Ada Kandidat MPK"
                  description="Tambahkan kandidat MPK untuk periode ini"
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mpkCandidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Create/Edit Dialog */}
        <Dialog
          open={isCreateOpen || isEditOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false)
              setIsEditOpen(false)
              setSelectedCandidate(null)
              resetForm()
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditOpen ? "Edit Kandidat" : "Tambah Kandidat Baru"}</DialogTitle>
              <DialogDescription>
                {isEditOpen ? "Ubah data kandidat" : "Tambahkan kandidat baru untuk periode ini"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "OSIS" | "MPK") => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OSIS">OSIS</SelectItem>
                      <SelectItem value="MPK">MPK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Nomor Urut</Label>
                  <Input
                    id="orderNumber"
                    type="number"
                    min={1}
                    value={formData.orderNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        orderNumber: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chairmanName">Nama Ketua</Label>
                  <Input
                    id="chairmanName"
                    placeholder="Nama ketua"
                    value={formData.chairmanName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, chairmanName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="viceChairmanName">Nama Wakil</Label>
                  <Input
                    id="viceChairmanName"
                    placeholder="Nama wakil"
                    value={formData.viceChairmanName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, viceChairmanName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Foto (opsional)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
                {isUploading && <p className="text-sm text-muted-foreground">Mengupload...</p>}
                {previewUrl && (
                  <div className="mt-2">
                    <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="visi">Visi (opsional)</Label>
                <Textarea
                  id="visi"
                  placeholder="Visi kandidat"
                  value={formData.visi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, visi: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="misi">Misi (opsional)</Label>
                <Textarea
                  id="misi"
                  placeholder="Misi kandidat"
                  value={formData.misi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, misi: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  setIsEditOpen(false)
                  resetForm()
                }}
              >
                Batal
              </Button>
              <Button
                onClick={isEditOpen ? handleEdit : handleCreate}
                disabled={createCandidate.isPending || updateCandidate.isPending}
              >
                {createCandidate.isPending || updateCandidate.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Hapus Kandidat"
          description={`Apakah Anda yakin ingin menghapus kandidat "${selectedCandidate?.chairmanName} & ${selectedCandidate?.viceChairmanName}"? Semua data suara untuk kandidat ini akan ikut terhapus.`}
          confirmText="Hapus"
          onConfirm={handleDelete}
          isDestructive
          isLoading={deleteCandidate.isPending}
        />
      </div>
    </>
  )
}
