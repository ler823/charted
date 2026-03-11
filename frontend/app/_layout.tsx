import { DroppingPinProvider } from "@/context/DroppingPinContext";
import {
  Raleway_200ExtraLight,
  Raleway_400Regular,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import { useFonts } from "expo-font";
import * as Location from "expo-location";
import { Stack, router } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Raleway_200ExtraLight,
    Raleway_400Regular,
    Raleway_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      redirectBasedOnPermission();
    }
  }, [fontsLoaded]); // wait for fonts before redirecting

  // Location services logic (redirect to Enable Location screen if permission undetermined)
  const redirectBasedOnPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status === Location.PermissionStatus.UNDETERMINED) {
      // First time — show primer screen
      router.replace("/onboarding/enable-location");
    } else {
      // Already granted or denied — skip onboarding
      router.replace("/(tabs)/(home)");
    }
  };

  if (!fontsLoaded) {
    return null; // your splash/loading screen goes here
  }

  return (
    <DroppingPinProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding/enable-location"
          options={{ headerShown: false }}
        />
      </Stack>
    </DroppingPinProvider>
  );
}
