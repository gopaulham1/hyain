import type { ParsedQuery } from "./types";

export function buildResultsUrl(parsed: ParsedQuery) {
  // v1: keep backwards-compat by ALSO including a readable `query`.
  // Prefer structured params so Results page can use them directly.
  const params = new URLSearchParams();

  if (parsed.from) params.set("from", parsed.from);
  if (parsed.to) params.set("to", parsed.to);
  if (parsed.departDateISO) params.set("depart", parsed.departDateISO);
  if (parsed.returnDateISO) params.set("return", parsed.returnDateISO);

  if (parsed.availability?.kind === "only_weekends") {
    params.set("only", "weekends");
  } else if (parsed.availability?.kind === "only_weekday") {
    params.set("only", String(parsed.availability.weekday)); // 0..6
  }

  if (parsed.dateIntent) params.set("when", parsed.dateIntent);
  if (parsed.passengers) params.set("pax", String(parsed.passengers));
  if (parsed.tripType) params.set("trip", parsed.tripType);
  if (parsed.cabin) params.set("cabin", parsed.cabin);

  // Human-readable fallback for display + API (until API supports structured params)
  const parts: string[] = [];

  if (parsed.from && parsed.to) parts.push(`${parsed.from} to ${parsed.to}`);
  else if (parsed.from) parts.push(`from ${parsed.from}`);
  else if (parsed.to) parts.push(`to ${parsed.to}`);

  if (parsed.dateIntent) parts.push(parsed.dateIntent.replace(/_/g, " "));
  if (parsed.passengers) parts.push(`for ${parsed.passengers}`);
  if (parsed.tripType === "return") parts.push("return");
  if (parsed.cabin) parts.push(parsed.cabin);

  // Always preserve exactly what the user typed
  const raw = parsed.raw.trim();
  params.set("query", raw || parts.join(" ").trim());

  return `/results?${params.toString()}`;
}
