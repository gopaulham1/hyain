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

  tag?: "BEST" | "CHEAPEST" | "FASTEST" | "DIRECT";
  scoreNote?: string;
};
