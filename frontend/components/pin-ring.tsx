import React, { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface PinRingProps {
  size: number;
  color: string;
  borderWidth?: number;
  children?: React.ReactNode;
}

/**
 * Circular "shiny" gradient ring used to frame map pin avatars.
 * Renders children centered inside the ring.
 */
export default function PinRing({
  size,
  color,
  borderWidth = 3,
  children,
}: PinRingProps) {
  const gradientId = `pinRing-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const r = size / 2;
  const strokeR = r - borderWidth / 2;

  return (
    <View
      style={[
        styles.shadowWrap,
        { width: size, height: size, borderRadius: r },
      ]}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="20%" y1="0%" x2="80%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity={1} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.85} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={r}
          cy={r}
          r={strokeR}
          stroke={`url(#${gradientId})`}
          strokeWidth={borderWidth}
          fill="none"
        />
      </Svg>
      <View style={[styles.content, { width: size, height: size }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
});
