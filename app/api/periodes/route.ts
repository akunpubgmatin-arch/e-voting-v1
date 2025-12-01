import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth/session"

export async function GET() {
  try {
    const periodes = await prisma.periode.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
    })
    return NextResponse.json(periodes)
  } catch (error) {
    console.error("Error fetching periodes:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN"])

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ message: "Nama periode harus diisi" }, { status: 400 })
    }

    const periode = await prisma.periode.create({
      data: { name },
    })

    return NextResponse.json(periode, { status: 201 })
  } catch (error) {
    console.error("Error creating periode:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
