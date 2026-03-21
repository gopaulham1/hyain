// app/data/cityTrivia.ts

export const CITY_TRIVIA: Record<string, string> = {
  london: "the world’s oldest underground railway!",
  paris: "the biggest museum in the world!",
  rome: "one of history’s greatest empires!",
  barcelona: "the world's biggest football stadium!",
  amsterdam: "hundreds of historic canals!",
  berlin: "the historic Berlin Wall!",
  vienna: "Mozart and the world's oldest ferris wheel!",
  marrakech: "one of Africa’s largest traditional markets!",
  prague: "the world’s oldest astronomical clock!",
  budapest: "Rubik's cubes and Europe’s largest thermal baths!",
  istanbul: "a city on two continents!",
  athens: "one of the world’s oldest cities!",
  lisbon: "one of Europe’s oldest bookstores!",
  madrid: "Real Madrid football club!",
  dublin: "the birthplace of Guinness!",
  edinburgh: "Alexander Bell and Harry Potter books",
  glasgow: "a globally influential music scene!",
  oslo: "vast Nordic fjords!",
  stockholm: "14 interconnected islands!",
  helsinki: "world-leading Nordic design!",
  copenhagen: "one of the most bike-friendly cities!",
  warsaw: "a rebuilt UNESCO-listed Old Town!",
  krakow: "Europe’s largest medieval square!",
  bucharest: "one of the world’s heaviest buildings!",
  sofia: "one of Europe’s oldest cities!",
  belgrade: "the meeting of two great rivers!",
  zurich: "top global quality of life!",
  geneva: "the European headquarters of the UN!",
  dubai: "the world’s tallest building!",
  abudhabi: "the Sheikh Zayed Grand Mosque!",
  cairo: "the Great Pyramids of Giza!",
  chisinau: "one of Europe’s greenest capitals!",
};

export function getTriviaFact(city: string) {
  const key = (city ?? "").trim().toLowerCase();
  return CITY_TRIVIA[key] ?? null;
}
