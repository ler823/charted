import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

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

function getUserColor(
  userId: string | number,
  authuser: number | undefined,
): string {
  const str = String(userId);

  if (str === String(authuser)) {
    return Colors.light.accent;
  }

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
 * Matched the pin that looks like the one on Figma design
 * Custom pin-marker with customizable style just like the Figma design
 */
export default function SharedPinMarkers({
  users_id,
  number_shared,
}: PinMarkerProps) {
  const [friend, setFriend] = useState<number[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    if (users_id?.length) {
      setFriend(users_id);
    }
  }, [users_id]);

  const userColors = friend.map((id) => getUserColor(id, profile?.user_id));

  if (users_id.length === 2) {
    return (
      <View style={styles.wrapper}>
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
        <View style={styles.stem} />
        <View style={{ height: 62 }} />
      </View>
    );
  } else if (users_id.length === 3) {
    const size = 42;
    const r = size / 2;
    const cx = r;
    const cy = r;

    return (
      <View style={styles.wrapper}>
        <View style={{ width: size, height: size }}>
          <Svg
            width={size}
            height={size}
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

        <View style={styles.stem} />
        <View style={{ height: 62 }} />
      </View>
    );
  } else {
    return (
      <View style={styles.wrapper}>
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
          <View style={styles.quarterAvatar}>
            <Text style={styles.avatarInitial}>{number_shared}</Text>
          </View>
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
        <View style={styles.stem} />
        <View style={{ height: 62 }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pinRow: {
    flexDirection: "row",
    width: 42,
    height: 42,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pinQuarterRow: {
    flexDirection: "row",
    width: 21,
    height: 21,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  outer: {
    width: 42,
    height: 42,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  leftHalf: {
    width: 21,
    height: 42,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rightHalf: {
    width: 21,
    height: 42,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  leftTop: {
    width: 21,
    height: 21,
    borderTopLeftRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rightTop: {
    width: 21,
    height: 21,
    borderTopRightRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  leftBottom: {
    width: 21,
    height: 21,
    borderBottomLeftRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rightBottom: {
    width: 21,
    height: 21,
    borderBottomRightRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  slice: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
  },
  half: {
    position: "absolute",
    width: 21,
    height: 42,
    right: 0,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#fefbea",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 6,
    left: 6,
    zIndex: 22,
  },
  quarterAvatar: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#fefbea",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 6,
    zIndex: 22,
  },
  stem: {
    width: 4,
    height: 20,
    backgroundColor: "#111",
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  avatarInitial: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: "#000",
    paddingBottom: 5,
  },
});
