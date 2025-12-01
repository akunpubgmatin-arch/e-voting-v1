import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    let periodeId = searchParams.get("periodeId")

    // If no periodeId, get active periode
    if (!periodeId) {
      const activePeriode = await prisma.periode.findFirst({
        where: { isActive: true },
      })
      if (activePeriode) {
        periodeId = activePeriode.id
      }
    }

    // Get total voters (USER and TEACHER roles)
    const totalVoters = await prisma.user.count({
      where: { role: { in: ["USER", "TEACHER"] } },
    })

    // Get voted counts
    const votedOsis = await prisma.user.count({
      where: {
        role: { in: ["USER", "TEACHER"] },
        hasVotedOsis: true,
      },
    })

    const votedMpk = await prisma.user.count({
      where: {
        role: { in: ["USER", "TEACHER"] },
        hasVotedMpk: true,
      },
    })

    if (!periodeId) {
      return NextResponse.json({
        totalVoters,
        votedOsis,
        votedMpk,
        osisResults: [],
        mpkResults: [],
      })
    }

    // Get candidates with vote counts
    const candidates = await prisma.candidate.findMany({
      where: { periodeId },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    })

    const osisCandidates = candidates.filter((c) => c.type === "OSIS")
    const mpkCandidates = candidates.filter((c) => c.type === "MPK")

    const totalOsisVotes = osisCandidates.reduce((sum, c) => sum + c._count.votes, 0)
    const totalMpkVotes = mpkCandidates.reduce((sum, c) => sum + c._count.votes, 0)

    const osisResults = osisCandidates.map((c) => ({
      candidateId: c.id,
      candidateName: c.name,
      type: c.type,
      voteCount: c._count.votes,
      percentage: totalOsisVotes > 0 ? (c._count.votes / totalOsisVotes) * 100 : 0,
    }))

    const mpkResults = mpkCandidates.map((c) => ({
      candidateId: c.id,
      candidateName: c.name,
      type: c.type,
      voteCount: c._count.votes,
      percentage: totalMpkVotes > 0 ? (c._count.votes / totalMpkVotes) * 100 : 0,
    }))

    return NextResponse.json({
      totalVoters,
      votedOsis,
      votedMpk,
      osisResults,
      mpkResults,
    })
  } catch (error) {
    console.error("Error fetching quick count:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
