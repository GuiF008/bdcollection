import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/services/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ albums: [], series: [] });
  }

  const result = await globalSearch(q);
  return NextResponse.json(result);
}
