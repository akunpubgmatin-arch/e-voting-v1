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
import { Separator } from "@/components/ui/separator" // 1. Import Separator

export default function UserDashboardPage() {
  const { data: session } = useSession()
  const { data: votingStatus, isLoading } = useVotingStatus()

  const hasVotedOsis = session?.user?.hasVotedOsis
  const hasVotedMpk = session?.user?.hasVotedMpk
  const isVotingActive = votingStatus?.isActive

  // 2. Style untuk inner card (Flat)
  const innerCardStyle = "bg-white border-gray-200 shadow-none"

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "User", href: "/user" }, { label: "Dashboard" }]} />
      
      {/* 3. Main Wrapper */}
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-1 flex-col gap-6">
            
            {/* 4. CONTAINER INDUK PUTIH */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              
              {/* Header */}
              <div className="pb-2">
                <PageHeader
                  title={`Selamat Datang, ${session?.user?.fullName || "User"}`}
                  description="Halaman utama pemilih"
                />
              </div>

              <Separator />

              {/* Konten Utama */}
              <div className="grid gap-6 md:grid-cols-2"> {/* Grid layout untuk membagi 2 kolom jika di desktop */}
                
                {/* Voting Status Card */}
                <Card className={`${innerCardStyle} h-fit`}>
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-3 rounded-md border border-gray-100">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(votingStatus.periode.startTime).toLocaleString("id-ID")} -{" "}
                              {new Date(votingStatus.periode.endTime).toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}
                        <div className="grid gap-4">
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                              {hasVotedOsis ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                              )}
                              <div>
                                <p className="font-medium text-sm">Pemilihan OSIS</p>
                                <p className="text-xs text-muted-foreground">
                                  {hasVotedOsis ? "Sudah memilih" : "Belum memilih"}
                                </p>
                              </div>
                            </div>
                            <Badge variant={hasVotedOsis ? "default" : "secondary"}>
                              {hasVotedOsis ? "Selesai" : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                              {hasVotedMpk ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                              )}
                              <div>
                                <p className="font-medium text-sm">Pemilihan MPK</p>
                                <p className="text-xs text-muted-foreground">
                                  {hasVotedMpk ? "Sudah memilih" : "Belum memilih"}
                                </p>
                              </div>
                            </div>
                            <Badge variant={hasVotedMpk ? "default" : "secondary"}>{hasVotedMpk ? "Selesai" : "Pending"}</Badge>
                          </div>
                        </div>
                        {(!hasVotedOsis || !hasVotedMpk) && (
                          <Button asChild className="w-full mt-2">
                            <Link href="/user/vote">
                              <Vote className="mr-2 h-4 w-4" />
                              Mulai Voting
                            </Link>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground font-medium">Saat ini tidak ada pemilihan.</p>
                        <p className="text-sm text-muted-foreground">Silakan tunggu informasi dari panitia.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* User Info Card */}
                <Card className={`${innerCardStyle} h-fit`}>
                  <CardHeader>
                    <CardTitle>Informasi Akun</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0 border rounded-lg overflow-hidden">
                      <div className="flex justify-between py-3 px-4 border-b bg-gray-50/50">
                        <span className="text-sm text-muted-foreground">Username</span>
                        <span className="font-medium text-sm">{session?.user?.username}</span>
                      </div>
                      <div className="flex justify-between py-3 px-4 border-b bg-white">
                        <span className="text-sm text-muted-foreground">Nama Lengkap</span>
                        <span className="font-medium text-sm">{session?.user?.fullName}</span>
                      </div>
                      <div className="flex justify-between py-3 px-4 bg-gray-50/50">
                        <span className="text-sm text-muted-foreground">Role</span>
                        <Badge variant="secondary" className="bg-white hover:bg-gray-100 border-gray-200">
                          {session?.user?.role === "TEACHER" ? "Guru" : "Siswa"}
                        </Badge>
                      </div>
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