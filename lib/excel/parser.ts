import * as XLSX from "xlsx"

export interface ParsedUser {
  username: string
  password?: string // Tambahkan field password (opsional)
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

          // Cek berbagai kemungkinan nama kolom
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
          
          // Logika Auto-Role jika kolom Role kosong
          if (!roleRaw) {
             if (row.nip || row.NIP) roleRaw = "TEACHER"
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

          // SET DEFAULT PASSWORD = USERNAME
          // Ini memastikan password default sesuai dengan NIP/NISN
          const password = username; 

          users.push({ username, fullName, role, password })
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