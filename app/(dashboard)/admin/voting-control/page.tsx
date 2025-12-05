"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePeriodes, useUpdatePeriode } from "@/lib/hooks/use-periodes"
import { useCandidates } from "@/lib/hooks/use-candidates"
// Ganti Square dengan Octagon untuk ikon "Stop" yang lebih bagus
import { Play, Octagon, Calendar, AlertTriangle, CheckCircle, Users } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator" // 1. Import Separator

export default function VotingControlPage() {
  const { data: periodes } = usePeriodes()
  const updatePeriode = useUpdatePeriode()
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>("")
  const { data: candidates } = useCandidates(selectedPeriodeId || undefined)

  const [isStartOpen, setIsStartOpen] = useState(false)
  const [isStopOpen, setIsStopOpen] = useState(false)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const selectedPeriode = periodes?.find((p) => p.id === selectedPeriodeId)
  const osisCandidates = candidates?.filter((c) => c.type === "OSIS") || []
  const mpkCandidates = candidates?.filter((c) => c.type === "MPK") || []

  const canStartVoting = osisCandidates.length > 0 && mpkCandidates.length > 0

  // 2. Style untuk inner card
  const innerCardStyle = "bg-white border-gray-200 shadow-none"

  const handleStartVoting = async () => {
    if (!selectedPeriode) return
    if (!startTime || !endTime) {
      toast.error("Waktu mulai dan selesai harus diisi")
      return
    }

    await updatePeriode.mutateAsync({
      id: selectedPeriode.id,
      data: {
        isActive: true,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      },
    })
    setIsStartOpen(false)
    setStartTime("")
    setEndTime("")
  }

  const handleStopVoting = async () => {
    if (!selectedPeriode) return
    await updatePeriode.mutateAsync({
      id: selectedPeriode.id,
      data: { isActive: false },
    })
    setIsStopOpen(false)
  }

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Kontrol Voting" }]} />
      {/* 3. Main Wrapper */}
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">
            
            {/* 4. CONTAINER INDUK PUTIH */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              
              {/* Header */}
              <div className="pb-2">
                <PageHeader title="Kontrol Voting" description="Kelola jadwal dan status voting">
                  <Select value={selectedPeriodeId} onValueChange={setSelectedPeriodeId}>
                    <SelectTrigger className="w-[200px] bg-white">
                      <SelectValue placeholder="Pilih Periode" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {periodes?.map((periode) => (
                        <SelectItem key={periode.id} value={periode.id}>
                          {periode.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PageHeader>
              </div>

              <Separator />

              {/* Konten Utama */}
              {!selectedPeriodeId ? (
                <EmptyState
                  icon={Calendar}
                  title="Pilih Periode"
                  description="Silakan pilih periode untuk mengontrol voting"
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Status Card - Flat Style */}
                  <Card className={innerCardStyle}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Status Voting
                      </CardTitle>
                      <CardDescription>Status voting untuk {selectedPeriode?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Status</span>
                        <Badge variant={selectedPeriode?.isActive ? "default" : "secondary"}>
                          {selectedPeriode?.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>
                      {selectedPeriode?.startTime && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Mulai</span>
                          <span>{new Date(selectedPeriode.startTime).toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      {selectedPeriode?.endTime && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Selesai</span>
                          <span>{new Date(selectedPeriode.endTime).toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      <div className="flex gap-2 pt-4">
                        {!selectedPeriode?.isActive ? (
                          <Button className="flex-1" onClick={() => setIsStartOpen(true)} disabled={!canStartVoting}>
                            <Play className="mr-2 h-4 w-4" />
                            Mulai Voting
                          </Button>
                        ) : (
                          <Button variant="destructive" className="flex-1" onClick={() => setIsStopOpen(true)}>
                            {/* Ganti Icon Square dengan Octagon */}
                            <Octagon className="mr-2 h-4 w-4" />
                            Hentikan Voting
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements Card - Flat Style */}
                  <Card className={innerCardStyle}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Syarat Voting
                      </CardTitle>
                      <CardDescription>Persyaratan sebelum memulai voting</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {osisCandidates.length > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Kandidat OSIS</span>
                        </div>
                        <Badge variant={osisCandidates.length > 0 ? "default" : "secondary"}>
                          {osisCandidates.length} kandidat
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {mpkCandidates.length > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Kandidat MPK</span>
                        </div>
                        <Badge variant={mpkCandidates.length > 0 ? "default" : "secondary"}>
                          {mpkCandidates.length} kandidat
                        </Badge>
                      </div>
                      {!canStartVoting && (
                        <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                          Tambahkan minimal 1 kandidat OSIS dan 1 kandidat MPK sebelum memulai voting.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            {/* END CONTAINER INDUK */}

            {/* Start Voting Dialog */}
            <ConfirmDialog
              open={isStartOpen}
              onOpenChange={setIsStartOpen}
              title="Mulai Voting"
              description=""
              confirmText="Mulai Voting"
              onConfirm={handleStartVoting}
              isLoading={updatePeriode.isPending}
            >
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">Atur jadwal voting untuk {selectedPeriode?.name}</p>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Waktu Mulai</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Waktu Selesai</Label>
                  <Input 
                    id="endTime" 
                    type="datetime-local" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                    className="bg-white"
                  />
                </div>
              </div>
            </ConfirmDialog>

            {/* Stop Voting Confirm */}
            <ConfirmDialog
              open={isStopOpen}
              onOpenChange={setIsStopOpen}
              title="Hentikan Voting"
              description="Apakah Anda yakin ingin menghentikan voting? Pemilih tidak akan bisa memberikan suara lagi."
              confirmText="Hentikan Voting"
              onConfirm={handleStopVoting}
              isDestructive
              isLoading={updatePeriode.isPending}
            />
          </div>
        </div>
      </div>
    </>
  )
}