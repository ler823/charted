import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
interface PinMarkerProps {
  color?: string;
}

/**
 * Matched the pin that looks like the one on Figma design
 * Custom pin-marker with customizable style just like the Figma design
 */
export default function PinMarker({
  color = Colors.light.accent,
}: PinMarkerProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.outer, { backgroundColor: color }]}>
        <View style={styles.middle}>
          <View style={styles.inner} />
        </View>
      </View>
      <View style={styles.stem} />
    </View>
  );
}

/**
 * Not sure if the sizing is right.
 * NOTE: Pin looks bigger on actual Expo app
 */
const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  outer: {
    width: 46,
    height: 46,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: {
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: "#DEE9E0",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: 14,
    height: 14,
    borderRadius: 10,
    backgroundColor: "#243E36",
  },
  stem: {
    width: 5,
    height: 24,
    backgroundColor: "#111",
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
