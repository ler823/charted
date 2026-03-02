import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  Raleway_200ExtraLight,
  Raleway_400Regular,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Raleway_200ExtraLight,
    Raleway_400Regular,
    Raleway_700Bold,
  });

  if (!fontsLoaded) {
    return null; // need to change this to be the splash page or a loading screen so that the app functions while fonts load in
  }
  
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
    </Stack>
  );
}
