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

/**
 * Parse Excel file and extract user data
 * Expected columns: username, fullName (or nama), role (optional)
 */
export function parseUsersFromExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)

        if (jsonData.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ["File Excel kosong atau tidak memiliki data"],
            warnings: [],
          })
          return
        }

        const users: ParsedUser[] = []
        const errors: string[] = []
        const warnings: string[] = []
        const seenUsernames = new Set<string>()

        jsonData.forEach((row, index) => {
          const rowNum = index + 2 // +2 because Excel is 1-indexed and has header

          // Get username (various possible column names)
          const username = String(
            row.username || row.Username || row.USERNAME || row.nis || row.NIS || row.nip || row.NIP || "",
          ).trim()

          // Get fullName (various possible column names)
          const fullName = String(
            row.fullName ||
              row.fullname ||
              row.FullName ||
              row.nama ||
              row.Nama ||
              row.NAMA ||
              row.name ||
              row.Name ||
              "",
          ).trim()

          // Get role (optional)
          const roleRaw = String(row.role || row.Role || row.ROLE || row.tipe || row.Tipe || "")
            .trim()
            .toUpperCase()

          // Validate username
          if (!username) {
            errors.push(`Baris ${rowNum}: Username tidak boleh kosong`)
            return
          }

          // Check for duplicate
          if (seenUsernames.has(username.toLowerCase())) {
            warnings.push(`Baris ${rowNum}: Username "${username}" duplikat, akan diabaikan`)
            return
          }
          seenUsernames.add(username.toLowerCase())

          // Validate fullName
          if (!fullName) {
            errors.push(`Baris ${rowNum}: Nama lengkap tidak boleh kosong`)
            return
          }

          // Parse role
          let role: "USER" | "TEACHER" = "USER"
          if (roleRaw === "TEACHER" || roleRaw === "GURU") {
            role = "TEACHER"
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
        resolve({
          success: false,
          data: [],
          errors: [`Error parsing file: ${error instanceof Error ? error.message : "Unknown error"}`],
          warnings: [],
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ["Gagal membaca file"],
        warnings: [],
      })
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Generate template Excel for user import
 */
export function generateUserImportTemplate(): void {
  const templateData = [
    { username: "12345", fullName: "Nama Siswa 1", role: "USER" },
    { username: "12346", fullName: "Nama Siswa 2", role: "USER" },
    { username: "198501012010011001", fullName: "Nama Guru 1", role: "TEACHER" },
  ]

  const ws = XLSX.utils.json_to_sheet(templateData)

  // Set column widths
  ws["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 10 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Template")
  XLSX.writeFile(wb, "template_import_user.xlsx")
}
