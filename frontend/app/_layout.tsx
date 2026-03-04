import { DroppingPinProvider } from "@/context/DroppingPinContext";
import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <DroppingPinProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </DroppingPinProvider>
  );
}
