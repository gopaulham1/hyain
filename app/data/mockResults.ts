import type { Flight } from "@/app/types/flight";

export const mockResults: Flight[] = [
  // 🇫🇷 PARIS
  {
    airline: "Wizz Air",
    from: "London LTN",
    to: "Paris BVA",
    price: "£39",
    duration: "1h 10m",
    stops: "Direct",
    note: "Cheapest option for your dates",
  },
  {
    airline: "EasyJet",
    from: "London LGW",
    to: "Paris CDG",
    price: "£22",
    duration: "1h 20m",
    stops: "Direct",
    note: "Best balance of time + airport",
  },

  // 🇮🇹 ROME
  {
    airline: "Ryanair",
    from: "London STN",
    to: "Rome CIA",
    price: "£29",
    duration: "2h 35m",
    stops: "Direct",
    note: "Ultra-budget Rome getaway",
  },
  {
    airline: "ITA Airways",
    from: "London LHR",
    to: "Rome FCO",
    price: "£89",
    duration: "2h 30m",
    stops: "Direct",
    note: "Full-service airline",
  },

  // 🇪🇸 BARCELONA
  {
    airline: "Vueling",
    from: "London LGW",
    to: "Barcelona BCN",
    price: "£47",
    duration: "2h 10m",
    stops: "Direct",
    note: "Good balance of price and airport",
  },
  {
    airline: "EasyJet",
    from: "Manchester MAN",
    to: "Barcelona BCN",
    price: "£55",
    duration: "2h 20m",
    stops: "Direct",
    note: "Northern UK departure",
  },

  // 🇩🇪 BERLIN
  {
    airline: "Ryanair",
    from: "London STN",
    to: "Berlin BER",
    price: "£34",
    duration: "1h 55m",
    stops: "Direct",
    note: "Cheapest to Berlin",
  },
  {
    airline: "Lufthansa",
    from: "Manchester MAN",
    to: "Berlin BER",
    price: "£120",
    duration: "4h 10m",
    stops: "1 stop",
    note: "Stopover in Frankfurt",
  },

  // 🇹🇷 ISTANBUL
  {
    airline: "Pegasus",
    from: "London STN",
    to: "Istanbul SAW",
    price: "£79",
    duration: "3h 55m",
    stops: "Direct",
    note: "Best budget option",
  },
  {
    airline: "Turkish Airlines",
    from: "London LHR",
    to: "Istanbul IST",
    price: "£145",
    duration: "3h 45m",
    stops: "Direct",
    note: "Most comfortable",
  },

  // 🇨🇭 GENEVA
  {
    airline: "EasyJet",
    from: "London LGW",
    to: "Geneva GVA",
    price: "£48",
    duration: "1h 40m",
    stops: "Direct",
    note: "Popular ski route",
  },
  {
    airline: "British Airways",
    from: "London LHR",
    to: "Geneva GVA",
    price: "£110",
    duration: "1h 35m",
    stops: "Direct",
    note: "Best airport + comfort",
  },

  // 🇵🇱 WARSAW
  {
    airline: "Wizz Air",
    from: "London LTN",
    to: "Warsaw WAW",
    price: "£31",
    duration: "2h 25m",
    stops: "Direct",
    note: "Cheapest to Poland",
  },
  {
    airline: "LOT Polish Airlines",
    from: "London LHR",
    to: "Warsaw WAW",
    price: "£95",
    duration: "2h 15m",
    stops: "Direct",
    note: "National carrier",
  },

  // 🇷🇴 BUCHAREST
  {
    airline: "Wizz Air",
    from: "London LTN",
    to: "Bucharest OTP",
    price: "£35",
    duration: "3h 15m",
    stops: "Direct",
    note: "Best value route",
  },
  {
    airline: "Ryanair",
    from: "Birmingham BHX",
    to: "Bucharest OTP",
    price: "£42",
    duration: "3h 20m",
    stops: "Direct",
    note: "Midlands departure",
  },
];

