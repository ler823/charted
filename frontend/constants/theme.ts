/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const palette = {
  green900: "#162722",
  green700: "#243e36",
  green400: "#7ca982",
  green100: "#dee9e0",
  error: "#852221",
};

export const Colors = {
  light: {
    text: palette.green900,
    background: palette.green700,
    accent: palette.green400,
    accentLight: palette.green100,
    error: palette.error,
  },
  dark: {},
};

export const Fonts = {
  extralight: "Inter_200ExtraLight",
  regular: "Inter_400Regular",
  bold: "Inter_700Bold",
  regular_i: "Inter_400Regular_Italic",
  bold_i: "Inter_700Bold_Italic",
};
