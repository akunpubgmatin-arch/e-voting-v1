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

    // Hash default password
    const defaultPassword = await hashPassword("password123")

    // Create users
    const result = await prisma.user.createMany({
      data: newUsers.map((u: { username: string; fullName: string; role?: string }) => ({
        username: u.username,
        password: defaultPassword,
        fullName: u.fullName,
        role: (u.role as "USER" | "TEACHER") || "USER",
      })),
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
