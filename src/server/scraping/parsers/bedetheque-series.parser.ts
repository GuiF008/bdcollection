import type * as cheerio from "cheerio";
import { absolutizeUrl } from "../utils/html";
import type { NormalizedSeries } from "../schemas/normalized-series.schema";

/** Ex. https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html */
export const BEDETHEQUE_SERIE_PATH = /^\/serie-(\d+)-BD-[^/]+\.html$/i;

export function extractSourceSeriesIdFromSerieUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.replace(/^www\./, "").endsWith("bedetheque.com")) return null;
    const m = u.pathname.match(/^\/serie-(\d+)-BD-/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

export function isBedethequeSerieUrl(url: string): boolean {
  return extractSourceSeriesIdFromSerieUrl(url) !== null;
}

export function slugFromSerieUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const base = u.pathname.split("/").pop() ?? "";
    return base.replace(/\.html$/i, "") || null;
  } catch {
    return null;
  }
}

export function parseSeriesMeta(
  $: cheerio.CheerioAPI,
  pageUrl: string
): Omit<NormalizedSeries, "source"> & { source: "bedetheque" } {
  const idHidden = $("#IdSerie").attr("value")?.trim();
  const fromUrl = extractSourceSeriesIdFromSerieUrl(pageUrl);
  const sourceSeriesId = idHidden ?? fromUrl;

  const title =
    $(".bandeau-info.serie h1 a").first().text().trim() ||
    $("title").text().split("-")[0]?.trim() ||
    null;

  const genre = $("ul.serie-info li label:contains('Genre')").parent().find(".style-serie").text().trim();
  const parution = $("ul.serie-info li label:contains('Parution')")
    .parent()
    .find(".parution-serie")
    .text()
    .trim();
  const tomesLi = $("ul.serie-info li")
    .filter((_, el) => $(el).find("label:contains('Tomes')").length > 0)
    .first();
  const tomesText = tomesLi.clone().find("label").remove().end().text().trim();
  const tomesParsed = parseInt(tomesText, 10);

  const bandeauAlbumsText = $(".bandeau-info.serie h3 span")
    .filter((_, el) => $(el).find(".icon-book").length > 0)
    .first()
    .text();
  const bandeauMatch = bandeauAlbumsText.match(/(\d+)\s*albums/i);
  const fromBandeau = bandeauMatch ? parseInt(bandeauMatch[1], 10) : NaN;
  const nombreAlbumsSite = Number.isFinite(fromBandeau)
    ? fromBandeau
    : Number.isFinite(tomesParsed)
      ? tomesParsed
      : null;
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    null;

  return {
    source: "bedetheque",
    sourceSeriesId: sourceSeriesId ?? null,
    sourceUrl: pageUrl,
    titre: title,
    slug: slugFromSerieUrl(pageUrl),
    univers: genre || null,
    resume: description,
    statutParution: parution || null,
    nombreAlbumsSite,
    raw: {
      genre,
      parution,
      tomesText,
      bandeauAlbumsText: bandeauAlbumsText.trim() || null,
    },
  };
}

/**
 * Détermine les URLs à charger pour obtenir toute la liste (préfère la page « Tout »).
 */
export function planSerieAlbumPageUrls($: cheerio.CheerioAPI, currentUrl: string): string[] {
  const pagination = $("div.pagination").first();
  const toutHref = pagination
    .find("a")
    .filter((_, el) => $(el).text().trim().toLowerCase() === "tout")
    .first()
    .attr("href");
  if (toutHref) {
    return [absolutizeUrl(toutHref, currentUrl)];
  }

  const urls = new Set<string>();
  urls.add(currentUrl);
  pagination.find('a[href*="serie-"][href$=".html"]').each((_, el) => {
    const h = $(el).attr("href");
    if (!h || h.toLowerCase().includes("tout")) return;
    urls.add(absolutizeUrl(h, currentUrl));
  });

  return sortSerieUrls([...urls]);
}

function sortSerieUrls(urls: string[]): string[] {
  return urls.sort((a, b) => {
    const na = a.match(/__(\d+)\.html/i)?.[1];
    const nb = b.match(/__(\d+)\.html/i)?.[1];
    if (na === undefined && nb === undefined) return 0;
    if (na === undefined) return -1;
    if (nb === undefined) return 1;
    return parseInt(na, 10) - parseInt(nb, 10);
  });
}
