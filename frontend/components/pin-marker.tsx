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
      <View style={{height: 62}}/>
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
    justifyContent: "flex-end",
  },
  outer: {
    width: 42,
    height: 42,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#DEE9E0",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 8,
    backgroundColor: "#243E36",
  },
  stem: {
    width: 4,
    height: 20,
    backgroundColor: "#111",
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
