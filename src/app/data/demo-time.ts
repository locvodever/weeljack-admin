/**
 * The one instant the demo treats as "now": Tuesday 24 November 2026, 10:00 UTC. All mock dates
 * are offsets from it and nothing reads the clock, so the prerendered HTML, the specs and every
 * visit show the same story.
 */
export const DEMO_NOW = Date.UTC(2026, 10, 24, 10, 0);

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The ISO instant `minutes` before the demo anchor. */
export function minutesAgo(minutes: number): string {
  return new Date(DEMO_NOW - minutes * MINUTE).toISOString();
}

/** The ISO instant `hours` before the demo anchor. */
export function hoursAgo(hours: number): string {
  return minutesAgo(hours * 60);
}

/** The ISO instant `days` before the demo anchor. */
export function daysAgo(days: number): string {
  return new Date(DEMO_NOW - days * DAY).toISOString();
}

/** How long before the demo anchor an instant was, in words: `35 min ago`, `3 h ago`, `2 days ago`. */
export function relativeTime(iso: string): string {
  const elapsed = Math.max(0, DEMO_NOW - Date.parse(iso));
  if (elapsed < HOUR) {
    return `${Math.max(1, Math.round(elapsed / MINUTE))} min ago`;
  }
  if (elapsed < DAY) {
    return `${Math.round(elapsed / HOUR)} h ago`;
  }
  const days = Math.round(elapsed / DAY);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

/** The calendar day (UTC) of an instant, as whole days since the epoch. */
export function dayNumber(instant: number): number {
  return Math.floor(instant / DAY);
}
