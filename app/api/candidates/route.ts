import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth/session"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const periodeId = searchParams.get("periodeId")
    const type = searchParams.get("type")

    const where: { periodeId?: string; type?: string } = {}
    if (periodeId) where.periodeId = periodeId
    if (type) where.type = type

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: [{ type: "asc" }, { orderNumber: "asc" }],
      include: {
        _count: {
          select: { votes: true },
        },
      },
    })

    return NextResponse.json(candidates)
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN"])

    const data = await req.json()

    if (!data.chairmanName || !data.viceChairmanName || !data.periodeId || !data.type) {
      return NextResponse.json({ message: "Nama ketua, nama wakil, periode, dan tipe harus diisi" }, { status: 400 })
    }

    const candidate = await prisma.candidate.create({
      data: {
        chairmanName: data.chairmanName,
        viceChairmanName: data.viceChairmanName,
        photo: data.photo || null,
        visi: data.visi || null,
        misi: data.misi || null,
        type: data.type,
        orderNumber: data.orderNumber || 1,
        periodeId: data.periodeId,
      },
    })

    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    console.error("Error creating candidate:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
