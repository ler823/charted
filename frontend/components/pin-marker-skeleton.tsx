import React from "react";
import { StyleSheet, View } from "react-native";
import PinRing from "./pin-ring";

interface PinSkeletonProps {
  size?: number;
}

const RING_WIDTH = 3;

export default function PinSkeleton({ size = 32 }: PinSkeletonProps) {
  const innerSize = size - RING_WIDTH * 2;

  return (
    <View style={styles.wrapper}>
      <PinRing size={size} color="#b7bcb8" borderWidth={RING_WIDTH}>
        <View
          style={[
            styles.avatar,
            { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
          ]}
        />
      </PinRing>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    backgroundColor: "#ecf1ed",
  },
});
