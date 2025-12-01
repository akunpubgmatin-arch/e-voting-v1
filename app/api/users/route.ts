import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth/session"
import { hashPassword } from "@/lib/utils/password"

export async function GET(req: Request) {
  try {
    await requireRole(["ADMIN", "COMMITTEE"])

    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")

    const where: { role?: { in: ("USER" | "TEACHER" | "COMMITTEE" | "ADMIN")[] } } = {}
    if (role) {
      where.role = { in: [role as "USER" | "TEACHER" | "COMMITTEE" | "ADMIN"] }
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        hasVotedOsis: true,
        hasVotedMpk: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN"])

    const { username, password, fullName, role } = await req.json()

    if (!username || !password || !fullName) {
      return NextResponse.json({ message: "Username, password, dan nama harus diisi" }, { status: 400 })
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Username sudah digunakan" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        role: role || "USER",
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
