"use client"

import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStats } from "@/lib/hooks/use-stats"
import { useActivePeriode } from "@/lib/hooks/use-periodes"
import { useQuickCount } from "@/lib/hooks/use-voting"
import { Users, Vote, Calendar, UserCircle, TrendingUp, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator" // Import Separator

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activePeriode } = useActivePeriode()
  const { data: quickCount } = useQuickCount(activePeriode?.id)

  // Class untuk inner card agar kontras dengan container putih
  // Kita pakai bg-gray-50 dan hilangkan shadow agar terlihat "tertanam" (flat styling)
  const innerCardStyle = "bg-white border-gray-200 shadow-none"

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]} />
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">

            {/* CONTAINER INDUK (White Paper Style) */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              
              {/* Header dimasukkan ke dalam container */}
              <div className="pb-2">
                <PageHeader title="Dashboard" description="Ringkasan statistik sistem e-voting" />
              </div>
              
              <Separator />

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsLoading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className={innerCardStyle}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-8 w-16" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <>
                    <StatsCard
                      title="Total Pemilih"
                      value={stats?.totalVoters || 0}
                      icon={Users}
                      description="Siswa & Guru terdaftar"
                      className={innerCardStyle} 
                    />
                    <StatsCard
                      title="Total Kandidat"
                      value={stats?.totalCandidates || 0}
                      icon={UserCircle}
                      description="Kandidat OSIS & MPK"
                      className={innerCardStyle}
                    />
                    <StatsCard
                      title="Sudah Memilih OSIS"
                      value={stats?.votedOsis || 0}
                      icon={Vote}
                      description={`${stats?.participationRate?.toFixed(1) || 0}% partisipasi`}
                      className={innerCardStyle}
                    />
                    <StatsCard
                      title="Sudah Memilih MPK"
                      value={stats?.votedMpk || 0}
                      icon={CheckCircle}
                      description={`${stats?.participationRate?.toFixed(1) || 0}% partisipasi`}
                      className={innerCardStyle}
                    />
                  </>
                )}
              </div>

              {/* Active Period Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className={innerCardStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Periode Aktif
                    </CardTitle>
                    <CardDescription>Informasi periode pemilihan yang sedang berjalan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activePeriode ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{activePeriode.name}</span>
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                            Aktif
                          </Badge>
                        </div>
                        {activePeriode.startTime && activePeriode.endTime && (
                          <div className="text-sm text-muted-foreground bg-white/50 p-3 rounded-md border border-gray-100">
                            <p className="flex justify-between mb-1">
                              <span>Mulai:</span> 
                              <span className="font-medium">{new Date(activePeriode.startTime).toLocaleString("id-ID")}</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Selesai:</span> 
                              <span className="font-medium">{new Date(activePeriode.endTime).toLocaleString("id-ID")}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                        <Calendar className="h-10 w-10 mb-2 opacity-20" />
                        <p>Tidak ada periode aktif saat ini</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className={innerCardStyle}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Partisipasi Voting
                    </CardTitle>
                    <CardDescription>Progress partisipasi pemilihan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span>OSIS</span>
                        <span>
                          {quickCount?.votedOsis || 0} / {quickCount?.totalVoters || 0}
                        </span>
                      </div>
                      <Progress
                        value={quickCount?.totalVoters ? (quickCount.votedOsis / quickCount.totalVoters) * 100 : 0}
                        className="h-3 bg-gray-200"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span>MPK</span>
                        <span>
                          {quickCount?.votedMpk || 0} / {quickCount?.totalVoters || 0}
                        </span>
                      </div>
                      <Progress
                        value={quickCount?.totalVoters ? (quickCount.votedMpk / quickCount.totalVoters) * 100 : 0}
                        className="h-3 bg-gray-200"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
            {/* END CONTAINER INDUK */}

          </div>
        </div>
      </div>
    </>
  )
}