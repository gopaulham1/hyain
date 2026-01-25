export type DateIntent =
  | "exact"
  | "today"
  | "tomorrow"
  | "this_week"
  | "next_week"
  | "this_weekend"
  | "next_weekend"
  | "month"
  | "flexible"
  | null;

export type AvailabilityIntent =
  | { kind: "only_weekends"; raw: string }
  | { kind: "only_weekday"; weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; raw: string }; // 0=Sun ... 6=Sat

export type TripType = "oneway" | "return" | null;

export type Cabin = "economy" | "premium" | "business" | "first" | null;

export type ParsedQuery = {
  raw: string;

  from: string | null;
  to: string | null;

  dateIntent: DateIntent;
  departDateISO: string | null; // YYYY-MM-DD if you can resolve it
  returnDateISO: string | null;

  whenText: string | null; // e.g. "in feb", "next weekend" (for UI display)

  availability: AvailabilityIntent | null;

  tripType: TripType;
  passengers: number | null;
  cabin: Cabin;

  confidence: number; // 0..1 (super useful later)
};
