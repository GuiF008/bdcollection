import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/** Liste des jobs d’import (usage admin / debug). */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 200);

  const jobs = await prisma.importJob.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      series: { select: { id: true, title: true, sourceSeriesId: true } },
    },
  });

  return NextResponse.json({ jobs });
}
