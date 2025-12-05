"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useVotingStatus, useSubmitVote } from "@/lib/hooks/use-voting"
import { Vote, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator" // 1. Import Separator

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

export default function VotePage() {
  const { data: session, update: updateSession } = useSession()
  const { data: votingStatus, isLoading } = useVotingStatus()
  const submitVote = useSubmitVote()

  const [selectedOsis, setSelectedOsis] = useState<string | null>(null)
  const [selectedMpk, setSelectedMpk] = useState<string | null>(null)
  const [confirmType, setConfirmType] = useState<"OSIS" | "MPK" | null>(null)

  const hasVotedOsis = session?.user?.hasVotedOsis
  const hasVotedMpk = session?.user?.hasVotedMpk
  const isVotingActive = votingStatus?.isActive

  const handleVote = async () => {
    if (!confirmType) return

    const candidateId = confirmType === "OSIS" ? selectedOsis : selectedMpk
    if (!candidateId) return

    await submitVote.mutateAsync({ candidateId, type: confirmType })

    // Update session to reflect new voting status
    await updateSession({
      hasVotedOsis: confirmType === "OSIS" ? true : hasVotedOsis,
      hasVotedMpk: confirmType === "MPK" ? true : hasVotedMpk,
    })

    setConfirmType(null)
    if (confirmType === "OSIS") setSelectedOsis(null)
    if (confirmType === "MPK") setSelectedMpk(null)
  }

  const getSelectedCandidate = () => {
    if (!confirmType) return null
    const candidates = confirmType === "OSIS" ? votingStatus?.candidates?.osis : votingStatus?.candidates?.mpk
    const selectedId = confirmType === "OSIS" ? selectedOsis : selectedMpk
    return candidates?.find((c: Candidate) => c.id === selectedId)
  }

  // 2. Candidate Card dengan styling yang pas di dalam container putih
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
    <Card
      className={cn(
        "cursor-pointer transition-all border-2", // border-2 agar outline lebih jelas saat hover/active
        isSelected 
          ? "border-primary ring-4 ring-primary/10 shadow-md bg-primary/5" 
          : "border-gray-100 hover:border-primary/50 hover:shadow-md bg-white",
        disabled && "opacity-50 cursor-not-allowed grayscale",
      )}
      onClick={() => !disabled && onSelect()}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src={candidate.photo || undefined} className="object-cover" />
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {candidate.orderNumber}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{candidate.chairmanName} & {candidate.viceChairmanName}</CardTitle>
            <CardDescription className="font-medium text-primary">Kandidat No. {candidate.orderNumber}</CardDescription>
          </div>
          {isSelected && <CheckCircle className="h-8 w-8 text-primary fill-primary/20" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {candidate.visi && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Visi</p>
            <p className="text-sm text-gray-700 line-clamp-2">{candidate.visi}</p>
          </div>
        )}
        {candidate.misi && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Misi</p>
            <p className="text-sm text-gray-700 line-clamp-2 whitespace-pre-line">{candidate.misi}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Vote" }]} />
      {/* 3. Main Wrapper */}
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">
            
            {/* 4. CONTAINER INDUK PUTIH */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              
              {/* Header */}
              <div className="pb-2">
                <PageHeader 
                  title="Voting" 
                  description={
                    isLoading ? "Memuat data voting..." : 
                    isVotingActive ? `Pemilihan ${votingStatus?.periode?.name}` : "Voting belum dibuka"
                  }
                >
                  {isVotingActive && votingStatus?.periode?.endTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      <Clock className="h-4 w-4" />
                      <span>
                        Berakhir: {new Date(votingStatus.periode.endTime).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </PageHeader>
              </div>

              <Separator />

              {/* Konten Utama */}
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-10 w-48" />
                  <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : !isVotingActive ? (
                <EmptyState
                  icon={Clock}
                  title="Voting Belum Dibuka"
                  description="Saat ini tidak ada pemilihan yang sedang berlangsung. Silakan tunggu informasi dari panitia."
                />
              ) : (
                <>
                  <Tabs defaultValue={!hasVotedOsis ? "osis" : !hasVotedMpk ? "mpk" : "osis"}>
                    <TabsList className="grid w-full grid-cols-2 max-w-md mb-6 bg-gray-100 p-1">
                      <TabsTrigger value="osis" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        OSIS
                        {hasVotedOsis && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
                      </TabsTrigger>
                      <TabsTrigger value="mpk" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        MPK
                        {hasVotedMpk && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="osis" className="mt-0">
                      {hasVotedOsis ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50/50 rounded-xl border border-green-100">
                          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-green-800">Anda sudah memilih kandidat OSIS</h3>
                          <p className="text-green-600 mt-1">Terima kasih telah berpartisipasi dalam pemilihan ini.</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4 md:grid-cols-2">
                            {votingStatus?.candidates?.osis?.map((candidate: Candidate) => (
                              <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                isSelected={selectedOsis === candidate.id}
                                onSelect={() => setSelectedOsis(candidate.id)}
                                disabled={false}
                              />
                            ))}
                          </div>
                          {votingStatus?.candidates?.osis?.length === 0 && (
                            <EmptyState
                              icon={AlertTriangle}
                              title="Belum Ada Kandidat"
                              description="Belum ada kandidat OSIS yang terdaftar"
                            />
                          )}
                          {selectedOsis && (
                            <div className="flex justify-end mt-6 sticky bottom-6 z-10">
                              <Button 
                                onClick={() => setConfirmType("OSIS")} 
                                size="lg" 
                                className="shadow-lg shadow-primary/20 animate-in fade-in slide-in-from-bottom-4"
                              >
                                <Vote className="mr-2 h-5 w-5" />
                                Pilih Kandidat OSIS
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="mpk" className="mt-0">
                      {hasVotedMpk ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50/50 rounded-xl border border-green-100">
                          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-green-800">Anda sudah memilih kandidat MPK</h3>
                          <p className="text-green-600 mt-1">Terima kasih telah berpartisipasi dalam pemilihan ini.</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4 md:grid-cols-2">
                            {votingStatus?.candidates?.mpk?.map((candidate: Candidate) => (
                              <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                isSelected={selectedMpk === candidate.id}
                                onSelect={() => setSelectedMpk(candidate.id)}
                                disabled={false}
                              />
                            ))}
                          </div>
                          {votingStatus?.candidates?.mpk?.length === 0 && (
                            <EmptyState
                              icon={AlertTriangle}
                              title="Belum Ada Kandidat"
                              description="Belum ada kandidat MPK yang terdaftar"
                            />
                          )}
                          {selectedMpk && (
                            <div className="flex justify-end mt-6 sticky bottom-6 z-10">
                              <Button 
                                onClick={() => setConfirmType("MPK")} 
                                size="lg"
                                className="shadow-lg shadow-primary/20 animate-in fade-in slide-in-from-bottom-4"
                              >
                                <Vote className="mr-2 h-5 w-5" />
                                Pilih Kandidat MPK
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* Confirm Dialog */}
                  <ConfirmDialog
                    open={!!confirmType}
                    onOpenChange={(open) => !open && setConfirmType(null)}
                    title={`Konfirmasi Pilihan ${confirmType}`}
                    description={`Apakah Anda yakin ingin memilih ${getSelectedCandidate()?.chairmanName} & ${getSelectedCandidate()?.viceChairmanName} sebagai kandidat ${confirmType}? Pilihan tidak dapat diubah setelah dikonfirmasi.`}
                    confirmText="Ya, Pilih Kandidat Ini"
                    onConfirm={handleVote}
                    isLoading={submitVote.isPending}
                  />
                </>
              )}
            </div>
            {/* END CONTAINER INDUK */}

          </div>
        </div>
      </div>
    </>
  )
}