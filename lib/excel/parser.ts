// lib/excel/parser.ts
import * as XLSX from "xlsx"

export interface ParsedUser {
  username: string
  fullName: string
  role?: "USER" | "TEACHER"
}

export interface ParseResult {
  success: boolean
  data: ParsedUser[]
  errors: string[]
  warnings: string[]
}

export function parseUsersFromExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)

        if (jsonData.length === 0) {
          resolve({ success: false, data: [], errors: ["File Excel kosong"], warnings: [] })
          return
        }

        const users: ParsedUser[] = []
        const errors: string[] = []
        const warnings: string[] = []
        const seenUsernames = new Set<string>()

        jsonData.forEach((row, index) => {
          const rowNum = index + 2

          // MAPPING HEADER: Tambahkan NISN dan NIP
          const username = String(
            row.username || row.Username || 
            row.nis || row.NIS || row.nisn || row.NISN || // Handle Siswa
            row.nip || row.NIP || // Handle Guru
            ""
          ).trim()

          const fullName = String(
            row.fullName || row.FullName || row.nama || row.Nama || row.NAMA || row["Nama Lengkap"] || ""
          ).trim()

          // Parsing Role
          let roleRaw = String(row.role || row.Role || row.ROLE || "").trim().toUpperCase()
          
          // Logika Otomatisasi Role jika kolom Role kosong di Excel
          if (!roleRaw) {
             // Jika header mengandung NIP, asumsi Guru
             if (row.nip || row.NIP) roleRaw = "TEACHER"
             // Jika header mengandung NISN, asumsi Siswa
             else if (row.nisn || row.NISN || row.nis || row.NIS) roleRaw = "USER"
          }

          let role: "USER" | "TEACHER" = "USER"
          if (roleRaw === "TEACHER" || roleRaw === "GURU") {
            role = "TEACHER"
          }

          if (!username) {
            errors.push(`Baris ${rowNum}: NIP/NISN/Username kosong`)
            return
          }

          if (seenUsernames.has(username.toLowerCase())) {
            warnings.push(`Baris ${rowNum}: Data "${username}" duplikat, dilewati.`)
            return
          }
          seenUsernames.add(username.toLowerCase())

          if (!fullName) {
            errors.push(`Baris ${rowNum}: Nama Lengkap kosong`)
            return
          }

          users.push({ username, fullName, role })
        })

        resolve({
          success: errors.length === 0 && users.length > 0,
          data: users,
          errors,
          warnings,
        })
      } catch (error) {
        resolve({ success: false, data: [], errors: ["Gagal memproses file"], warnings: [] })
      }
    }
    reader.readAsArrayBuffer(file)
  })
}