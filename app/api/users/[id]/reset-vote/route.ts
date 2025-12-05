import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth/session"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"])
    const { id } = await params

    // 1. Hapus data vote milik user ini
    await prisma.vote.deleteMany({
      where: { userId: id }
    })

    // 2. Reset status hasVoted user ini
    await prisma.user.update({
      where: { id },
      data: {
        hasVotedOsis: false,
        hasVotedMpk: false
      }
    })

    return NextResponse.json({ message: "Voting status reset successfully" })
  } catch (error) {
    console.error("Error resetting user vote:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}