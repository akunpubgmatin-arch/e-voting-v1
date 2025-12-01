import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const periode = await prisma.periode.findFirst({
      where: { isActive: true },
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
      return NextResponse.json(null, { status: 404 })
    }

    return NextResponse.json(periode)
  } catch (error) {
    console.error("Error fetching active periode:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
