import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export interface QuickCountPDFData {
  periodeName: string
  totalVoters: number
  votedOsis: number
  votedMpk: number
  osisResults: Array<{
    candidateName: string
    voteCount: number
    percentage: number
  }>
  mpkResults: Array<{
    candidateName: string
    voteCount: number
    percentage: number
  }>
}

/**
 * Generate Quick Count PDF Report
 */
export async function generateQuickCountPDF(data: QuickCountPDFData): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const { height } = page.getSize()

  let y = height - 50
  const primaryColor = rgb(0.12, 0.23, 0.99) // #1E3AFC

  // Title
  page.drawText("LAPORAN HASIL QUICK COUNT", {
    x: 50,
    y,
    size: 18,
    font: boldFont,
    color: primaryColor,
  })
  y -= 25

  page.drawText(`Pemilihan OSIS dan MPK`, {
    x: 50,
    y,
    size: 14,
    font: boldFont,
  })
  y -= 20

  page.drawText(`Periode: ${data.periodeName}`, {
    x: 50,
    y,
    size: 12,
    font,
  })
  y -= 15

  page.drawText(
    `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    },
  )
  y -= 40

  // Divider
  page.drawLine({
    start: { x: 50, y: y + 10 },
    end: { x: 545, y: y + 10 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })

  // Stats Section
  page.drawText("STATISTIK PARTISIPASI PEMILIH", {
    x: 50,
    y,
    size: 14,
    font: boldFont,
    color: primaryColor,
  })
  y -= 30

  const participationOsis = data.totalVoters > 0 ? ((data.votedOsis / data.totalVoters) * 100).toFixed(1) : "0"
  const participationMpk = data.totalVoters > 0 ? ((data.votedMpk / data.totalVoters) * 100).toFixed(1) : "0"

  const statsData = [
    ["Total Pemilih Terdaftar", data.totalVoters.toString()],
    ["Sudah Memilih OSIS", `${data.votedOsis} (${participationOsis}%)`],
    ["Sudah Memilih MPK", `${data.votedMpk} (${participationMpk}%)`],
    ["Belum Memilih OSIS", `${data.totalVoters - data.votedOsis}`],
    ["Belum Memilih MPK", `${data.totalVoters - data.votedMpk}`],
  ]

  statsData.forEach(([label, value]) => {
    page.drawText(label, { x: 50, y, size: 11, font })
    page.drawText(`: ${value}`, { x: 200, y, size: 11, font: boldFont })
    y -= 18
  })
  y -= 20

  // OSIS Results Section
  page.drawText("HASIL PEROLEHAN SUARA OSIS", {
    x: 50,
    y,
    size: 14,
    font: boldFont,
    color: primaryColor,
  })
  y -= 30

  if (data.osisResults.length === 0) {
    page.drawText("Belum ada data suara", { x: 50, y, size: 11, font, color: rgb(0.5, 0.5, 0.5) })
    y -= 20
  } else {
    // Table header
    page.drawText("No", { x: 50, y, size: 10, font: boldFont })
    page.drawText("Nama Kandidat", { x: 80, y, size: 10, font: boldFont })
    page.drawText("Jumlah Suara", { x: 300, y, size: 10, font: boldFont })
    page.drawText("Persentase", { x: 400, y, size: 10, font: boldFont })
    y -= 5
    page.drawLine({ start: { x: 50, y }, end: { x: 500, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) })
    y -= 15

    data.osisResults
      .sort((a, b) => b.voteCount - a.voteCount)
      .forEach((result, index) => {
        page.drawText(`${index + 1}`, { x: 50, y, size: 11, font })
        page.drawText(result.candidateName, { x: 80, y, size: 11, font })
        page.drawText(`${result.voteCount}`, { x: 300, y, size: 11, font: boldFont })
        page.drawText(`${result.percentage.toFixed(1)}%`, { x: 400, y, size: 11, font })
        y -= 18
      })
  }
  y -= 20

  // MPK Results Section
  page.drawText("HASIL PEROLEHAN SUARA MPK", {
    x: 50,
    y,
    size: 14,
    font: boldFont,
    color: primaryColor,
  })
  y -= 30

  if (data.mpkResults.length === 0) {
    page.drawText("Belum ada data suara", { x: 50, y, size: 11, font, color: rgb(0.5, 0.5, 0.5) })
    y -= 20
  } else {
    // Table header
    page.drawText("No", { x: 50, y, size: 10, font: boldFont })
    page.drawText("Nama Kandidat", { x: 80, y, size: 10, font: boldFont })
    page.drawText("Jumlah Suara", { x: 300, y, size: 10, font: boldFont })
    page.drawText("Persentase", { x: 400, y, size: 10, font: boldFont })
    y -= 5
    page.drawLine({ start: { x: 50, y }, end: { x: 500, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) })
    y -= 15

    data.mpkResults
      .sort((a, b) => b.voteCount - a.voteCount)
      .forEach((result, index) => {
        page.drawText(`${index + 1}`, { x: 50, y, size: 11, font })
        page.drawText(result.candidateName, { x: 80, y, size: 11, font })
        page.drawText(`${result.voteCount}`, { x: 300, y, size: 11, font: boldFont })
        page.drawText(`${result.percentage.toFixed(1)}%`, { x: 400, y, size: 11, font })
        y -= 18
      })
  }

  // Footer
  page.drawText("Dokumen ini dibuat secara otomatis oleh sistem E-Voting OSIS MPK", {
    x: 50,
    y: 50,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes as any], { type: "application/pdf" })
}

/**
 * Download voters list PDF
 */
export async function generateVotersListPDF(
  voters: Array<{
    username: string
    fullName: string
    role: string
    hasVotedOsis: boolean
    hasVotedMpk: boolean
  }>,
  periodeName: string,
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const primaryColor = rgb(0.12, 0.23, 0.99)

  const itemsPerPage = 25
  const totalPages = Math.ceil(voters.length / itemsPerPage)

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const page = pdfDoc.addPage([595, 842])
    const { height } = page.getSize()
    let y = height - 50

    // Header (only on first page)
    if (pageNum === 0) {
      page.drawText("DAFTAR PEMILIH", {
        x: 50,
        y,
        size: 18,
        font: boldFont,
        color: primaryColor,
      })
      y -= 20
      page.drawText(`Periode: ${periodeName}`, { x: 50, y, size: 12, font })
      y -= 15
      page.drawText(`Total Pemilih: ${voters.length}`, { x: 50, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
      y -= 30
    }

    // Table header
    page.drawText("No", { x: 50, y, size: 9, font: boldFont })
    page.drawText("Username", { x: 80, y, size: 9, font: boldFont })
    page.drawText("Nama Lengkap", { x: 180, y, size: 9, font: boldFont })
    page.drawText("Role", { x: 350, y, size: 9, font: boldFont })
    page.drawText("OSIS", { x: 410, y, size: 9, font: boldFont })
    page.drawText("MPK", { x: 470, y, size: 9, font: boldFont })
    y -= 5
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) })
    y -= 15

    const startIdx = pageNum * itemsPerPage
    const endIdx = Math.min(startIdx + itemsPerPage, voters.length)

    for (let i = startIdx; i < endIdx; i++) {
      const voter = voters[i]
      page.drawText(`${i + 1}`, { x: 50, y, size: 9, font })
      page.drawText(voter.username.substring(0, 15), { x: 80, y, size: 9, font })
      page.drawText(voter.fullName.substring(0, 25), { x: 180, y, size: 9, font })
      page.drawText(voter.role === "TEACHER" ? "Guru" : "Siswa", { x: 350, y, size: 9, font })
      page.drawText(voter.hasVotedOsis ? "Ya" : "-", { x: 410, y, size: 9, font })
      page.drawText(voter.hasVotedMpk ? "Ya" : "-", { x: 470, y, size: 9, font })
      y -= 16
    }

    // Page number
    page.drawText(`Halaman ${pageNum + 1} dari ${totalPages}`, {
      x: 260,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes as any], { type: "application/pdf" })
}
