import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth/session"
import { hashPassword } from "@/lib/utils/password"

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN"])

    const { users } = await req.json()

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ message: "Data users tidak valid" }, { status: 400 })
    }

    // Get existing usernames
    const existingUsers = await prisma.user.findMany({
      where: {
        username: { in: users.map((u: { username: string }) => u.username) },
      },
      select: { username: true },
    })
    const existingUsernames = new Set(existingUsers.map((u) => u.username))

    // Filter out duplicates and prepare data
    const newUsers = users.filter((u: { username: string }) => !existingUsernames.has(u.username))

    if (newUsers.length === 0) {
      return NextResponse.json({ message: "Semua username sudah ada", count: 0 })
    }

    // HAPUS DEFAULT PASSWORD HARDCODED "password123"
    // const defaultPassword = await hashPassword("password123") <-- HAPUS INI

    // Siapkan data untuk createMany
    // Kita harus hash password satu per satu karena password setiap user beda (sesuai username)
    // Prisma createMany tidak support hashing otomatis atau fungsi dinamis di dalamnya.
    // Jadi kita harus map dulu datanya dengan password yang sudah di-hash.
    
    const usersToCreate = await Promise.all(
      newUsers.map(async (u: { username: string; fullName: string; role?: string; password?: string }) => {
        // Password default adalah password yang dikirim dari parser (yaitu username)
        // Jika tidak ada, gunakan username sebagai fallback terakhir
        const plainPassword = u.password || u.username;
        const hashedPassword = await hashPassword(plainPassword);

        return {
          username: u.username,
          password: hashedPassword,
          fullName: u.fullName,
          role: (u.role as "USER" | "TEACHER") || "USER",
        };
      })
    );

    // Create users
    const result = await prisma.user.createMany({
      data: usersToCreate,
      skipDuplicates: true,
    })

    return NextResponse.json({
      message: `${result.count} user berhasil diimport`,
      count: result.count,
      skipped: users.length - result.count,
    })
  } catch (error) {
    console.error("Error importing users:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}