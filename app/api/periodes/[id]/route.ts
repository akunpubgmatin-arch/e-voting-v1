import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth/session"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const periode = await prisma.periode.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
    })

    if (!periode) {
      return NextResponse.json({ message: "Periode tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(periode)
  } catch (error) {
    console.error("Error fetching periode:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"])

    const { id } = await params
    const data = await req.json()

    // If setting as active, deactivate other periods first
    if (data.isActive === true) {
      await prisma.periode.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      })
    }

    const periode = await prisma.periode.update({
      where: { id },
      data,
    })

    return NextResponse.json(periode)
  } catch (error) {
    console.error("Error updating periode:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"])

    const { id } = await params

    // Check if periode has votes
    const voteCount = await prisma.vote.count({
      where: { periodeId: id },
    })

    if (voteCount > 0) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus periode yang sudah memiliki data voting" },
        { status: 400 },
      )
    }

    await prisma.periode.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Periode berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting periode:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
