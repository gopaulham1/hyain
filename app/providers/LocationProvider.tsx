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
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);

          const data = await res.json();

          setGeo({
            lat,
            lon,
            city: data.city,
            country: data.country,
            source: "gps",
          });
        } catch {
          // fallback if reverse geocode fails
          setGeo({
            lat,
            lon,
            source: "gps",
          });
        }

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
