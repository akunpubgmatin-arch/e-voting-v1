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

export default function AdminQuickCountPage() {
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

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Quick Count" }]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader title="Quick Count" description="Hasil perolehan suara realtime">
          <div className="flex items-center gap-2">
            <Select value={selectedPeriodeId} onValueChange={setSelectedPeriodeId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
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
                <Card key={i}>
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
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Total Pemilih"
                value={quickCount?.totalVoters || 0}
                icon={Users}
                description="Siswa & Guru terdaftar"
              />
              <StatsCard
                title="Sudah Memilih OSIS"
                value={quickCount?.votedOsis || 0}
                icon={Vote}
                description={`${quickCount?.totalVoters ? ((quickCount.votedOsis / quickCount.totalVoters) * 100).toFixed(1) : 0}% partisipasi`}
              />
              <StatsCard
                title="Sudah Memilih MPK"
                value={quickCount?.votedMpk || 0}
                icon={Vote}
                description={`${quickCount?.totalVoters ? ((quickCount.votedMpk / quickCount.totalVoters) * 100).toFixed(1) : 0}% partisipasi`}
              />
            </div>

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
                  />
                  <BarChart data={osisChartData} title="Perolehan Suara OSIS" description="Jumlah suara per kandidat" />
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
                  />
                  <BarChart data={mpkChartData} title="Perolehan Suara MPK" description="Jumlah suara per kandidat" />
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

            {/* Results Table */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hasil OSIS</CardTitle>
                  <CardDescription>Peringkat kandidat OSIS</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickCount?.osisResults
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((result, index) => (
                        <div
                          key={result.candidateId}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium">{result.candidateName}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{result.voteCount}</p>
                            <p className="text-xs text-muted-foreground">{result.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    {quickCount?.osisResults.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hasil MPK</CardTitle>
                  <CardDescription>Peringkat kandidat MPK</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickCount?.mpkResults
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((result, index) => (
                        <div
                          key={result.candidateId}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium">{result.candidateName}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{result.voteCount}</p>
                            <p className="text-xs text-muted-foreground">{result.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    {quickCount?.mpkResults.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">Belum ada data</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  )
}
