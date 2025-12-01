import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = await getCurrentUser()

    // Get active periode
    const activePeriode = await prisma.periode.findFirst({
      where: { isActive: true },
      include: {
        candidates: {
          orderBy: [{ type: "asc" }, { orderNumber: "asc" }],
        },
      },
    })

    if (!activePeriode) {
      return NextResponse.json({
        isActive: false,
        message: "Tidak ada periode voting yang aktif",
      })
    }

    const now = new Date()
    const isWithinTime =
      (!activePeriode.startTime || now >= activePeriode.startTime) &&
      (!activePeriode.endTime || now <= activePeriode.endTime)

    return NextResponse.json({
      isActive: activePeriode.isActive && isWithinTime,
      periode: {
        id: activePeriode.id,
        name: activePeriode.name,
        startTime: activePeriode.startTime,
        endTime: activePeriode.endTime,
      },
      candidates: {
        osis: activePeriode.candidates.filter((c) => c.type === "OSIS"),
        mpk: activePeriode.candidates.filter((c) => c.type === "MPK"),
      },
      userStatus: user
        ? {
            hasVotedOsis: user.hasVotedOsis,
            hasVotedMpk: user.hasVotedMpk,
          }
        : null,
    })
  } catch (error) {
    console.error("Error fetching voting status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
