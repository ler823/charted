import { GooglePeriod, OpeningHours } from "@/types/types";

// Google Places API (New). The legacy maps.googleapis.com/maps/api/place
// endpoints can't be enabled on new Cloud projects.
export const PLACES_API_URL = "https://places.googleapis.com";
const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY!;

// Prediction in the legacy shape the UI (and react-native-google-places-autocomplete) uses
export type PlacePrediction = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
};

type NewPeriodPoint = { day: number; hour: number; minute: number };
type NewPeriod = { open?: NewPeriodPoint; close?: NewPeriodPoint };

export type PlaceDetails = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude: number; longitude: number };
  regularOpeningHours?: { periods?: NewPeriod[] };
  photos?: { name: string }[];
};

async function placesFetch<T>(path: string, init: RequestInit & { fieldMask?: string } = {}): Promise<T | null> {
  const { fieldMask, headers, ...rest } = init;
  try {
    const res = await fetch(`${PLACES_API_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": PLACES_API_KEY,
        ...(fieldMask ? { "X-Goog-FieldMask": fieldMask } : {}),
        ...headers,
      },
    });
    const json = await res.json();
    if (!res.ok) {
      console.warn(`Google Places ${path} failed: ${json?.error?.message ?? res.status}`);
      return null;
    }
    return json as T;
  } catch (e) {
    console.warn(`Google Places ${path} failed:`, e);
    return null;
  }
}

export async function autocompletePlaces(input: string): Promise<PlacePrediction[]> {
  const json = await placesFetch<{ suggestions?: { placePrediction?: any }[] }>("/v1/places:autocomplete", {
    method: "POST",
    body: JSON.stringify({ input, languageCode: "en" }),
  });
  return (json?.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .map((p) => ({
      place_id: p.placeId,
      description: p.text?.text ?? "",
      structured_formatting: {
        main_text: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondary_text: p.structuredFormat?.secondaryText?.text,
      },
    }));
}

export function getPlaceDetails(placeId: string, fields: string[]): Promise<PlaceDetails | null> {
  return placesFetch<PlaceDetails>(`/v1/places/${placeId}`, { fieldMask: fields.join(",") });
}

export async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  fields: string[],
): Promise<PlaceDetails[]> {
  const json = await placesFetch<{ places?: PlaceDetails[] }>("/v1/places:searchNearby", {
    method: "POST",
    fieldMask: fields.map((f) => `places.${f}`).join(","),
    body: JSON.stringify({
      maxResultCount: 1,
      rankPreference: "DISTANCE",
      locationRestriction: { circle: { center: { latitude, longitude }, radius: 500 } },
    }),
  });
  return json?.places ?? [];
}

// `photoName` is a photo's `name` from Place Details, e.g. "places/ID/photos/REF"
export const buildPlacePhotoUrl = (photoName: string) =>
  `${PLACES_API_URL}/v1/${photoName}/media?maxWidthPx=800&key=${PLACES_API_KEY}`;

const toHHMM = (p?: NewPeriodPoint) =>
  p ? `${String(p.hour).padStart(2, "0")}${String(p.minute).padStart(2, "0")}` : undefined;

// Convert Places (New) periods to the stored "HHMM" OpeningHours format, sorted by day
export function formatOpeningHours(periods?: NewPeriod[]): OpeningHours[] {
  const legacy: GooglePeriod[] = (periods ?? []).map((p) => ({
    open: p.open && { day: p.open.day, time: toHHMM(p.open)! },
    close: p.close && { day: p.close.day, time: toHHMM(p.close)! },
  }));
  return legacy
    .map((h) => ({ day: h.close?.day, open: h.open?.time, close: h.close?.time }))
    .sort((a, b) => (a.day ?? 0) - (b.day ?? 0));
}
