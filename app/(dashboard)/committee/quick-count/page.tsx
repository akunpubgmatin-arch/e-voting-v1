"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/ui/stats-card"
import { EmptyState } from "@/components/ui/empty-state"
import { PieChart } from "@/components/charts/pie-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePeriodes } from "@/lib/hooks/use-periodes"
import { useQuickCount } from "@/lib/hooks/use-voting"
import { Users, Vote, BarChart3, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator" // 1. Import Separator

export default function CommitteeQuickCountPage() {
  const { data: periodes } = usePeriodes()
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>("")
  const { data: quickCount, isLoading, refetch, isFetching } = useQuickCount(selectedPeriodeId || undefined)

  const activePeriode = periodes?.find((p) => p.isActive)

  // Auto-select active periode
  if (!selectedPeriodeId && activePeriode) {
    setSelectedPeriodeId(activePeriode.id)
  }

  const osisChartData =
    quickCount?.osisResults.map((r) => ({
      name: r.candidateName,
      value: r.voteCount,
    })) || []

  const mpkChartData =
    quickCount?.mpkResults.map((r) => ({
      name: r.candidateName,
      value: r.voteCount,
    })) || []

  const osisParticipation = quickCount?.totalVoters ? (quickCount.votedOsis / quickCount.totalVoters) * 100 : 0
  const mpkParticipation = quickCount?.totalVoters ? (quickCount.votedMpk / quickCount.totalVoters) * 100 : 0

  // 2. Style untuk inner card (Flat)
  const innerCardStyle = "bg-white border-gray-200 shadow-none"

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Panitia", href: "/committee" }, { label: "Quick Count" }]} />
      {/* 3. Main Wrapper */}
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">
            
            {/* 4. CONTAINER INDUK PUTIH */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              
              {/* Header */}
              <div className="pb-2">
                <PageHeader title="Quick Count" description="Hasil perolehan suara realtime">
                  <div className="flex items-center gap-2">
                    <Select value={selectedPeriodeId} onValueChange={setSelectedPeriodeId}>
                      <SelectTrigger className="w-[200px] bg-white">
                        <SelectValue placeholder="Pilih Periode" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {periodes?.map((periode) => (
                          <SelectItem key={periode.id} value={periode.id}>
                            {periode.name} {periode.isActive && "(Aktif)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
                      <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </PageHeader>
              </div>

              <Separator />

              {/* Konten Utama */}
              {!selectedPeriodeId ? (
                <EmptyState
                  icon={BarChart3}
                  title="Pilih Periode"
                  description="Silakan pilih periode untuk melihat hasil quick count"
                />
              ) : isLoading ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className={innerCardStyle}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-8 w-16" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats Cards - Flat */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <StatsCard
                      title="Total Pemilih"
                      value={quickCount?.totalVoters || 0}
                      icon={Users}
                      description="Siswa & Guru terdaftar"
                      className={innerCardStyle}
                    />
                    <StatsCard
                      title="Sudah Memilih OSIS"
                      value={quickCount?.votedOsis || 0}
                      icon={Vote}
                      description={`${osisParticipation.toFixed(1)}% partisipasi`}
                      className={innerCardStyle}
                    />
                    <StatsCard
                      title="Sudah Memilih MPK"
                      value={quickCount?.votedMpk || 0}
                      icon={Vote}
                      description={`${mpkParticipation.toFixed(1)}% partisipasi`}
                      className={innerCardStyle}
                    />
                  </div>

                  {/* Participation Progress - Flat */}
                  <Card className={innerCardStyle}>
                    <CardHeader>
                      <CardTitle>Partisipasi Pemilihan</CardTitle>
                      <CardDescription>Progress partisipasi pemilih</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span>OSIS</span>
                          <span className="text-muted-foreground">
                            {quickCount?.votedOsis || 0} / {quickCount?.totalVoters || 0} ({osisParticipation.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={osisParticipation} className="h-3 bg-gray-200" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span>MPK</span>
                          <span className="text-muted-foreground">
                            {quickCount?.votedMpk || 0} / {quickCount?.totalVoters || 0} ({mpkParticipation.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={mpkParticipation} className="h-3 bg-gray-200" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts */}
                  <Tabs defaultValue="osis" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="osis">OSIS</TabsTrigger>
                      <TabsTrigger value="mpk">MPK</TabsTrigger>
                    </TabsList>
                    <TabsContent value="osis">
                      <div className="grid gap-4 md:grid-cols-2">
                        <PieChart
                          data={osisChartData}
                          title="Distribusi Suara OSIS"
                          description="Persentase perolehan suara setiap kandidat"
                          className={innerCardStyle}
                        />
                        <BarChart 
                          data={osisChartData} 
                          title="Perolehan Suara OSIS" 
                          description="Jumlah suara per kandidat" 
                          className={innerCardStyle}
                        />
                      </div>
                      {osisChartData.length === 0 && (
                        <EmptyState
                          icon={Vote}
                          title="Belum Ada Suara"
                          description="Belum ada suara yang masuk untuk pemilihan OSIS"
                        />
                      )}
                    </TabsContent>
                    <TabsContent value="mpk">
                      <div className="grid gap-4 md:grid-cols-2">
                        <PieChart
                          data={mpkChartData}
                          title="Distribusi Suara MPK"
                          description="Persentase perolehan suara setiap kandidat"
                          className={innerCardStyle}
                        />
                        <BarChart 
                          data={mpkChartData} 
                          title="Perolehan Suara MPK" 
                          description="Jumlah suara per kandidat" 
                          className={innerCardStyle}
                        />
                      </div>
                      {mpkChartData.length === 0 && (
                        <EmptyState
                          icon={Vote}
                          title="Belum Ada Suara"
                          description="Belum ada suara yang masuk untuk pemilihan MPK"
                        />
                      )}
                    </TabsContent>
                  </Tabs>
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