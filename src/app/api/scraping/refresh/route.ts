import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ImportJobStatus } from "@/generated/prisma/enums";
import { refreshSeriesReference } from "@/server/scraping/services/refresh-series.service";
import { getSeriesReferenceById, withStaleFlag } from "@/server/scraping/services/series-cache.service";

const bodySchema = z.object({
  seriesId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Corps invalide", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await refreshSeriesReference(parsed.data.seriesId);

    if (result.status === ImportJobStatus.failed) {
      return NextResponse.json(
        {
          jobId: result.jobId,
          status: result.status,
          errorMessage: result.errorMessage,
          warnings: result.warnings,
        },
        { status: 502 }
      );
    }

    const full = result.seriesReferenceId
      ? await getSeriesReferenceById(result.seriesReferenceId)
      : await getSeriesReferenceById(parsed.data.seriesId);

    return NextResponse.json({
      jobId: result.jobId,
      status: result.status,
      warnings: result.warnings,
      series: full
        ? { ...withStaleFlag(full), albums: full.albums }
        : null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    const status = message.includes("déjà en cours") ? 409 : message.includes("introuvable") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
