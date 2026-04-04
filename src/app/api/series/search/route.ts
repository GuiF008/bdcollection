import { NextRequest, NextResponse } from "next/server";
import { searchSeriesReferences, withStaleFlag } from "@/server/scraping/services/series-cache.service";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ series: [] });
  }

  const rows = await searchSeriesReferences(q);
  return NextResponse.json({
    series: rows.map((s) => withStaleFlag(s)),
  });
}
