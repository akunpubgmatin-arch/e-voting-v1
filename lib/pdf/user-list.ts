// lib/pdf/user-list.ts
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { User } from "@/lib/hooks/use-users"

export function generateUserListPDF(users: User[], role: "TEACHER" | "USER") {
  const doc = new jsPDF()
  const title = role === "TEACHER" ? "DAFTAR DATA GURU" : "DAFTAR DATA SISWA"
  const idLabel = role === "TEACHER" ? "NIP" : "NISN"

  // Filter data sesuai role yang diminta
  const filteredUsers = users.filter((u) => 
    role === "TEACHER" ? u.role === "TEACHER" : u.role === "USER"
  )

  // Header Dokumen
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(11)
  doc.text("SMP Negeri 1 Cibalong", 14, 30)
  doc.text(`Total: ${filteredUsers.length} Data`, 14, 38)

  // Tabel Data
  const tableData = filteredUsers.map((user, index) => [
    index + 1,
    user.username, // NIP atau NISN
    user.fullName,
    user.hasVotedOsis ? "Sudah" : "Belum",
    user.hasVotedMpk ? "Sudah" : "Belum",
  ])

  autoTable(doc, {
    startY: 45,
    head: [["No", idLabel, "Nama Lengkap", "Vote OSIS", "Vote MPK"]],
    body: tableData,
    headStyles: { fillColor: [30, 58, 252] }, // Warna Primary Blue
    theme: "grid",
  })

  // Simpan PDF
  doc.save(`data-${role === "TEACHER" ? "guru" : "siswa"}.pdf`)
}