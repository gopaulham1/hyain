export type Flight = {
  airline: string;
  from: string;
  to: string;
  price: string;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  stops: string;
  note: string;

  // ✅ Day 13 add-ons
  tag?: "BEST" | "CHEAPEST" | "FASTEST" | "DIRECT";
  scoreNote?: string; // extra explanation if you want later
};

