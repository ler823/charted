import { DroppingPinProvider } from "@/context/DroppingPinContext";
import {
  Raleway_200ExtraLight,
  Raleway_400Regular,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import { useFonts } from "expo-font";
import * as Location from "expo-location";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Hold the splash screen until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Raleway_200ExtraLight,
    Raleway_400Regular,
    Raleway_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    Location.getForegroundPermissionsAsync().then(({ status }) => {
      // Hide splash screen first, THEN navigate — no animation occurs
      SplashScreen.hideAsync().then(() => {
        if (status === Location.PermissionStatus.UNDETERMINED) {
          router.replace("/onboarding/enable-location");
        } else {
          router.replace("/(tabs)/(home)");
        }
      });
    });
  }, [fontsLoaded]);

  return (
    <DroppingPinProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{animation: "slide_from_left"}}/>
        <Stack.Screen name="onboarding/enable-location" options={{animation: "none"}}/>
        <Stack.Screen name="make-pin" />
      </Stack>
    </DroppingPinProvider>
  );
}
