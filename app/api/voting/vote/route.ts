import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth/session"

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { candidateId, type } = await req.json()

    if (!candidateId || !type) {
      return NextResponse.json({ message: "Kandidat dan tipe harus diisi" }, { status: 400 })
    }

    // Check if user has already voted for this type
    const hasVoted = type === "OSIS" ? user.hasVotedOsis : user.hasVotedMpk
    if (hasVoted) {
      return NextResponse.json({ message: `Anda sudah memilih untuk ${type}` }, { status: 400 })
    }

    // Get active periode
    const activePeriode = await prisma.periode.findFirst({
      where: { isActive: true },
    })

    if (!activePeriode) {
      return NextResponse.json({ message: "Tidak ada periode voting yang aktif" }, { status: 400 })
    }

    // Check if voting time is valid
    const now = new Date()
    if (activePeriode.startTime && now < activePeriode.startTime) {
      return NextResponse.json({ message: "Voting belum dimulai" }, { status: 400 })
    }
    if (activePeriode.endTime && now > activePeriode.endTime) {
      return NextResponse.json({ message: "Voting sudah berakhir" }, { status: 400 })
    }

    // Verify candidate belongs to active periode
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    })

    if (!candidate || candidate.periodeId !== activePeriode.id) {
      return NextResponse.json({ message: "Kandidat tidak valid" }, { status: 400 })
    }

    if (candidate.type !== type) {
      return NextResponse.json({ message: "Tipe kandidat tidak sesuai" }, { status: 400 })
    }

    // Create vote and update user status in transaction
    await prisma.$transaction([
      prisma.vote.create({
        data: {
          userId: user.id,
          candidateId,
          periodeId: activePeriode.id,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: type === "OSIS" ? { hasVotedOsis: true } : { hasVotedMpk: true },
      }),
    ])

    return NextResponse.json({ message: "Vote berhasil disimpan" })
  } catch (error) {
    console.error("Error submitting vote:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
