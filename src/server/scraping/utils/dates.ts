import { addDays } from "date-fns";

const CACHE_TTL_DAYS = 30;

export function cacheExpiresFromFetchedAt(lastFetchedAt: Date): Date {
  return addDays(lastFetchedAt, CACHE_TTL_DAYS);
}

export function isCacheStale(cacheExpiresAt: Date, now: Date = new Date()): boolean {
  return now.getTime() > cacheExpiresAt.getTime();
}
