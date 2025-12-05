"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useVotingStatus, useSubmitVote } from "@/lib/hooks/use-voting"
import { Vote, CheckCircle, Clock, AlertTriangle, ArrowDown, ArrowUp, Send, UserCircle, BookOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Candidate {
  id: string
  chairmanName: string
  viceChairmanName: string
  photo: string | null
  visi: string | null
  misi: string | null
  type: string
  orderNumber: number
}

// Helper untuk render text list di dalam modal
const renderTextWithList = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => {
    const isListItem = /^\d+\.\s/.test(line);
    if (isListItem) {
      const [number, ...rest] = line.split('. ');
      const content = rest.join('. ');
      return (
        <div key={index} className="flex items-start gap-2 mb-1 last:mb-0">
          <span className="shrink-0 font-medium min-w-[1.2rem] text-primary">{number}.</span>
          <span>{content}</span>
        </div>
      );
    }
    return <div key={index} className="mb-1 last:mb-0">{line}</div>;
  });
};

export default function VotePage() {
  const { data: session, update: updateSession } = useSession()
  const { data: votingStatus, isLoading, refetch } = useVotingStatus()
  const submitVote = useSubmitVote()

  const [selectedOsis, setSelectedOsis] = useState<string | null>(null)
  const [selectedMpk, setSelectedMpk] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  
  // State untuk modal Visi Misi
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const hasVotedOsis = votingStatus?.userStatus?.hasVotedOsis ?? session?.user?.hasVotedOsis ?? false
  const hasVotedMpk = votingStatus?.userStatus?.hasVotedMpk ?? session?.user?.hasVotedMpk ?? false
  const isVotingActive = votingStatus?.isActive

  useEffect(() => {
    refetch()
  }, [refetch])

  // Style Card (Flat White)
  const innerCardStyle = "bg-white border-gray-200 shadow-none"

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Logic Toggle Select
  const handleSelect = (id: string, type: "OSIS" | "MPK") => {
    if (type === "OSIS") {
      if (selectedOsis === id) setSelectedOsis(null) // Unselect
      else setSelectedOsis(id)
    } else {
      if (selectedMpk === id) setSelectedMpk(null) // Unselect
      else setSelectedMpk(id)
    }
  }

  const handleFinalSubmit = async () => {
    if (!selectedOsis || !selectedMpk) {
      toast.error("Harap pilih kedua kandidat (OSIS & MPK) terlebih dahulu.")
      return
    }

    try {
      await Promise.all([
        submitVote.mutateAsync({ candidateId: selectedOsis, type: "OSIS" }),
        submitVote.mutateAsync({ candidateId: selectedMpk, type: "MPK" })
      ])

      await updateSession({
        hasVotedOsis: true,
        hasVotedMpk: true,
      })
      refetch()
      setIsConfirmOpen(false)
      toast.success("Suara Anda berhasil disimpan! Terima kasih.")
      setSelectedOsis(null)
      setSelectedMpk(null)

    } catch (error) {
      console.error(error)
      toast.error("Gagal menyimpan suara. Silakan coba lagi.")
    }
  }

  const getCandidateDetails = (id: string | null, type: "OSIS" | "MPK") => {
    const list = type === "OSIS" ? votingStatus?.candidates?.osis : votingStatus?.candidates?.mpk
    return list?.find((c: Candidate) => c.id === id)
  }

  const renderFloatingButton = () => {
    if (!isVotingActive || (hasVotedOsis && hasVotedMpk)) return null

    // Jika belum pilih apapun
    if (!selectedOsis && !selectedMpk) return null

    // Tombol Navigasi Cerdas
    if (selectedOsis && !selectedMpk) {
      return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <Button 
            onClick={() => scrollToSection("section-mpk")} 
            className="h-10 px-6 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 text-white font-medium"
          >
            Pilih MPK <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    }

    if (!selectedOsis && selectedMpk) {
      return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <Button 
            onClick={() => scrollToSection("section-osis")} 
            className="h-10 px-6 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 text-white font-medium"
          >
            Pilih OSIS <ArrowUp className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    }

    // Tombol Selesai (Ukuran disamakan dengan button Tambah Kandidat: h-9 / h-10 standard)
    if (selectedOsis && selectedMpk) {
      return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in zoom-in">
          <Button 
            onClick={() => setIsConfirmOpen(true)} 
            className="h-10 px-6 rounded-full shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white font-medium"
          >
            Selesai Memilih <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    }
  }

  // --- COMPONENT CARD (Refactored to match Admin) ---
  const CandidateCard = ({
    candidate,
    isSelected,
    onSelect,
    disabled,
  }: {
    candidate: Candidate
    isSelected: boolean
    onSelect: () => void
    disabled: boolean
  }) => (
    <Card className={`${innerCardStyle} overflow-hidden flex flex-col h-full relative group border-2 ${isSelected ? "border-primary ring-4 ring-primary/10" : "border-gray-200 hover:border-primary/50"}`}>
      
      {/* Indikator Terpilih (Pojok Kanan Atas Gambar) */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-20 bg-primary text-white rounded-full p-1 shadow-lg animate-in zoom-in">
          <CheckCircle className="h-5 w-5" />
        </div>
      )}

      {/* GAMBAR POSTER (4:3) */}
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
        {/* Badge Nomor Urut (Pojok Kiri Bawah Gambar - Style Admin) */}
        {!isSelected && (
           <div className="absolute right-3 top-3">
            <Badge className="shadow-sm bg-white/90 text-primary hover:bg-white backdrop-blur-sm border-white/20">
              {candidate.type}
            </Badge>
          </div>
        )}
      </div>

      {/* HEADER: Layout Grid (Ketua & Wakil) */}
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

      {/* CONTENT: Tombol Visi Misi */}
      <CardContent className="flex-1 px-6 py-2 mt-2">
        <div className="border-t border-dashed border-gray-200 pt-4">
           <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary h-9"
            onClick={(e) => {
              e.stopPropagation();
              setDetailCandidate(candidate);
              setIsDetailOpen(true);
            }}
          >
            <BookOpen className="h-4 w-4" />
            Lihat Visi & Misi
          </Button>
        </div>
      </CardContent>

      {/* FOOTER: Tombol Pilih */}
      <div className="p-6 pt-0 mt-auto">
        <Button 
          variant={isSelected ? "default" : "secondary"}
          className={cn(
            "w-full font-bold transition-all h-9", // Ukuran h-9 (sama dengan Admin)
            isSelected ? "bg-primary hover:bg-primary/90" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
          )}
          onClick={(e) => {
            e.stopPropagation();
            !disabled && onSelect();
          }}
          disabled={disabled && !isSelected}
        >
          {isSelected ? "Batalkan Pilihan" : "Pilih Kandidat Ini"}
        </Button>
      </div>
    </Card>
  )

  if (isLoading) {
    return (
      <>
        <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Vote" }]} />
        <div className="min-h-screen bg-gray-50/50 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>
          </div>
        </div>
      </>
    )
  }

  if (!isVotingActive) {
    return (
      <>
        <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Vote" }]} />
        <div className="min-h-screen bg-gray-50/50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <PageHeader title="Voting" description="Voting belum dibuka" />
              <Separator />
              <EmptyState icon={Clock} title="Voting Belum Dibuka" description="Silakan tunggu informasi dari panitia." />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (hasVotedOsis && hasVotedMpk) {
    return (
      <>
        <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Vote" }]} />
        <div className="min-h-screen bg-gray-50/50 p-8 flex items-center justify-center">
          <Card className="max-w-lg w-full text-center p-8 border-0 shadow-lg bg-white">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Terima Kasih!</h2>
            <p className="text-gray-500 mb-6">
              Anda telah menggunakan hak suara untuk pemilihan Ketua OSIS dan MPK. Pilihan Anda telah tersimpan dengan aman.
            </p>
            <Button asChild variant="outline" className="w-full h-10">
              <a href="/user/dashboard">Kembali ke Dashboard</a>
            </Button>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Vote" }]} />
      <div className="min-h-screen bg-gray-50/50 relative pb-32"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex flex-col gap-8">
            
            {/* Header Area */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <PageHeader 
                title={`Pemilihan ${votingStatus?.periode?.name}`} 
                description="Silakan pilih satu kandidat Ketua OSIS dan satu kandidat Ketua MPK."
              >
                {votingStatus?.periode?.endTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                    <Clock className="h-4 w-4" />
                    <span>Selesai: {new Date(votingStatus.periode.endTime).toLocaleString("id-ID")}</span>
                  </div>
                )}
              </PageHeader>
            </div>

            {/* --- BAGIAN 1: OSIS --- */}
            <div id="section-osis" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">1. Calon Ketua & Wakil OSIS</h2>
                {hasVotedOsis && <Badge variant="default" className="bg-green-600">Sudah Memilih</Badge>}
              </div>
              
              {votingStatus?.candidates?.osis?.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="Belum Ada Kandidat" description="Tidak ada kandidat OSIS yang terdaftar." />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {votingStatus?.candidates?.osis?.map((candidate: Candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      isSelected={selectedOsis === candidate.id}
                      onSelect={() => handleSelect(candidate.id, "OSIS")}
                      disabled={hasVotedOsis}
                    />
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-2" />

            {/* --- BAGIAN 2: MPK --- */}
            <div id="section-mpk" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">2. Calon Ketua & Wakil MPK</h2>
                {hasVotedMpk && <Badge variant="default" className="bg-green-600">Sudah Memilih</Badge>}
              </div>

              {votingStatus?.candidates?.mpk?.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="Belum Ada Kandidat" description="Tidak ada kandidat MPK yang terdaftar." />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {votingStatus?.candidates?.mpk?.map((candidate: Candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      isSelected={selectedMpk === candidate.id}
                      onSelect={() => handleSelect(candidate.id, "MPK")}
                      disabled={hasVotedMpk}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Floating Action Button */}
        {renderFloatingButton()}

        {/* Modal Konfirmasi Akhir */}
        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          title="Konfirmasi Pilihan Anda"
          description="Pastikan pilihan Anda sudah sesuai. Anda tidak dapat mengubah pilihan setelah menekan tombol Kirim."
          confirmText="Ya, Kirim Suara Saya"
          onConfirm={handleFinalSubmit}
          isLoading={submitVote.isPending}
        >
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full"><Vote className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Pilihan OSIS</p>
                <p className="font-semibold text-gray-900">
                  {getCandidateDetails(selectedOsis, "OSIS")?.chairmanName} & {getCandidateDetails(selectedOsis, "OSIS")?.viceChairmanName}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-2 rounded-full"><Vote className="h-4 w-4 text-orange-600" /></div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Pilihan MPK</p>
                <p className="font-semibold text-gray-900">
                  {getCandidateDetails(selectedMpk, "MPK")?.chairmanName} & {getCandidateDetails(selectedMpk, "MPK")?.viceChairmanName}
                </p>
              </div>
            </div>
          </div>
        </ConfirmDialog>

        {/* MODAL DETAIL VISI MISI */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                Visi & Misi Kandidat No. {detailCandidate?.orderNumber}
              </DialogTitle>
              <DialogDescription className="text-center">
                {detailCandidate?.chairmanName} & {detailCandidate?.viceChairmanName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-6">
              {/* Foto di dalam Modal */}
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted border">
                 {detailCandidate?.photo ? (
                  <img
                    src={detailCandidate.photo}
                    alt="Foto Paslon"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <UserCircle className="h-12 w-12" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-primary uppercase tracking-wider text-sm border-b pb-1">Visi</h4>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {renderTextWithList(detailCandidate?.visi || "-")}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-primary uppercase tracking-wider text-sm border-b pb-1">Misi</h4>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {renderTextWithList(detailCandidate?.misi || "-")}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsDetailOpen(false)} className="w-full sm:w-auto h-9">
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  )
}