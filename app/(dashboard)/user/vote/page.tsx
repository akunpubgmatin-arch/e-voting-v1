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

interface Candidate {
  id: string
  name: string
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
        "cursor-pointer transition-all hover:border-primary",
        isSelected && "border-primary ring-2 ring-primary/20",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      onClick={() => !disabled && onSelect()}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={candidate.photo || undefined} />
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {candidate.orderNumber}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{candidate.name}</CardTitle>
            <CardDescription>Kandidat No. {candidate.orderNumber}</CardDescription>
          </div>
          {isSelected && <CheckCircle className="h-6 w-6 text-primary" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {candidate.visi && (
          <div>
            <p className="text-sm font-medium mb-1">Visi:</p>
            <p className="text-sm text-muted-foreground">{candidate.visi}</p>
          </div>
        )}
        {candidate.misi && (
          <div>
            <p className="text-sm font-medium mb-1">Misi:</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{candidate.misi}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <>
        <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Vote" }]} />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </>
    )
  }

  if (!isVotingActive) {
    return (
      <>
        <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Vote" }]} />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader title="Voting" description="Pilih kandidat pilihanmu" />
          <EmptyState
            icon={Clock}
            title="Voting Belum Dibuka"
            description="Saat ini tidak ada pemilihan yang sedang berlangsung. Silakan tunggu informasi dari panitia."
          />
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Vote" }]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader title="Voting" description={`Pemilihan ${votingStatus?.periode?.name}`}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Berakhir:{" "}
              {votingStatus?.periode?.endTime ? new Date(votingStatus.periode.endTime).toLocaleString("id-ID") : "-"}
            </span>
          </div>
        </PageHeader>

        <Tabs defaultValue={!hasVotedOsis ? "osis" : !hasVotedMpk ? "mpk" : "osis"}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="osis" className="relative">
              OSIS
              {hasVotedOsis && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="mpk" className="relative">
              MPK
              {hasVotedMpk && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="osis" className="mt-6">
            {hasVotedOsis ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="flex items-center gap-4 py-6">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700">Anda sudah memilih kandidat OSIS</p>
                    <p className="text-sm text-green-600">Terima kasih telah berpartisipasi dalam pemilihan</p>
                  </div>
                </CardContent>
              </Card>
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
                  <div className="flex justify-end mt-6">
                    <Button onClick={() => setConfirmType("OSIS")}>
                      <Vote className="mr-2 h-4 w-4" />
                      Pilih Kandidat OSIS
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="mpk" className="mt-6">
            {hasVotedMpk ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="flex items-center gap-4 py-6">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700">Anda sudah memilih kandidat MPK</p>
                    <p className="text-sm text-green-600">Terima kasih telah berpartisipasi dalam pemilihan</p>
                  </div>
                </CardContent>
              </Card>
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
                  <div className="flex justify-end mt-6">
                    <Button onClick={() => setConfirmType("MPK")}>
                      <Vote className="mr-2 h-4 w-4" />
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
          description={`Apakah Anda yakin ingin memilih ${getSelectedCandidate()?.name} sebagai kandidat ${confirmType}? Pilihan tidak dapat diubah setelah dikonfirmasi.`}
          confirmText="Ya, Pilih Kandidat Ini"
          onConfirm={handleVote}
          isLoading={submitVote.isPending}
        />
      </div>
    </>
  )
}
