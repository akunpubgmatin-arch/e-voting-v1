"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/sidebar/dashboard-header"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePeriodes } from "@/lib/hooks/use-periodes"
import { useUsers } from "@/lib/hooks/use-users"
import { useQuickCount } from "@/lib/hooks/use-voting"
import { FileSpreadsheet, FileText, Download, Users } from "lucide-react"
import * as XLSX from "xlsx"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { toast } from "sonner"

export default function CommitteeReportsPage() {
  const { data: periodes } = usePeriodes()
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>("")
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: quickCount } = useQuickCount(selectedPeriodeId || undefined)

  const activePeriode = periodes?.find((p) => p.isActive)
  const selectedPeriode = periodes?.find((p) => p.id === selectedPeriodeId)

  // Auto-select active periode
  if (!selectedPeriodeId && activePeriode) {
    setSelectedPeriodeId(activePeriode.id)
  }

  const voters = users?.filter((u) => ["USER", "TEACHER"].includes(u.role)) || []

  const columns = [
    {
      key: "username",
      header: "Username",
      cell: (user: (typeof voters)[0]) => <span className="font-medium">{user.username}</span>,
    },
    {
      key: "fullName",
      header: "Nama Lengkap",
    },
    {
      key: "role",
      header: "Role",
      cell: (user: (typeof voters)[0]) => (
        <Badge variant={user.role === "TEACHER" ? "default" : "secondary"}>
          {user.role === "TEACHER" ? "Guru" : "Siswa"}
        </Badge>
      ),
    },
    {
      key: "hasVotedOsis",
      header: "OSIS",
      cell: (user: (typeof voters)[0]) => (
        <Badge variant={user.hasVotedOsis ? "default" : "outline"}>{user.hasVotedOsis ? "Sudah" : "Belum"}</Badge>
      ),
    },
    {
      key: "hasVotedMpk",
      header: "MPK",
      cell: (user: (typeof voters)[0]) => (
        <Badge variant={user.hasVotedMpk ? "default" : "outline"}>{user.hasVotedMpk ? "Sudah" : "Belum"}</Badge>
      ),
    },
  ]

  const exportVotersToExcel = () => {
    const data = voters.map((user) => ({
      Username: user.username,
      "Nama Lengkap": user.fullName,
      Role: user.role === "TEACHER" ? "Guru" : "Siswa",
      "Sudah Vote OSIS": user.hasVotedOsis ? "Ya" : "Tidak",
      "Sudah Vote MPK": user.hasVotedMpk ? "Ya" : "Tidak",
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Pemilih")
    XLSX.writeFile(wb, `daftar_pemilih_${selectedPeriode?.name || "semua"}.xlsx`)
    toast.success("File Excel berhasil diunduh")
  }

  const exportQuickCountToPDF = async () => {
    if (!quickCount || !selectedPeriode) {
      toast.error("Pilih periode terlebih dahulu")
      return
    }

    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([595, 842]) // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const { height } = page.getSize()

      let y = height - 50

      // Title
      page.drawText("LAPORAN QUICK COUNT", {
        x: 50,
        y,
        size: 18,
        font: boldFont,
        color: rgb(0.12, 0.23, 0.99),
      })
      y -= 25

      page.drawText(`Periode: ${selectedPeriode.name}`, {
        x: 50,
        y,
        size: 12,
        font,
      })
      y -= 15

      page.drawText(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      })
      y -= 40

      // Stats
      page.drawText("STATISTIK PEMILIHAN", {
        x: 50,
        y,
        size: 14,
        font: boldFont,
      })
      y -= 25

      const stats = [
        `Total Pemilih: ${quickCount.totalVoters}`,
        `Sudah Vote OSIS: ${quickCount.votedOsis} (${((quickCount.votedOsis / quickCount.totalVoters) * 100).toFixed(1)}%)`,
        `Sudah Vote MPK: ${quickCount.votedMpk} (${((quickCount.votedMpk / quickCount.totalVoters) * 100).toFixed(1)}%)`,
      ]

      stats.forEach((stat) => {
        page.drawText(stat, { x: 50, y, size: 11, font })
        y -= 18
      })
      y -= 20

      // OSIS Results
      page.drawText("HASIL PEMILIHAN OSIS", {
        x: 50,
        y,
        size: 14,
        font: boldFont,
      })
      y -= 25

      quickCount.osisResults
        .sort((a, b) => b.voteCount - a.voteCount)
        .forEach((result, index) => {
          page.drawText(
            `${index + 1}. ${result.candidateName}: ${result.voteCount} suara (${result.percentage.toFixed(1)}%)`,
            { x: 50, y, size: 11, font },
          )
          y -= 18
        })
      y -= 20

      // MPK Results
      page.drawText("HASIL PEMILIHAN MPK", {
        x: 50,
        y,
        size: 14,
        font: boldFont,
      })
      y -= 25

      quickCount.mpkResults
        .sort((a, b) => b.voteCount - a.voteCount)
        .forEach((result, index) => {
          page.drawText(
            `${index + 1}. ${result.candidateName}: ${result.voteCount} suara (${result.percentage.toFixed(1)}%)`,
            { x: 50, y, size: 11, font },
          )
          y -= 18
        })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `quick_count_${selectedPeriode.name}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("File PDF berhasil diunduh")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Gagal membuat file PDF")
    }
  }

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Panitia", href: "/committee" }, { label: "Laporan" }]} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader title="Laporan" description="Download laporan pemilihan">
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
        </PageHeader>

        {!selectedPeriodeId ? (
          <EmptyState
            icon={FileText}
            title="Pilih Periode"
            description="Silakan pilih periode untuk melihat dan mengunduh laporan"
          />
        ) : (
          <>
            {/* Export Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    Export Data Pemilih
                  </CardTitle>
                  <CardDescription>Download daftar pemilih beserta status voting dalam format Excel</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={exportVotersToExcel} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Excel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    Export Quick Count
                  </CardTitle>
                  <CardDescription>Download hasil quick count dalam format PDF</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={exportQuickCountToPDF} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Voters Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Daftar Pemilih
                </CardTitle>
                <CardDescription>Status voting semua pemilih terdaftar</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={voters}
                  isLoading={usersLoading}
                  emptyMessage="Belum ada data pemilih"
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
