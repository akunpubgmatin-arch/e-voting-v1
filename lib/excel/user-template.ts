// lib/excel/user-template.ts
import ExcelJS from "exceljs"

export async function downloadUserTemplate(type: "SISWA" | "GURU") {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(type === "GURU" ? "Template Guru" : "Template Siswa")

  // 1. Define Columns
  if (type === "GURU") {
    sheet.columns = [
      { header: "NIP", key: "username", width: 25 },
      { header: "Nama Lengkap", key: "fullName", width: 40 },
      { header: "Role", key: "role", width: 15 }, // Hidden/Auto
    ]
  } else {
    sheet.columns = [
      { header: "NISN", key: "username", width: 20 },
      { header: "Nama Lengkap", key: "fullName", width: 40 },
      { header: "Role", key: "role", width: 15 },
    ]
  }

  // 2. Add Example Data
  if (type === "GURU") {
    sheet.addRow({ username: "198501012010011001", fullName: "Contoh Nama Guru", role: "TEACHER" })
  } else {
    sheet.addRow({ username: "0051234567", fullName: "Contoh Nama Siswa", role: "USER" })
  }

  // 3. Styling Header (Row 1)
  const headerRow = sheet.getRow(1)
  headerRow.eachCell((cell) => {
    // Background Color (Light Blue)
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDCE6F1" },
    }
    // Font Bold
    cell.font = {
      bold: true,
      color: { argb: "FF000000" },
      size: 11,
    }
    // Borders
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    }
    // Alignment
    cell.alignment = { vertical: "middle", horizontal: "center" }
  })

  // 4. Data Validation / Lock Role (Optional suggestion for user)
  // sheet.getColumn('role').hidden = true; // Bisa di-hide kalau mau

  // 5. Generate Buffer & Download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = type === "GURU" ? "template_import_guru.xlsx" : "template_import_siswa.xlsx"
  anchor.click()
  window.URL.revokeObjectURL(url)
}