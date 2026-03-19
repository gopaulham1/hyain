// lib/results/dateQuery.ts

export type DateRange = { start: Date; end: Date };

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function startOfWeekMonday(d: Date) {
  const sd = startOfDay(d);
  const day = sd.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(sd);
  monday.setDate(monday.getDate() + diff);
  return monday;
}

function endOfWeekSunday(d: Date) {
  const monday = startOfWeekMonday(d);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return endOfDay(sunday);
}

function weekendRange(base: Date): DateRange {
  const d = startOfDay(base);
  const day = d.getDay(); // Sun=0 ... Sat=6
  const diffToSat = (6 - day + 7) % 7;
  const sat = new Date(d);
  sat.setDate(sat.getDate() + diffToSat);
  const sun = new Date(sat);
  sun.setDate(sun.getDate() + 1);
  return { start: startOfDay(sat), end: endOfDay(sun) };
}

function monthRange(year: number, monthIndex: number): DateRange {
  const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999); // last day
  return { start, end };
}

function findMonthToken(q: string): { token: string; idx: number } | null {
  const s = q.toLowerCase();

  const keys = Object.keys(MONTHS).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (new RegExp(`\\b${k}\\b`).test(s)) return { token: k, idx: MONTHS[k] };
  }
  return null;
}

export function getMonthLabelFromQuery(q: string): string | null {
  const found = findMonthToken(q);
  if (!found) return null;
  return MONTH_LABELS[found.idx] ?? null;
}

export function getEndOfMonthLabelFromQuery(q: string): string | null {
  const s = q.toLowerCase();
  const m = s.match(/\bend\s+of\s+([a-z]+)\b/);
  if (!m) return null;

  const key = m[1];
  const idx = MONTHS[key];
  if (idx == null) return null;

  return `End of ${MONTH_LABELS[idx]}`;
}

export function getDateRangeFromQuery(q: string): DateRange | null {
  const query = q.toLowerCase();
  const now = new Date();

  // --- A) Relative single-day ---
  if (/\btoday\b/.test(query)) {
    const d = startOfDay(now);
    return { start: d, end: endOfDay(d) };
  }

  if (/\btomorrow\b/.test(query)) {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    const d = startOfDay(t);
    return { start: d, end: endOfDay(d) };
  }

  // --- B) Week / Weekend ---
  if (/\bthis\s+weekend\b/.test(query)) return weekendRange(now);

  if (/\bnext\s+weekend\b/.test(query)) {
    const n = new Date(now);
    n.setDate(n.getDate() + 7);
    return weekendRange(n);
  }

  if (/\bthis\s+week\b/.test(query)) {
    const start = startOfWeekMonday(now);
    const end = endOfWeekSunday(now);
    return { start, end };
  }

  if (/\bnext\s+week\b/.test(query)) {
    const n = new Date(now);
    n.setDate(n.getDate() + 7);
    const start = startOfWeekMonday(n);
    const end = endOfWeekSunday(n);
    return { start, end };
  }

  // --- C) Month intents ---
  if (/\bthis\s+month\b/.test(query)) {
    return monthRange(now.getFullYear(), now.getMonth());
  }

  if (/\bnext\s+month\b/.test(query)) {
    const year =
      now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    const month = (now.getMonth() + 1) % 12;
    return monthRange(year, month);
  }

  // --- D) Explicit date range
  const range = query.match(
    /\b(\d{1,2})\s*([a-z]+)\s*(?:-|to|–)\s*(\d{1,2})\s*([a-z]+)\b/,
  );
  if (range) {
    const d1 = Number(range[1]);
    const m1 = MONTHS[range[2]];
    const d2 = Number(range[3]);
    const m2 = MONTHS[range[4]];
    if (
      Number.isFinite(d1) &&
      Number.isFinite(d2) &&
      m1 != null &&
      m2 != null
    ) {
      const year = now.getFullYear();
      const start = new Date(year, m1, d1, 0, 0, 0, 0);
      const end = new Date(year, m2, d2, 23, 59, 59, 999);
      return { start, end };
    }
  }

  // --- E) "end of March"
  const endOf = query.match(/\bend\s+of\s+([a-z]+)\b/);
  if (endOf) {
    const idx = MONTHS[endOf[1]];
    if (idx != null) {
      return monthRange(now.getFullYear(), idx);
    }
  }

  // --- F) Single date: "4 Feb"
  const single = query.match(/\b(\d{1,2})\s*([a-z]+)\b/);
  if (single) {
    const day = Number(single[1]);
    const month = MONTHS[single[2]];
    if (Number.isFinite(day) && month != null) {
      const year = now.getFullYear();
      const d = new Date(year, month, day);
      return { start: startOfDay(d), end: endOfDay(d) };
    }
  }

  // --- G) Month name anywhere
  const found = findMonthToken(query);
  if (found) {
    return monthRange(now.getFullYear(), found.idx);
  }

  return null;
}

export function getRelativeDateLabelFromQuery(q: string): string | null {
  const query = q.toLowerCase();

  if (/\btoday\b/.test(query)) return "Today";
  if (/\btomorrow\b/.test(query)) return "Tomorrow";
  if (/\bthis\s+weekend\b/.test(query)) return "This weekend";
  if (/\bnext\s+weekend\b/.test(query)) return "Next weekend";
  if (/\bthis\s+week\b/.test(query)) return "This week";
  if (/\bnext\s+week\b/.test(query)) return "Next week";
  if (/\bthis\s+month\b/.test(query)) return "This month";
  if (/\bnext\s+month\b/.test(query)) return "Next month";

  const endOf = getEndOfMonthLabelFromQuery(query);
  if (endOf) return endOf;

  const month = getMonthLabelFromQuery(query);
  if (month) return month;

  return null;
}
