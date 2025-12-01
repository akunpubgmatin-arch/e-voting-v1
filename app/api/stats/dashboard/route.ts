import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const [totalUsers, totalVoters, totalCandidates, totalPeriodes, votedOsis, votedMpk] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ["USER", "TEACHER"] } } }),
      prisma.candidate.count(),
      prisma.periode.count(),
      prisma.user.count({
        where: { role: { in: ["USER", "TEACHER"] }, hasVotedOsis: true },
      }),
      prisma.user.count({
        where: { role: { in: ["USER", "TEACHER"] }, hasVotedMpk: true },
      }),
    ])

    const participationRate = totalVoters > 0 ? ((votedOsis + votedMpk) / (totalVoters * 2)) * 100 : 0

    return NextResponse.json({
      totalUsers,
      totalVoters,
      totalCandidates,
      totalPeriodes,
      votedOsis,
      votedMpk,
      participationRate,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
