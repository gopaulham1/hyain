"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type Geo = {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  source: "mock" | "gps" | "unknown";
};

type LocationContextValue = {
  geo: Geo | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  // COMMIT 1: mock only (no browser permission yet)
  const [geo] = useState<Geo>({
    lat: 51.5072,
    lon: -0.1276,
    city: "London",
    country: "UK",
    source: "mock",
  });

  const value = useMemo(
    () => ({
      geo,
      loading: false,
      error: null,
      requestPermission: () => {},
    }),
    [geo],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
