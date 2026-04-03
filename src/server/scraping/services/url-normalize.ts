export function normalizeSerieUrl(raw: string): string {
  const u = new URL(raw.trim());
  u.protocol = "https:";
  u.hostname = u.hostname.toLowerCase();
  u.hash = "";
  return u.toString();
}
