import { supabase } from "@/lib/supabase";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  console.log("[Push] isDevice:", Device.isDevice);
  if (!Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#243e36",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  console.log("[Push] existing permission status:", existing);
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log("[Push] requested permission, new status:", status);
  }
  if (finalStatus !== "granted") {
    console.log("[Push] permission not granted, aborting");
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.easConfig as any)?.projectId ??
    "0c133d59-d112-481f-a33d-4031d0dcefc0";
  console.log("[Push] projectId:", projectId);

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    console.log("[Push] token:", tokenResponse.data);
    return tokenResponse.data;
  } catch (e) {
    console.log("[Push] getExpoPushTokenAsync error:", e);
    return null;
  }
}

export async function saveExpoPushToken(userId: string, token: string) {
  await supabase
    .from("profiles")
    .update({ expo_push_token: token })
    .eq("id", userId);
}

export async function sendPushNotification(
  recipientUserId: string,
  title: string,
  body: string
) {
  const { data } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("id", recipientUserId)
    .single();

  const token = data?.expo_push_token;
  if (!token) return;

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title,
        body,
      }),
    });
  } catch {
    // Best-effort; swallow errors so user flow isn't blocked.
  }
}
