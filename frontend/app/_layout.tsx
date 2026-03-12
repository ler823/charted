import { DroppingPinProvider } from "@/context/DroppingPinContext";
import {
  Raleway_200ExtraLight,
  Raleway_400Regular,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import { useFonts } from "expo-font";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Raleway_200ExtraLight,
    Raleway_400Regular,
    Raleway_700Bold,
  });
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    if (fontsLoaded) {
      Location.getForegroundPermissionsAsync().then(({ status }) => {
        setInitialRoute(
          status === Location.PermissionStatus.UNDETERMINED
            ? "onboarding/enable-location"
            : "(tabs)",
        );
      });
    }
  }, [fontsLoaded]);

  // Hold render until both fonts AND permission status are known
  if (!fontsLoaded || !initialRoute) return null;

  return (
    <DroppingPinProvider>
      <Stack
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: "none" }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/enable-location" />
      </Stack>
    </DroppingPinProvider>
  );
}
