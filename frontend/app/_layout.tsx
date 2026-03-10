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

  const redirectBasedOnPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status === Location.PermissionStatus.UNDETERMINED) {
      router.replace("/onboarding/location");
    } else {
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
          name="onboarding/location"
          options={{ headerShown: false }}
        />
      </Stack>
    </DroppingPinProvider>
  );
}
