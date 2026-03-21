export type DateIntent =
  | "today"
  | "tomorrow"
  | "this_week"
  | "next_week"
  | "this_weekend"
  | "next_weekend"
  | "this_month"
  | "next_month"
  | "flexible"
  | "month"
  | "range"
  | "date"
  | null;

export type TripType = "oneway" | "return" | null;

export type Cabin = "economy" | "premium" | "business" | "first" | null;

export type ParsedQuery = {
  raw: string;

  from: string | null;
  to: string | null;

  dateIntent: DateIntent;
  departDateISO: string | null; // YYYY-MM-DD if you can resolve it
  returnDateISO: string | null;

  tripType: TripType;
  passengers: number | null;
  budget: { max: number; currency: "GBP" } | null;
  cabin: Cabin;
  vibes: string[];

  confidence: number; // 0..1 (super useful later)
};
