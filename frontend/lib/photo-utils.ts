import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

// Base URL of the photo API (API Gateway from backend/charted-backend)
export const PHOTO_API_URL = process.env.EXPO_PUBLIC_PHOTO_API_URL!;

type SignedUrl = { key: string; url: string; changed: boolean };

// Signed URLs expire after 60s (see download_photo_url), so reuse them briefly
const URL_CACHE_MS = 30_000;
const BATCH_WINDOW_MS = 15;
const MAX_KEYS_PER_REQUEST = 100;

const urlCache = new Map<string, { entry: SignedUrl; expires: number }>();
let pendingKeys = new Set<string>();
let pendingWaiters: (() => void)[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function requestSignedUrls(keys: string[]): Promise<SignedUrl[]> {
  // Retry a few times, but don't spin forever if the endpoint is down
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${PHOTO_API_URL}/downloadphotourl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
      const { urls } = await res.json();
      if (urls !== undefined) {
        return urls;
      }
      console.warn(`getPhotoUrl attempt ${attempt + 1} failed (HTTP ${res.status})`);
    } catch (e) {
      console.warn(`getPhotoUrl attempt ${attempt + 1} failed:`, e);
    }
    // Back off before retrying (a 503 usually means Lambda is throttled)
    if (attempt < 2) await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
  }
  console.error(`getPhotoUrl gave up after 3 attempts (${keys.length} keys)`);
  return [];
}

async function flush() {
  const keys = [...pendingKeys];
  const waiters = pendingWaiters;
  pendingKeys = new Set();
  pendingWaiters = [];
  flushTimer = null;

  for (let i = 0; i < keys.length; i += MAX_KEYS_PER_REQUEST) {
    const urls = await requestSignedUrls(keys.slice(i, i + MAX_KEYS_PER_REQUEST));
    const expires = Date.now() + URL_CACHE_MS;
    for (const entry of urls) urlCache.set(entry.key, { entry, expires });
  }
  waiters.forEach((resolve) => resolve());
}

// Calls made within a short window are merged into one request, so a screen
// rendering many avatars/markers doesn't hit Lambda's concurrency limit
export async function getPhotoUrl(keys: string[]): Promise<SignedUrl[]> {
  const now = Date.now();
  const missing = keys.filter((k) => {
    const cached = urlCache.get(k);
    return !cached || cached.expires <= now;
  });

  if (missing.length > 0) {
    missing.forEach((k) => pendingKeys.add(k));
    await new Promise<void>((resolve) => {
      pendingWaiters.push(resolve);
      if (!flushTimer) flushTimer = setTimeout(flush, BATCH_WINDOW_MS);
    });
  }

  return keys
    .map((k) => urlCache.get(k)?.entry)
    .filter((e): e is SignedUrl => !!e);
}

// Fetch signed URLs for many keys in one request; returns key -> url
export async function getPhotoUrlMap(
  keys: (string | null | undefined)[],
): Promise<Record<string, string>> {
  const unique = [...new Set(keys.filter((k): k is string => !!k))];
  if (unique.length === 0) return {};
  const urls = await getPhotoUrl(unique);
  const map: Record<string, string> = {};
  for (const u of urls) map[u.key] = u.url;
  return map;
}

export async function processImage(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result;
}

export async function pickImageAsync() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 1,
  });
  if (!result.canceled) return result;
}

export async function uploadImageToS3(
  photoUrl: string,
): Promise<string | null> {
  // returns the S3 key, or null on failure
  const imageFile = await fetch(photoUrl);
  const imageFileBlob = await imageFile.blob();

  const res = await fetch(
    `${PHOTO_API_URL}/uploadphotourl`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "image/jpeg" }),
    },
  );
  const { uploadUrl, key } = await res.json();

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: imageFileBlob,
  });

  if (!response.ok) return null;
  return key;
}

export async function deleteImageFromS3(key: string) {
  const res = await fetch(
    `${PHOTO_API_URL}/deletephotourl`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    },
  );
  const { url } = await res.json();
  if (!url) return;
  await fetch(url, { method: "DELETE" });
}
