"use client"

import { useState, useEffect } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { usePeriodes, useUpdatePeriode } from "@/lib/hooks/use-periodes"
import { useCandidates } from "@/lib/hooks/use-candidates"
import { Play, Octagon, Calendar as CalendarIcon, AlertTriangle, CheckCircle, Users, Clock, Timer, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { cn } from "@/lib/utils"

// --- COMPONENTS HELPER ---

// Komponen Countdown
function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endTime) - +new Date()
      
      if (difference > 0) {
        return {
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        }
      }
      return null
    }

    // Hitung pertama kali
    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (!timeLeft) {
    return <span className="text-red-500 font-bold">Waktu Habis</span>
  }

  return (
    <div className="flex gap-2">
      {[
        { label: "Hari", value: timeLeft.d },
        { label: "Jam", value: timeLeft.h },
        { label: "Menit", value: timeLeft.m },
        { label: "Detik", value: timeLeft.s },
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center bg-gray-100 rounded-md p-2 min-w-[60px]">
          <span className="text-xl font-bold text-primary">{item.value}</span>
          <span className="text-[10px] uppercase text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function VotingControlPage() {
  const { data: periodes } = usePeriodes()
  const updatePeriode = useUpdatePeriode()
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>("")
  const { data: candidates } = useCandidates(selectedPeriodeId || undefined)

  const [isStartOpen, setIsStartOpen] = useState(false)
  const [isStopOpen, setIsStopOpen] = useState(false)

  // State untuk Date Picker
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState("08:00")
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [endTime, setEndTime] = useState("14:00")

  const selectedPeriode = periodes?.find((p) => p.id === selectedPeriodeId)
  const osisCandidates = candidates?.filter((c) => c.type === "OSIS") || []
  const mpkCandidates = candidates?.filter((c) => c.type === "MPK") || []

  const canStartVoting = osisCandidates.length > 0 && mpkCandidates.length > 0

  const innerCardStyle = "bg-white border-gray-200 shadow-none"

  const handleStartVoting = async () => {
    if (!selectedPeriode) return
    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Tanggal dan jam mulai/selesai harus diisi lengkap")
      return
    }

    // Gabungkan Date dan Time
    const startDateTime = new Date(startDate)
    const [startH, startM] = startTime.split(":").map(Number)
    startDateTime.setHours(startH, startM)

    const endDateTime = new Date(endDate)
    const [endH, endM] = endTime.split(":").map(Number)
    endDateTime.setHours(endH, endM)

    if (endDateTime <= startDateTime) {
      toast.error("Waktu selesai harus lebih besar dari waktu mulai")
      return
    }

    await updatePeriode.mutateAsync({
      id: selectedPeriode.id,
      data: {
        isActive: true,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      },
    })
    setIsStartOpen(false)
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
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">
            
            {/* CONTAINER INDUK PUTIH */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              
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
                  icon={CalendarIcon}
                  title="Pilih Periode"
                  description="Silakan pilih periode untuk mengontrol voting"
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* KARTU KIRI: STATUS & TIMER */}
                  <Card className={innerCardStyle}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-primary" />
                        Status & Waktu
                      </CardTitle>
                      <CardDescription>Status voting untuk {selectedPeriode?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Badge Status */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-medium text-sm">Status Saat Ini</span>
                        <Badge 
                          variant={selectedPeriode?.isActive ? "default" : "secondary"}
                          className={selectedPeriode?.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {selectedPeriode?.isActive ? "SEDANG BERLANGSUNG" : "TIDAK AKTIF"}
                        </Badge>
                      </div>

                      {/* Countdown Timer (Jika Aktif) */}
                      {selectedPeriode?.isActive && selectedPeriode.endTime && (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
                          <span className="text-sm font-semibold text-primary mb-3 uppercase tracking-widest">Sisa Waktu Voting</span>
                          <CountdownTimer endTime={selectedPeriode.endTime} />
                        </div>
                      )}

                      {/* Info Jadwal */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" /> Mulai
                          </span>
                          <span className="font-medium">
                            {selectedPeriode?.startTime 
                              ? format(new Date(selectedPeriode.startTime), "PPP - HH:mm", { locale: idLocale })
                              : "-"}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Selesai
                          </span>
                          <span className="font-medium">
                            {selectedPeriode?.endTime 
                              ? format(new Date(selectedPeriode.endTime), "PPP - HH:mm", { locale: idLocale })
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Tombol Aksi */}
                      <div className="pt-2">
                        {!selectedPeriode?.isActive ? (
                          <Button className="w-full h-11 text-base shadow-lg shadow-primary/20" onClick={() => setIsStartOpen(true)} disabled={!canStartVoting}>
                            <Play className="mr-2 h-5 w-5" />
                            Mulai Sesi Voting
                          </Button>
                        ) : (
                          <Button variant="destructive" className="w-full h-11 text-base shadow-lg shadow-red-500/20" onClick={() => setIsStopOpen(true)}>
                            <Octagon className="mr-2 h-5 w-5" />
                            Hentikan Voting Sekarang
                          </Button>
                        )}
                      </div>

                    </CardContent>
                  </Card>

                  {/* KARTU KANAN: SYARAT (Kandidat) */}
                  <Card className={innerCardStyle}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Kesiapan Kandidat
                      </CardTitle>
                      <CardDescription>Pastikan kandidat sudah terdaftar sebelum mulai</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                          {osisCandidates.length > 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm">Kandidat OSIS</p>
                            <p className="text-xs text-muted-foreground">Minimal 1 paslon</p>
                          </div>
                        </div>
                        <Badge variant={osisCandidates.length > 0 ? "outline" : "destructive"} className="bg-white">
                          {osisCandidates.length} Paslon
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                          {mpkCandidates.length > 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm">Kandidat MPK</p>
                            <p className="text-xs text-muted-foreground">Minimal 1 paslon</p>
                          </div>
                        </div>
                        <Badge variant={mpkCandidates.length > 0 ? "outline" : "destructive"} className="bg-white">
                          {mpkCandidates.length} Paslon
                        </Badge>
                      </div>

                      {!canStartVoting && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex gap-3 items-start mt-4">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-700">
                            Anda belum bisa memulai voting. Harap tambahkan minimal 1 kandidat untuk masing-masing kategori (OSIS & MPK).
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* --- DIALOG MULAI VOTING (FIXED: Ganti ConfirmDialog dengan Dialog) --- */}
            <Dialog open={isStartOpen} onOpenChange={setIsStartOpen}>
              <DialogContent className="bg-white sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Mulai Sesi Voting</DialogTitle>
                  <DialogDescription>
                    Atur waktu mulai dan selesai. Voting akan otomatis tertutup saat waktu habis.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                  
                  {/* WAKTU MULAI */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Waktu Mulai</Label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Popover modal={true}> {/* modal=true agar fokus tidak kabur */}
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-white border-gray-300", !startDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                              {startDate ? format(startDate, "dd MMM yyyy", { locale: idLocale }) : "Pilih Tanggal"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white" align="start">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus required />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="w-[110px]">
                        <Input 
                          type="time" 
                          value={startTime} 
                          onChange={(e) => setStartTime(e.target.value)}
                          className="bg-white border-gray-300 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WAKTU SELESAI */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Waktu Selesai</Label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-white border-gray-300", !endDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                              {endDate ? format(endDate, "dd MMM yyyy", { locale: idLocale }) : "Pilih Tanggal"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white" align="start">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus required />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="w-[110px]">
                        <Input 
                          type="time" 
                          value={endTime} 
                          onChange={(e) => setEndTime(e.target.value)}
                          className="bg-white border-gray-300 text-center"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsStartOpen(false)}>Batal</Button>
                  <Button onClick={handleStartVoting} disabled={updatePeriode.isPending} className="min-w-[100px]">
                    {updatePeriode.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mulai"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* --- DIALOG STOP VOTING (FORCE STOP) --- */}
            <ConfirmDialog
              open={isStopOpen}
              onOpenChange={setIsStopOpen}
              title="Hentikan Voting Secara Sepihak?"
              description="Tindakan ini akan langsung menutup sesi voting meskipun waktu belum habis. Pemilih tidak akan bisa memberikan suara lagi."
              confirmText="Ya, Hentikan"
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