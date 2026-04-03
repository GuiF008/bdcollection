import type * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { absolutizeUrl } from "../utils/html";
import type { NormalizedAlbum } from "../schemas/normalized-album.schema";

type LabelMap = Record<string, string>;

function stripLabelMap($: cheerio.CheerioAPI, container: cheerio.Cheerio<AnyNode>): LabelMap {
  const out: LabelMap = {};
  container.find("ul.infos > li").each((_, li) => {
    const $li = $(li);
    const label = $li.find("label").first().text().replace(/:\s*$/, "").trim();
    if (!label) return;
    const clone = $li.clone();
    clone.find("label").remove();
    const value = clone.text().replace(/\s+/g, " ").trim();
    if (value) out[label] = value;
  });
  return out;
}

function parseNoteEtVotes(text: string): { note: number | null; votes: number | null } {
  const m = text.match(/Note:\s*([\d.,]+)\/5\s*\((\d+)\s*votes?\)/i);
  if (!m) return { note: null, votes: null };
  const note = parseFloat(m[1].replace(",", "."));
  const votes = parseInt(m[2], 10);
  return {
    note: Number.isFinite(note) ? note : null,
    votes: Number.isFinite(votes) ? votes : null,
  };
}

function parseVolumeFromTitle(raw: string): { tome: string | null; titreSeul: string } {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  const m = cleaned.match(/^(\d+|Cof\d+)\s*\.\s*(.*)$/i);
  if (m) {
    return { tome: m[1], titreSeul: m[2].trim() || cleaned };
  }
  return { tome: null, titreSeul: cleaned };
}

function combineAuteurs(map: LabelMap): string | null {
  const parts: string[] = [];
  const scen = map["Scénario"];
  const dessin = map["Dessin"];
  const coul = map["Couleurs"];
  if (scen) parts.push(`Scénario : ${scen}`);
  if (dessin) parts.push(`Dessin : ${dessin}`);
  if (coul) parts.push(`Couleurs : ${coul}`);
  return parts.length ? parts.join(" · ") : null;
}

function detectEditionOriginale(albumMainHtml: string): boolean | null {
  const lower = albumMainHtml.toLowerCase();
  if (lower.includes("première édition") || lower.includes("premiere edition")) return true;
  if (lower.includes("info édition") && lower.includes("réédition")) return false;
  return null;
}

function parsePlanches(val: string): number | null {
  const n = parseInt(val.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Extrait les albums depuis un fragment HTML contenant `ul.liste-albums`.
 */
export function parseAlbumsFromListe(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  serieTitle: string | null,
  sourceSeriesId: string | null
): { albums: NormalizedAlbum[]; errors: string[] } {
  const albums: NormalizedAlbum[] = [];
  const errors: string[] = [];

  $("ul.liste-albums > li").each((idx, li) => {
    try {
      const $li = $(li);
      const anchorName = $li.find("> a[name]").attr("name")?.trim();
      const albumMain = $li.find(".album-main");
      const linkEl = albumMain.find("h3 a.titre").first();
      const href = linkEl.attr("href");
      const nameSpan = linkEl.find('[itemprop="name"]').first();
      const titleRaw = nameSpan.text().replace(/\s+/g, " ").trim() || linkEl.text().replace(/\s+/g, " ").trim();

      if (!titleRaw) {
        errors.push(`ligne ${idx}: titre vide`);
        return;
      }

      const { tome, titreSeul } = parseVolumeFromTitle(titleRaw);
      const sourceUrl = href ? absolutizeUrl(href, pageUrl) : pageUrl;
      const messageText = albumMain.find("p.message").text();
      const { note, votes } = parseNoteEtVotes(messageText);

      const map = stripLabelMap($, $li);
      const idText = map["Identifiant"];
      const sourceAlbumId = anchorName ?? idText ?? null;

      const couvHref = $li.find("a.browse-couvertures").attr("href");
      const couvImg = $li.find(".couv img").attr("src");
      const coverImageUrl = couvHref
        ? absolutizeUrl(couvHref, pageUrl)
        : couvImg
          ? absolutizeUrl(couvImg, pageUrl)
          : null;

      const auteur = combineAuteurs(map);
      const isbn = map["ISBN"]?.replace(/\s/g, "") ?? null;
      const albumMainHtml = albumMain.html() ?? "";

      const album: NormalizedAlbum = {
        source: "bedetheque",
        sourceSeriesId,
        sourceAlbumId,
        sourceUrl,
        serie: serieTitle,
        titre: titreSeul || titleRaw,
        auteur,
        editeur: map["Editeur"] ?? map["Éditeur"] ?? null,
        dateParution: map["Parution"] ?? null,
        tome,
        resume: null,
        isbn,
        code: isbn ?? idText ?? null,
        pages: map["Planches"] ? parsePlanches(map["Planches"]) : null,
        note,
        nbVotes: votes,
        format: map["Format"] ?? null,
        poids: map["Poids"] ?? null,
        cote: map["Estimation"] ?? null,
        editionOriginale: detectEditionOriginale(albumMainHtml),
        editionLabel: map["Collection"] ?? null,
        coverImageUrl,
        raw: { labels: map, titleRaw },
      };

      albums.push(album);
    } catch (e) {
      errors.push(`ligne ${idx}: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  return { albums, errors };
}
