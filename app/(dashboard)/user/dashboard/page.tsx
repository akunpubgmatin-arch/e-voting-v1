"use client"

import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useVotingStatus } from "@/lib/hooks/use-voting"
import { Vote, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserDashboardPage() {
  const { data: session } = useSession()
  const { data: votingStatus, isLoading } = useVotingStatus()

  const hasVotedOsis = session?.user?.hasVotedOsis
  const hasVotedMpk = session?.user?.hasVotedMpk
  const isVotingActive = votingStatus?.isActive

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Dashboard" }]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title={`Selamat Datang, ${session?.user?.fullName || "User"}`}
          description="Halaman utama pemilih"
        />

        {/* Voting Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              Status Voting
            </CardTitle>
            <CardDescription>
              {isVotingActive
                ? `Pemilihan ${votingStatus?.periode?.name} sedang berlangsung`
                : "Tidak ada pemilihan yang sedang berlangsung"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : isVotingActive ? (
              <div className="space-y-4">
                {votingStatus?.periode?.startTime && votingStatus?.periode?.endTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(votingStatus.periode.startTime).toLocaleString("id-ID")} -{" "}
                      {new Date(votingStatus.periode.endTime).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {hasVotedOsis ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">Pemilihan OSIS</p>
                        <p className="text-sm text-muted-foreground">
                          {hasVotedOsis ? "Sudah memilih" : "Belum memilih"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={hasVotedOsis ? "default" : "secondary"}>
                      {hasVotedOsis ? "Selesai" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {hasVotedMpk ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">Pemilihan MPK</p>
                        <p className="text-sm text-muted-foreground">
                          {hasVotedMpk ? "Sudah memilih" : "Belum memilih"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={hasVotedMpk ? "default" : "secondary"}>{hasVotedMpk ? "Selesai" : "Pending"}</Badge>
                  </div>
                </div>
                {(!hasVotedOsis || !hasVotedMpk) && (
                  <Button asChild className="w-full">
                    <Link href="/user/vote">
                      <Vote className="mr-2 h-4 w-4" />
                      Mulai Voting
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Saat ini tidak ada pemilihan yang sedang berlangsung.</p>
                <p className="text-sm text-muted-foreground">Silakan tunggu informasi dari panitia.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium">{session?.user?.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Nama Lengkap</span>
                <span className="font-medium">{session?.user?.fullName}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="secondary">{session?.user?.role === "TEACHER" ? "Guru" : "Siswa"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
