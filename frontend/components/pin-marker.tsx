import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getPhotoUrl } from "@/lib/photo-utils";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import PinRing from "./pin-ring";

interface PinMarkerProps {
  color?: string;
  size?: number;
}

const RING_WIDTH = 3;

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

// Matches the hash used by AvatarBorder/PinMarkers so a user's
// ring color is consistent between the map and the friends bar.
function getUserColor(userId: string | number): string {
  const str = String(userId);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

/**
 * Marker for the current user's own pins: a small shiny-ringed
 * circle with the user's avatar in the middle.
 */
export default function PinMarker({ color, size = 32 }: PinMarkerProps) {
  const { profile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.avatar_key) {
      setAvatarUrl(null);
      return;
    }
    let cancelled = false;
    async function fetchAvatar() {
      const urls = await getPhotoUrl([profile!.avatar_key!]);
      if (!cancelled) setAvatarUrl(urls[0].url);
    }
    fetchAvatar();
    return () => {
      cancelled = true;
    };
  }, [profile?.avatar_key]);

  const innerSize = size - RING_WIDTH * 2;
  const ringColor =
    color ?? (profile?.user_id ? getUserColor(profile.user_id) : Colors.light.accent);

  return (
    <View style={styles.wrapper}>
      <PinRing size={size} color={ringColor} borderWidth={RING_WIDTH}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            }}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
            ]}
          />
        )}
      </PinRing>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    backgroundColor: "#DEE9E0",
  },
});
