import * as cheerio from "cheerio";

export function loadHtml(html: string) {
  return cheerio.load(html);
}

export function absolutizeUrl(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}
