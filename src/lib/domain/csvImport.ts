import type { ImportAlbumInput } from "./types";

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

function normalizeHeaderKey(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

type ColumnKey = keyof ImportAlbumInput;

const HEADER_TO_FIELD: Record<string, ColumnKey> = {
  serie: "serie",
  series: "serie",
  collection: "serie",
  titre: "titre",
  auteur: "auteur",
  editeur: "editeur",
  "date de parution": "dateParution",
  "date parution": "dateParution",
  tome: "tome",
  resume: "resume",
  "edition originale": "editionOriginale",
  notes: "notesPerso",
  isbn: "isbn",
  ean: "ean",
  title: "titre",
  author: "auteur",
  publisher: "editeur",
  volume: "tome",
  summary: "resume",
};

function detectDelimiter(firstLine: string): ";" | "," {
  const semi = (firstLine.match(/;/g) ?? []).length;
  const comma = (firstLine.match(/,/g) ?? []).length;
  return semi >= comma ? ";" : ",";
}

function parseCsvRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    const nonEmpty = row.some((cell) => cell !== "");
    if (nonEmpty) rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === delimiter) {
      pushField();
      i++;
      continue;
    }
    if (c === "\r" || c === "\n") {
      pushField();
      pushRow();
      if (c === "\r" && text[i + 1] === "\n") i++;
      i++;
      continue;
    }
    field += c;
    i++;
  }
  pushField();
  if (row.length > 0 && row.some((cell) => cell !== "")) rows.push(row);

  return rows;
}

function parseBoolCell(raw: string): boolean {
  const x = raw.trim().toLowerCase();
  return (
    x === "oui" ||
    x === "yes" ||
    x === "true" ||
    x === "1" ||
    x === "vrai" ||
    x === "o"
  );
}

function parseTome(raw: string): number | undefined {
  const t = raw.trim().replace(",", ".");
  if (!t) return undefined;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Parse un CSV d’albums (séparateur `;` ou `,`, guillemets RFC-style).
 * Les en-têtes correspondent à l’export « Albums — CSV » ou aux clés JSON (serie, titre, …).
 */
export function parseAlbumsCsv(text: string): ImportAlbumInput[] {
  const cleaned = stripBom(text).trim();
  if (!cleaned) return [];

  const firstNl = cleaned.search(/\r\n|\r|\n/);
  const firstLine =
    firstNl === -1 ? cleaned : cleaned.slice(0, firstNl);
  const delimiter = detectDelimiter(firstLine);
  const rows = parseCsvRows(cleaned, delimiter);
  if (rows.length < 2) return [];

  const headerCells = rows[0].map((h) => normalizeHeaderKey(h));
  const colIndex: Partial<Record<ColumnKey, number>> = {};

  headerCells.forEach((key, index) => {
    const field = HEADER_TO_FIELD[key];
    if (field !== undefined && colIndex[field] === undefined) {
      colIndex[field] = index;
    }
  });

  const serieIdx = colIndex.serie;
  const titreIdx = colIndex.titre;
  if (serieIdx === undefined || titreIdx === undefined) {
    throw new Error(
      "CSV sans colonnes « Serie » et « Titre » (ou équivalent title / serie)."
    );
  }

  const out: ImportAlbumInput[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const serie = (cells[serieIdx] ?? "").trim();
    const titre = (cells[titreIdx] ?? "").trim();
    if (!serie || !titre) continue;

    const item: ImportAlbumInput = { serie, titre };

    const set = (key: ColumnKey, raw: string | undefined) => {
      if (raw === undefined) return;
      const v = raw.trim();
      if (!v) return;
      switch (key) {
        case "serie":
        case "titre":
          return;
        case "tome": {
          const n = parseTome(v);
          if (n !== undefined) item.tome = n;
          return;
        }
        case "editionOriginale":
          item.editionOriginale = parseBoolCell(v);
          return;
        case "auteur":
          item.auteur = v;
          return;
        case "editeur":
          item.editeur = v;
          return;
        case "dateParution":
          item.dateParution = v;
          return;
        case "resume":
          item.resume = v;
          return;
        case "notesPerso":
          item.notesPerso = v;
          return;
        case "isbn":
          item.isbn = v;
          return;
        case "ean":
          item.ean = v;
          return;
        default: {
          const _never: never = key;
          return _never;
        }
      }
    };

    (Object.keys(colIndex) as ColumnKey[]).forEach((key) => {
      const idx = colIndex[key];
      if (idx === undefined) return;
      set(key, cells[idx]);
    });

    out.push(item);
  }

  return out;
}
