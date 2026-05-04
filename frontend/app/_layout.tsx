import Toast from "@/components/toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DroppingPinProvider } from "@/context/DroppingPinContext";
import { FilterProvider } from "@/context/FilterContext";
import { ToastProvider } from "@/context/ToastContext";
import {
  Raleway_200ExtraLight,
  Raleway_400Regular,
  Raleway_400Regular_Italic,
  Raleway_700Bold,
  Raleway_700Bold_Italic,
} from "@expo-google-fonts/raleway";
import { useFonts } from "expo-font";
import * as Location from "expo-location";
import { Stack, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";

SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const { session, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const [fontsLoaded] = useFonts({
    Raleway_200ExtraLight,
    Raleway_400Regular,
    Raleway_700Bold,
    Raleway_400Regular_Italic,
    Raleway_700Bold_Italic,
  });

  useEffect(() => {
    if (!fontsLoaded || authLoading) return;

    // Don't auto-route while the user is in the middle of resetting their password
    if (pathname.includes("forgot-password")) return;

    if (!session) {
      SplashScreen.hideAsync().then(() => {
        router.replace("/(auth)/login");
      });
      return;
    }

    Location.getForegroundPermissionsAsync().then(({ status }) => {
      SplashScreen.hideAsync().then(() => {
        if (status === Location.PermissionStatus.UNDETERMINED) {
          router.replace("/onboarding/enable-location");
        } else {
          router.replace("/(tabs)/(home)");
        }
      });
    });
  }, [fontsLoaded, authLoading, session]);

  return (
    <DroppingPinProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="(tabs)"
          options={{ animation: "slide_from_left" }}
        />
        <Stack.Screen
          name="onboarding/enable-location"
          options={{ animation: "none" }}
        />
        <Stack.Screen name="make-pin" />
        <Stack.Screen name="pins" />
      </Stack>
    </DroppingPinProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FilterProvider>
        <ToastProvider>
          <StatusBar barStyle="default" />
          <AppNavigator />
          <Toast />
        </ToastProvider>
      </FilterProvider>
    </AuthProvider>
  );
}
