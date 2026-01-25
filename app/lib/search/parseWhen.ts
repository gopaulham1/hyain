import type { DateIntent } from "./types";

export type WhenParseResult = {
  dateIntent: DateIntent;
  departDateISO: string | null; // YYYY-MM-DD
  returnDateISO: string | null; // YYYY-MM-DD (for ranges)
  rawMatch: string; // what matched, useful for debugging
  confidence: number; // 0..1
};

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function isoDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Create a “safe” UTC date at noon to avoid DST weirdness.
function asNoonUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0));
}

function addDaysUTC(d: Date, days: number): Date {
  const x = asNoonUTC(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function startOfWeekMondayUTC(d: Date): Date {
  const x = asNoonUTC(d);
  const day = x.getUTCDay(); // 0 Sun..6 Sat
  const diff = (day + 6) % 7; // how many days since Monday
  return addDaysUTC(x, -diff);
}

function rangeThisWeekUTC(now: Date) {
  const mon = startOfWeekMondayUTC(now);
  const sun = addDaysUTC(mon, 6);
  return { start: mon, end: sun };
}

function rangeNextWeekUTC(now: Date) {
  const thisMon = startOfWeekMondayUTC(now);
  const nextMon = addDaysUTC(thisMon, 7);
  const nextSun = addDaysUTC(nextMon, 6);
  return { start: nextMon, end: nextSun };
}

// Weekend = Fri–Sun
function rangeThisWeekendUTC(now: Date) {
  const { start: mon, end: sun } = rangeThisWeekUTC(now);
  const fri = addDaysUTC(mon, 4);

  const today = asNoonUTC(now);

  // If we're already in Fri–Sun, "this weekend" is the current Fri–Sun.
  if (today.getTime() >= fri.getTime() && today.getTime() <= sun.getTime()) {
    return { start: fri, end: sun };
  }

  // Otherwise it’s the upcoming Fri–Sun in this week.
  return { start: fri, end: sun };
}

function rangeNextWeekendUTC(now: Date) {
  const thisWknd = rangeThisWeekendUTC(now);
  return { start: addDaysUTC(thisWknd.start, 7), end: addDaysUTC(thisWknd.end, 7) };
}

function monthRangeUTC(year: number, monthIndex: number) {
  const start = new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0, 12, 0, 0)); // day 0 = last day prev month
  return { start, end };
}

function looksTravelish(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes(" to ") ||
    t.startsWith("to ") ||
    t.includes(" from ") ||
    t.includes("flight") ||
    t.includes("flights") ||
    t.includes("travel") ||
    t.includes("anywhere") ||
    t.includes("somewhere")
  );
}

export function parseWhen(text: string, now = new Date()): WhenParseResult | null {
  const t = text.toLowerCase();

  // A) Relative single-day
  if (/\btoday\b/i.test(t)) {
    const d = asNoonUTC(now);
    return {
      dateIntent: "today",
      departDateISO: isoDateUTC(d),
      returnDateISO: null,
      rawMatch: "today",
      confidence: 0.95,
    };
  }

  if (/\btomorrow\b/i.test(t)) {
    const d = addDaysUTC(now, 1);
    return {
      dateIntent: "tomorrow",
      departDateISO: isoDateUTC(d),
      returnDateISO: null,
      rawMatch: "tomorrow",
      confidence: 0.95,
    };
  }

  // B) Weekend
  if (/\bnext weekend\b/i.test(t)) {
    const { start, end } = rangeNextWeekendUTC(now);
    return {
      dateIntent: "next_weekend",
      departDateISO: isoDateUTC(start),
      returnDateISO: isoDateUTC(end),
      rawMatch: "next weekend",
      confidence: 0.9,
    };
  }

  if (/\bthis weekend\b/i.test(t)) {
    const { start, end } = rangeThisWeekendUTC(now);
    return {
      dateIntent: "this_weekend",
      departDateISO: isoDateUTC(start),
      returnDateISO: isoDateUTC(end),
      rawMatch: "this weekend",
      confidence: 0.9,
    };
  }

  // C) Week
  if (/\bnext week\b/i.test(t)) {
    const { start, end } = rangeNextWeekUTC(now);
    return {
      dateIntent: "next_week",
      departDateISO: isoDateUTC(start),
      returnDateISO: isoDateUTC(end),
      rawMatch: "next week",
      confidence: 0.85,
    };
  }

  if (/\bthis week\b/i.test(t)) {
    const { start, end } = rangeThisWeekUTC(now);
    return {
      dateIntent: "this_week",
      departDateISO: isoDateUTC(start),
      returnDateISO: isoDateUTC(end),
      rawMatch: "this week",
      confidence: 0.85,
    };
  }

  // E) “in X days/weeks”
  const inN = t.match(/\bin\s+(\d+)\s+(day|days|week|weeks)\b/i);
  if (inN) {
    const n = Number(inN[1]);
    if (Number.isFinite(n) && n > 0 && n < 366) {
      const unit = inN[2].toLowerCase();
      const days = unit.startsWith("week") ? n * 7 : n;
      const d = addDaysUTC(now, days);
      return {
        dateIntent: "exact",
        departDateISO: isoDateUTC(d),
        returnDateISO: null,
        rawMatch: inN[0],
        confidence: 0.8,
      };
    }
  }

  // D) Month mention: "in feb" / "in february" / optional "feb" alone (travelish only)
  const monthMatch = t.match(/\b(in\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t)?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
  if (monthMatch) {
    const hasIn = !!monthMatch[1];
    const token = monthMatch[2].toLowerCase();

    if (hasIn || looksTravelish(text)) {
      const monthIndex = MONTHS[token];
      if (typeof monthIndex === "number") {
        const nowNoon = asNoonUTC(now);
        const thisYear = nowNoon.getUTCFullYear();
        const thisMonth = nowNoon.getUTCMonth();

        const year = monthIndex < thisMonth ? thisYear + 1 : thisYear;
        const { start, end } = monthRangeUTC(year, monthIndex);

        return {
          dateIntent: "month",
          departDateISO: isoDateUTC(start),
          returnDateISO: isoDateUTC(end),
          rawMatch: monthMatch[0].trim(),
          confidence: hasIn ? 0.85 : 0.7,
        };
      }
    }
  }

  return null;
}
