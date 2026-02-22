export const CITY_TO_ISO2: Record<string, string> = {
  london: "GB",
  manchester: "GB",
  paris: "FR",
  nice: "FR",
  rome: "IT",
  milan: "IT",
  barcelona: "ES",
  madrid: "ES",
  amsterdam: "NL",
  antalya: "TR",
  berlin: "DE",
  munich: "DE",
  hamburg: "DE",
  beijing: "CN",
  lisbon: "PT",
  athens: "GR",
  dubai: "AE",
  abu_dhabi: "AE",
  marrakech: "MA",
  agadir: "MA",
  istanbul: "TR",
  chișinău: "MD",
  chisinau: "MD",
};

export function cityToIso2(city: string) {
  const key = city.trim().toLowerCase();
  return CITY_TO_ISO2[key] ?? null;
}
