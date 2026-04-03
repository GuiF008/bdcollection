import { scrapeLog } from "./logger";

const DEFAULT_UA =
  "BdCollection/1.0 (+local; cache catalogue personnel; respectueux des serveurs)";

export type FetchHtmlOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  userAgent?: string;
};

export async function fetchHtml(
  url: string,
  options: FetchHtmlOptions = {}
): Promise<{ ok: true; html: string; finalUrl: string } | { ok: false; error: string }> {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const maxRetries = options.maxRetries ?? 2;
  const userAgent = options.userAgent ?? DEFAULT_UA;

  let lastError = "échec inconnu";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": userAgent,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9",
        },
        redirect: "follow",
      });

      clearTimeout(timer);

      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        if (res.status >= 500 && attempt < maxRetries) {
          await delay(400 * (attempt + 1));
          continue;
        }
        return { ok: false, error: lastError };
      }

      const html = await res.text();
      return { ok: true, html, finalUrl: res.url };
    } catch (e) {
      clearTimeout(timer);
      lastError = e instanceof Error ? e.message : String(e);
      scrapeLog.warn(`fetch tentative ${attempt + 1}/${maxRetries + 1}`, { url, lastError });
      if (attempt < maxRetries) {
        await delay(500 * (attempt + 1));
      }
    }
  }

  return { ok: false, error: lastError };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
