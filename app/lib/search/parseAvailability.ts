import type { AvailabilityIntent } from "./types";

const WEEKDAYS: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

export function parseAvailability(text: string): AvailabilityIntent | null {
  const t = text.toLowerCase();

  // Only weekends
  if (
    /\b(only|just)\s+(on\s+)?weekends?\b/i.test(t) ||
    /\bweekends?\s+only\b/i.test(t)
  ) {
    const raw = (
      t.match(/\b(only|just)\s+(on\s+)?weekends?\b/i)?.[0] ||
      t.match(/\bweekends?\s+only\b/i)?.[0] ||
      "weekends only"
    ).trim();

    return { kind: "only_weekends", raw };
  }

  // Only a specific weekday (only on friday / fridays only / only friday / just on fri)
  const m =
    t.match(
      /\b(only|just)\s+(on\s+)?(sun(day)?|mon(day)?|tue(s(day)?)?|wed(nesday)?|thu(r(s(day)?)?)?|fri(day)?|sat(urday)?)\b/i,
    ) ||
    t.match(
      /\b(sun(day)?|mon(day)?|tue(s(day)?)?|wed(nesday)?|thu(r(s(day)?)?)?|fri(day)?|sat(urday)?)s?\s+only\b/i,
    );

  if (m) {
    // figure out which weekday token matched
    const token = (m[3] || m[1] || m[0]).toLowerCase(); // defensive
    const cleaned = token.replace(/s\b/, ""); // "fridays" -> "friday" (basic)

    // normalize to full keys: sun/mon/tue... are already in map
    const key = cleaned.replace(/\bday\b/, "day"); // no-op but harmless

    const weekday = WEEKDAYS[key as keyof typeof WEEKDAYS];
    if (weekday !== undefined) {
      return { kind: "only_weekday", weekday, raw: m[0].trim() };
    }
  }

  return null;
}
