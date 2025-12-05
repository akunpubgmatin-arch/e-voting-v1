import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth/session"

export async function POST() {
  try {
    // Pastikan hanya ADMIN yang bisa akses
    await requireRole(["ADMIN"])

    // 1. Hapus SEMUA data di tabel Vote (Reset Suara)
    await prisma.vote.deleteMany({})

    // 2. Reset status user (hasVotedOsis & hasVotedMpk jadi false)
    await prisma.user.updateMany({
      data: {
        hasVotedOsis: false,
        hasVotedMpk: false
      }
    })

    return NextResponse.json({ message: "All votes reset successfully" })
  } catch (error) {
    console.error("Error resetting all votes:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}