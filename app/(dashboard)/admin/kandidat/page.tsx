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
import { Separator } from "@/components/ui/separator"

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
    misi: "1. ", 
    type: "OSIS" as "OSIS" | "MPK",
    orderNumber: 1,
  })

  // Style untuk inner card
  const innerCardStyle = "bg-white border-gray-200 shadow-none p-0 gap-0"

  const resetForm = () => {
    setFormData({
      chairmanName: "",
      viceChairmanName: "",
      photo: "",
      visi: "",
      misi: "1. ",
      type: "OSIS",
      orderNumber: 1,
    })
    setPreviewUrl("")
  }

  const handleAutoNumbering = (e: React.KeyboardEvent<HTMLTextAreaElement>, field: 'visi' | 'misi') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const input = e.currentTarget;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const value = input.value;
      
      const valueBeforeCursor = value.substring(0, start);
      const valueAfterCursor = value.substring(end);
      const lines = valueBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      
      const match = currentLine.match(/^(\d+)\.\s/);
      
      let newValue;
      let newCursorPos;

      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        const insertion = `\n${nextNumber}. `;
        newValue = valueBeforeCursor + insertion + valueAfterCursor;
        newCursorPos = start + insertion.length;
      } else {
        const insertion = "\n";
        newValue = valueBeforeCursor + insertion + valueAfterCursor;
        newCursorPos = start + insertion.length;
      }

      setFormData((prev) => ({ ...prev, [field]: newValue }));

      setTimeout(() => {
        input.selectionStart = input.selectionEnd = newCursorPos;
      }, 0);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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

      if (!response.ok) throw new Error("Upload failed")

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

    // VALIDASI: Cek duplikasi nomor urut
    const isDuplicate = candidates?.some(
      (c) => c.type === formData.type && c.orderNumber === formData.orderNumber
    )

    if (isDuplicate) {
      toast.error(`Nomor urut ${formData.orderNumber} sudah digunakan oleh kandidat ${formData.type} lain.`)
      return
    }

    await createCandidate.mutateAsync({ ...formData, periodeId: selectedPeriodeId })
    resetForm()
    setIsCreateOpen(false)
  }

  const handleEdit = async () => {
    if (!selectedCandidate) return

    // VALIDASI: Cek duplikasi (kecuali diri sendiri)
    const isDuplicate = candidates?.some(
      (c) => 
        c.type === formData.type && 
        c.orderNumber === formData.orderNumber && 
        c.id !== selectedCandidate.id
    )

    if (isDuplicate) {
      toast.error(`Nomor urut ${formData.orderNumber} sudah digunakan oleh kandidat ${formData.type} lain.`)
      return 
    }

    await updateCandidate.mutateAsync({ id: selectedCandidate.id, data: formData })
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

  // Fungsi helper render text
  const renderTextWithHangingIndent = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      const isListItem = /^\d+\.\s/.test(line);
      if (isListItem) {
        const [number, ...rest] = line.split('. '); 
        const content = rest.join('. '); 
        return (
          <div key={index} className="flex items-start gap-2 mb-1 last:mb-0">
            <span className="shrink-0 font-medium min-w-[1.2rem]">{number}.</span>
            <span>{content}</span>
          </div>
        );
      }
      return <div key={index} className="mb-1 last:mb-0">{line}</div>;
    });
  };

  // Card Component
  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <Card className={`${innerCardStyle} overflow-hidden flex flex-col h-full`}>
      <div className="relative aspect-[4/3] w-full bg-muted border-b border-gray-100">
        {candidate.photo ? (
          <img
            src={candidate.photo}
            alt={`${candidate.chairmanName} & ${candidate.viceChairmanName}`}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
            <UserCircle className="h-16 w-16 opacity-20" />
          </div>
        )}
        <div className="absolute right-3 top-3">
          <Badge className="shadow-sm bg-white/90 text-primary hover:bg-white backdrop-blur-sm border-white/20">
            {candidate.type}
          </Badge>
        </div>
      </div>

      <CardHeader className="px-6 pt-5 pb-2">
        <CardDescription className="text-base font-bold uppercase tracking-widest text-primary mb-4">
          Kandidat No. {candidate.orderNumber}
        </CardDescription>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Ketua
            </span>
            <p className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
              {candidate.chairmanName}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Wakil Ketua
            </span>
            <p className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
              {candidate.viceChairmanName}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-6 py-2 mt-2">
        {(candidate.visi || candidate.misi) && (
          <div className="space-y-4 text-sm text-gray-600 border-t border-dashed border-gray-200 pt-4">
            {candidate.visi && (
              <div>
                <span className="font-bold text-gray-900 block mb-1 text-xs uppercase tracking-wide">Visi</span>
                <div className="text-muted-foreground">
                  {renderTextWithHangingIndent(candidate.visi)}
                </div>
              </div>
            )}
            {candidate.misi && (
              <div>
                <span className="font-bold text-gray-900 block mb-1 text-xs uppercase tracking-wide">Misi</span>
                <div className="text-muted-foreground">
                  {renderTextWithHangingIndent(candidate.misi)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <div className="p-6 pt-2 mt-auto">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
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
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 border-gray-200 text-destructive hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive"
            onClick={() => {
              setSelectedCandidate(candidate)
              setIsDeleteOpen(true)
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  )

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Kandidat" }]} />
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="pb-2">
                <PageHeader title="Manajemen Kandidat" description="Kelola kandidat OSIS dan MPK">
                  <div className="flex items-center gap-2">
                    <Select value={selectedPeriodeId} onValueChange={setSelectedPeriodeId}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Pilih Periode" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodes?.map((periode) => (
                          <SelectItem key={periode.id} value={periode.id}>{periode.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => { resetForm(); setIsCreateOpen(true) }} disabled={!selectedPeriodeId}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Kandidat
                    </Button>
                  </div>
                </PageHeader>
              </div>
              <Separator />
              {!selectedPeriodeId ? (
                <EmptyState icon={UserCircle} title="Pilih Periode" description="Silakan pilih periode untuk melihat dan mengelola kandidat" />
              ) : isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className={`animate-pulse ${innerCardStyle}`}><CardHeader className="p-0"><div className="h-48 w-full bg-muted" /></CardHeader><CardContent className="p-6"><div className="h-4 w-3/4 bg-muted rounded" /></CardContent></Card>
                  ))}
                </div>
              ) : (
                <Tabs defaultValue="osis">
                  <TabsList>
                    <TabsTrigger value="osis">OSIS ({osisCandidates.length})</TabsTrigger>
                    <TabsTrigger value="mpk">MPK ({mpkCandidates.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="osis" className="mt-4">
                    {osisCandidates.length === 0 ? <EmptyState icon={UserCircle} title="Belum Ada Kandidat OSIS" description="Tambahkan kandidat OSIS untuk periode ini" /> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{osisCandidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)}</div>}
                  </TabsContent>
                  <TabsContent value="mpk" className="mt-4">
                    {mpkCandidates.length === 0 ? <EmptyState icon={UserCircle} title="Belum Ada Kandidat MPK" description="Tambahkan kandidat MPK untuk periode ini" /> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{mpkCandidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)}</div>}
                  </TabsContent>
                </Tabs>
              )}
            </div>

            {/* Dialog Create/Edit */}
            {/* Style Update: bg-white untuk modal dan input */}
            <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setIsEditOpen(false); setSelectedCandidate(null); resetForm(); } }}>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle>{isEditOpen ? "Edit Kandidat" : "Tambah Kandidat Baru"}</DialogTitle>
                  <DialogDescription>{isEditOpen ? "Ubah data kandidat" : "Tambahkan kandidat baru untuk periode ini"}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipe</Label>
                      <Select value={formData.type} onValueChange={(value: "OSIS" | "MPK") => setFormData((prev) => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white"><SelectItem value="OSIS">OSIS</SelectItem><SelectItem value="MPK">MPK</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderNumber">Nomor Urut</Label>
                      <Input id="orderNumber" type="number" min={1} value={formData.orderNumber} className="bg-white placeholder:text-gray-400" onChange={(e) => setFormData((prev) => ({ ...prev, orderNumber: Number.parseInt(e.target.value) || 1 }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chairmanName">Nama Ketua</Label>
                      <Input id="chairmanName" placeholder="Nama ketua" value={formData.chairmanName} className="bg-white placeholder:text-gray-400" onChange={(e) => setFormData((prev) => ({ ...prev, chairmanName: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="viceChairmanName">Nama Wakil</Label>
                      <Input id="viceChairmanName" placeholder="Nama wakil" value={formData.viceChairmanName} className="bg-white placeholder:text-gray-400" onChange={(e) => setFormData((prev) => ({ ...prev, viceChairmanName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo">Foto (opsional)</Label>
                    <Input id="photo" type="file" accept="image/*" className="bg-white" onChange={handleUpload} disabled={isUploading} />
                    {isUploading && <p className="text-sm text-muted-foreground">Mengupload...</p>}
                    {previewUrl && <div className="mt-2"><img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded border border-gray-200" /></div>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visi">Visi (opsional)</Label>
                    <Textarea
                      id="visi"
                      placeholder="Visi kandidat"
                      value={formData.visi}
                      onChange={(e) => setFormData((prev) => ({ ...prev, visi: e.target.value }))}
                      onKeyDown={(e) => handleAutoNumbering(e, 'visi')}
                      className="min-h-[100px] bg-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="misi">Misi (opsional)</Label>
                    <Textarea
                      id="misi"
                      placeholder="Contoh: 1. Meningkatkan ketaqwaan..."
                      value={formData.misi}
                      onChange={(e) => setFormData((prev) => ({ ...prev, misi: e.target.value }))}
                      onKeyDown={(e) => handleAutoNumbering(e, 'misi')}
                      className="min-h-[150px] bg-white placeholder:text-gray-400"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Tips: Ketik "1. " diawal, lalu tekan Enter untuk nomor otomatis.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); resetForm(); }}>Batal</Button>
                  <Button onClick={isEditOpen ? handleEdit : handleCreate} disabled={createCandidate.isPending || updateCandidate.isPending}>{createCandidate.isPending || updateCandidate.isPending ? "Menyimpan..." : "Simpan"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <ConfirmDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} title="Hapus Kandidat" description={`Apakah Anda yakin ingin menghapus kandidat "${selectedCandidate?.chairmanName} & ${selectedCandidate?.viceChairmanName}"? Semua data suara untuk kandidat ini akan ikut terhapus.`} confirmText="Hapus" onConfirm={handleDelete} isDestructive isLoading={deleteCandidate.isPending} />
          </div>
        </div>
      </div>
    </>
  )
}