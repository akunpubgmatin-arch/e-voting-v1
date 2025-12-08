import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth/session"

export async function POST() {
  try {
    await requireRole(["ADMIN"])

    // Delete all votes
    await prisma.vote.deleteMany()

    // Reset all users' voting status
    await prisma.user.updateMany({
      data: {
        hasVotedOsis: false,
        hasVotedMpk: false,
      },
    })

    return NextResponse.json({ message: "Semua data voting berhasil direset" })
  } catch (error) {
    console.error("Error resetting all votes:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}