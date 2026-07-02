import { Colors, Fonts } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import PinRing from "./pin-ring";

interface PinMarkerProps {
  users_id: number[];
  number_shared: number;
}

{
  /* Old colors:
  const COLORS = [
        "#d47eaa",
        "#8c4067",
        "#d54c4c",
        "#7f2020",
        "#ec9055",
        "#aa5823",
        "#d3c777",
        "#b19e24",
        "#3c6844",
        "#7ed4d1",
        "#2c716f",
        "#b87ed4",
        "#6a3a81",
        "#8c694f",
        "#5a3a23"
    ]
 */
}

const COLORS = [
  "#d47eaa",
  "#8c4067",
  "#d54c4c",
  "#ec9055",
  "#b19e24",
  "#3c6844",
  "#7ed4d1",
  "#2c716f",
  "#b87ed4",
];

const SIZE = 32;
const SHINE_WIDTH = 2;
const AVATAR_SIZE = 22;
const AVATAR_OFFSET = (SIZE - AVATAR_SIZE) / 2;

function getUserColor(userId: string | number): string {
  const str = String(userId);

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function createSlicePath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const rad = (deg: number) => (deg * Math.PI) / 180;

  const x1 = cx + r * Math.cos(rad(startAngle));
  const y1 = cy + r * Math.sin(rad(startAngle));

  const x2 = cx + r * Math.cos(rad(endAngle));
  const y2 = cy + r * Math.sin(rad(endAngle));

  return `
    M ${cx} ${cy}
    L ${x1} ${y1}
    A ${r} ${r} 0 0 1 ${x2} ${y2}
    Z
  `;
}

/**
 * Marker for a shared location pin: a small shiny-ringed circle
 * split between the sharing users' colors, with a shared count badge.
 */
export default function SharedPinMarkers({
  users_id,
  number_shared,
}: PinMarkerProps) {
  const [friend, setFriend] = useState<number[]>([]);

  useEffect(() => {
    if (users_id?.length) {
      setFriend(users_id);
    }
  }, [users_id]);

  const userColors = friend.map((id) => getUserColor(id));

  let content: React.ReactNode;

  if (users_id.length === 2) {
    content = (
      <View style={styles.pinRow}>
        <View
          style={[
            styles.leftHalf,
            { backgroundColor: userColors[0] ?? Colors.light.accent },
          ]}
        />
        <View
          style={[
            styles.rightHalf,
            { backgroundColor: userColors[1] ?? Colors.light.accent },
          ]}
        />
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{number_shared}</Text>
        </View>
      </View>
    );
  } else if (users_id.length === 3) {
    const r = SIZE / 2;
    const cx = r;
    const cy = r;

    content = (
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg
          width={SIZE}
          height={SIZE}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Path
            d={createSlicePath(cx, cy, r, 0, 120)}
            fill={userColors[0] ?? Colors.light.accent}
          />
          <Path
            d={createSlicePath(cx, cy, r, 120, 240)}
            fill={userColors[1] ?? Colors.light.accent}
          />
          <Path
            d={createSlicePath(cx, cy, r, 240, 360)}
            fill={userColors[2] ?? Colors.light.accent}
          />
        </Svg>

        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{number_shared}</Text>
        </View>
      </View>
    );
  } else {
    content = (
      <View>
        <View style={styles.pinQuarterRow}>
          <View
            style={[
              styles.leftTop,
              { backgroundColor: userColors[0] ?? Colors.light.accent },
            ]}
          />
          <View
            style={[
              styles.rightTop,
              { backgroundColor: userColors[1] ?? Colors.light.accent },
            ]}
          />
        </View>
        <View style={styles.pinQuarterRow}>
          <View
            style={[
              styles.leftBottom,
              { backgroundColor: userColors[2] ?? Colors.light.accent },
            ]}
          />
          <View
            style={[
              styles.rightBottom,
              { backgroundColor: userColors[3] ?? Colors.light.accent },
            ]}
          />
        </View>
        <View style={styles.quarterAvatar}>
          <Text style={styles.avatarInitial}>{number_shared}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <PinRing size={SIZE} color="#ffffff" borderWidth={SHINE_WIDTH}>
        <View style={styles.clip}>{content}</View>
      </PinRing>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  clip: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: "hidden",
  },
  pinRow: {
    flexDirection: "row",
    width: SIZE,
    height: SIZE,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pinQuarterRow: {
    flexDirection: "row",
    width: SIZE,
    height: SIZE / 2,
  },
  leftHalf: {
    width: SIZE / 2,
    height: SIZE,
  },
  rightHalf: {
    width: SIZE / 2,
    height: SIZE,
  },
  leftTop: {
    width: SIZE / 2,
    height: SIZE / 2,
  },
  rightTop: {
    width: SIZE / 2,
    height: SIZE / 2,
  },
  leftBottom: {
    width: SIZE / 2,
    height: SIZE / 2,
  },
  rightBottom: {
    width: SIZE / 2,
    height: SIZE / 2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#fefbea",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: AVATAR_OFFSET,
    left: AVATAR_OFFSET,
    zIndex: 22,
  },
  quarterAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#fefbea",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: AVATAR_OFFSET,
    left: AVATAR_OFFSET,
    zIndex: 22,
  },
  avatarInitial: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: "#000",
  },
});
