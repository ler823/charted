import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

export async function getPhotoUrl(keys: string[]) {
  const res = await fetch(
    "https://4nm4iifq65.execute-api.us-east-2.amazonaws.com/downloadphotourl",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }),
    },
  );
  const { urls } = await res.json();
  return urls;
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
    "https://4nm4iifq65.execute-api.us-east-2.amazonaws.com/uploadphotourl",
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
    "https://4nm4iifq65.execute-api.us-east-2.amazonaws.com/deletephotourl",
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
