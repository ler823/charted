import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

// Base URL of the photo API (API Gateway from backend/charted-backend)
export const PHOTO_API_URL = process.env.EXPO_PUBLIC_PHOTO_API_URL!;

export async function getPhotoUrl(keys: string[]) {
  // Retry a few times, but don't spin forever if the endpoint is down
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(
        `${PHOTO_API_URL}/downloadphotourl`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys }),
        },
      );
      const { urls } = await res.json();
      if (urls !== undefined) {
        return urls;
      }
      console.error(`getPhotoUrl failed (HTTP ${res.status})`);
    } catch (e) {
      console.error("getPhotoUrl failed:", e);
    }
  }
  return [];
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
