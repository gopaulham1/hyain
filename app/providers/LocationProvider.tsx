"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Geo = {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  source: "gps" | "unknown";
};

type LocationContextValue = {
  geo: Geo | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getGeo = () => {
    setLoading(true);
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          source: "gps",
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Location permission denied");
        setGeo(null);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  };

  // Auto-request on first load (simple MVP)
  useEffect(() => {
    getGeo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      geo,
      loading,
      error,
      requestPermission: getGeo,
    }),
    [geo, loading, error],
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
