import { NextRequest, NextResponse } from "next/server";
import { exportAlbumsJSON, exportAlbumsCSV, exportSeriesJSON } from "@/lib/services/export";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") || "json";
  const type = request.nextUrl.searchParams.get("type") || "albums";

  if (type === "albums" && format === "csv") {
    const csv = await exportAlbumsCSV();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bd-collection-albums-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  if (type === "albums" && format === "json") {
    const data = await exportAlbumsJSON();
    return NextResponse.json(data, {
      headers: {
        "Content-Disposition": `attachment; filename="bd-collection-albums-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  }

  if (type === "series" && format === "json") {
    const data = await exportSeriesJSON();
    return NextResponse.json(data, {
      headers: {
        "Content-Disposition": `attachment; filename="bd-collection-series-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  }

  return NextResponse.json({ error: "Format non supporté" }, { status: 400 });
}
