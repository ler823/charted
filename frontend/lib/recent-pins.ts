import Storage from "expo-sqlite/kv-store";

// Pins the user recently opened from search, most recent first (stores Pin.id)
const RECENT_PINS_KEY = "recentPinIds";
const MAX_RECENT_PINS = 10;

export function getRecentPinIds(): string[] {
  try {
    return JSON.parse(Storage.getItemSync(RECENT_PINS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addRecentPin(id: string): string[] {
  const ids = [id, ...getRecentPinIds().filter((x) => x !== id)].slice(0, MAX_RECENT_PINS);
  Storage.setItemSync(RECENT_PINS_KEY, JSON.stringify(ids));
  return ids;
}
