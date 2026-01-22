import type { ParsedQuery } from "./types";

export function buildResultsUrl(parsed: ParsedQuery) {
  // Keep your existing style: /results?query=...
  // But ensure consistent construction.
  const parts: string[] = [];

  if (parsed.from && parsed.to) parts.push(`${parsed.from} to ${parsed.to}`);
  else if (parsed.from) parts.push(`from ${parsed.from}`);
  else if (parsed.to) parts.push(`to ${parsed.to}`);

  if (parsed.dateIntent) parts.push(parsed.dateIntent.replace("_", " "));
  if (parsed.passengers) parts.push(`for ${parsed.passengers}`);

  const query = parts.join(" ").trim() || parsed.raw.trim();

  return `/results?query=${encodeURIComponent(query)}`;
}
