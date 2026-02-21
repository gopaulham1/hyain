import { NextResponse } from "next/server";
export const runtime = "nodejs";

type VisaRequest = {
  passport: string; // can be "UK" | "EU" | "Turkey" | "GB" | "FR" | "TR" | "GBR" etc
  destination: string; // should be ISO2 ideally, but we’ll normalize
};

const ISO3_TO_ISO2: Record<string, string> = {
  GBR: "GB",
  FRA: "FR",
  DEU: "DE",
  ESP: "ES",
  ITA: "IT",
  USA: "US",
  TUR: "TR",
  ARE: "AE",
  MDA: "MD",
};

function toIso2(code: string) {
  const v = (code || "").trim().toUpperCase();

  // UI labels → ISO2
  if (v === "UK") return "GB";
  if (v === "TURKEY") return "TR";

  // Your “EU” option is not a real passport code.
  // MVP choice: treat "EU" as FR (change later if you want)
  if (v === "EU") return "FR";

  // ISO3 → ISO2 if we know it
  if (v.length === 3 && ISO3_TO_ISO2[v]) return ISO3_TO_ISO2[v];

  // already ISO2 (GB, FR, TR, AE, etc) or unknown
  return v;
}

export async function POST(req: Request) {
  try {
    const body: VisaRequest = await req.json();
    const passport = toIso2(body.passport);
    const destination = toIso2(body.destination);

    if (!passport || !destination) {
      return NextResponse.json(
        { ok: false, error: "Missing passport or destination" },
        { status: 400 },
      );
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing RapidAPI key" },
        { status: 500 },
      );
    }

    const url = "https://visa-requirement.p.rapidapi.com/v2/visa/check";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "visa-requirement.p.rapidapi.com",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ passport, destination }),
    });

    const data = await response.json();

    // API-level error (their shape)
    const payload = data?.data;
    if (data?.error || !payload) {
      return NextResponse.json({
        ok: false,
        error:
          data?.message || "No visa information found for this combination.",
        provider: "rapidapi",
        raw: data,
      });
    }

    const primaryRule = payload?.visa_rules?.primary_rule;
    const primaryName = (primaryRule?.name || "").toLowerCase();

    const parseDays = (duration?: string) => {
      if (!duration) return undefined;
      const m = duration.match(/(\d+)/);
      return m ? Number(m[1]) : undefined;
    };

    const durationDays = parseDays(primaryRule?.duration);

    // Rough inference
    const visaRequired =
      primaryName.includes("visa required") ||
      primaryName.includes("visa needed");

    const actions: { label: string; url: string }[] = [];

    if (payload?.mandatory_registration?.link) {
      actions.push({
        label: payload.mandatory_registration.name || "Registration",
        url: payload.mandatory_registration.link,
      });
    }

    const secondaryRule = payload?.visa_rules?.secondary_rule;
    if (secondaryRule?.link) {
      actions.push({
        label: secondaryRule.name || "Alternative option",
        url: secondaryRule.link,
      });
    }

    if (payload?.destination?.embassy_url) {
      actions.push({
        label: "Embassy info",
        url: payload.destination.embassy_url,
      });
    }

    return NextResponse.json({
      ok: true,
      provider: "rapidapi",
      visaRequired,
      summary: primaryRule?.name || "Visa rule",
      durationDays,
      passportValidity: payload?.destination?.passport_validity,
      embassyUrl: payload?.destination?.embassy_url,
      actions,
      raw: data, // keep for debugging, remove later if you want
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 },
    );
  }
}
