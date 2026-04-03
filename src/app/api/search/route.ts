import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/services/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";

  if (q.length < 2) {
    return NextResponse.json({ albums: [], series: [] });
  }

  const results = await globalSearch(q);
  return NextResponse.json(results);
}
