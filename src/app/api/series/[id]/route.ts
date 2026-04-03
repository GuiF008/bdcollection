import { NextRequest, NextResponse } from "next/server";
import { getCatalogSeriesById, withStaleFlag } from "@/server/scraping/services/series-cache.service";

type RouteContext = { params: Promise<{ id: string }> };

/** Série catalogue (cache Bedetheque), pas la collection personnelle. */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const full = await getCatalogSeriesById(id);
  if (!full) {
    return NextResponse.json({ error: "Série catalogue introuvable" }, { status: 404 });
  }
  return NextResponse.json({
    ...withStaleFlag(full),
    albums: full.albums,
  });
}
