import type { ParsedQuery } from "./types";

export function buildResultsUrl(parsed: ParsedQuery) {
  const params = new URLSearchParams();

  if (parsed.from) params.set("from", parsed.from);
  if (parsed.to) params.set("to", parsed.to);
  if (parsed.dateIntent) params.set("when", parsed.dateIntent);
  if (parsed.passengers) params.set("pax", String(parsed.passengers));
  if (parsed.tripType) params.set("trip", parsed.tripType);
  if (parsed.cabin) params.set("cabin", parsed.cabin);

  const parts: string[] = [];

  if (parsed.from && parsed.to) parts.push(`${parsed.from} to ${parsed.to}`);
  else if (parsed.from) parts.push(`from ${parsed.from}`);
  else if (parsed.to) parts.push(`to ${parsed.to}`);

  if (parsed.dateIntent) parts.push(parsed.dateIntent.replace(/_/g, " "));
  if (parsed.passengers) parts.push(`for ${parsed.passengers}`);
  if (parsed.tripType === "return") parts.push("return");
  if (parsed.cabin) parts.push(parsed.cabin);

  const raw = parsed.raw.trim();
  if (raw) params.set("query", raw);

  return `/results?${params.toString()}`;
}
