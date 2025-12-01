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

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activePeriode } = useActivePeriode()
  const { data: quickCount } = useQuickCount(activePeriode?.id)

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader title="Dashboard" description="Ringkasan statistik sistem e-voting" />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
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
              />
              <StatsCard
                title="Total Kandidat"
                value={stats?.totalCandidates || 0}
                icon={UserCircle}
                description="Kandidat OSIS & MPK"
              />
              <StatsCard
                title="Sudah Memilih OSIS"
                value={stats?.votedOsis || 0}
                icon={Vote}
                description={`${stats?.participationRate?.toFixed(1) || 0}% partisipasi`}
              />
              <StatsCard
                title="Sudah Memilih MPK"
                value={stats?.votedMpk || 0}
                icon={CheckCircle}
                description={`${stats?.participationRate?.toFixed(1) || 0}% partisipasi`}
              />
            </>
          )}
        </div>

        {/* Active Period Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
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
                    <Badge variant="default" className="bg-green-500">
                      Aktif
                    </Badge>
                  </div>
                  {activePeriode.startTime && activePeriode.endTime && (
                    <div className="text-sm text-muted-foreground">
                      <p>Mulai: {new Date(activePeriode.startTime).toLocaleString("id-ID")}</p>
                      <p>Selesai: {new Date(activePeriode.endTime).toLocaleString("id-ID")}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Tidak ada periode aktif saat ini</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Partisipasi Voting
              </CardTitle>
              <CardDescription>Progress partisipasi pemilihan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>OSIS</span>
                  <span>
                    {quickCount?.votedOsis || 0} / {quickCount?.totalVoters || 0}
                  </span>
                </div>
                <Progress
                  value={quickCount?.totalVoters ? (quickCount.votedOsis / quickCount.totalVoters) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>MPK</span>
                  <span>
                    {quickCount?.votedMpk || 0} / {quickCount?.totalVoters || 0}
                  </span>
                </div>
                <Progress
                  value={quickCount?.totalVoters ? (quickCount.votedMpk / quickCount.totalVoters) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
