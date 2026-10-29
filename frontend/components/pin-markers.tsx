import { Colors, Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PinSkeleton from "./pin-marker-skeleton";
import PinRing from "./pin-ring";
interface PinMarkerProps {
  color?: string;
  users_id: number;
  size?: number;
  // Called once the marker has finished rendering its avatar (or has none)
  onReady?: () => void;
}


type Friend = {
  user_id: number | null;
  username: string;
  avatar_key: string | null;
};

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
    ]

function getUserColor(userId: string | number): string {
  const str = String(userId);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return COLORS[Math.abs(hash) % COLORS.length];
}

const RING_WIDTH = 3;

/**
 * Marker for a friend's pins: a small shiny-ringed circle with
 * the friend's avatar (or initial) in the middle.
 */
export default function PinMarkers({
  color = Colors.light.accent,
  users_id,
  size = 32,
  onReady,
}: PinMarkerProps) {
    const [friend, setFriend] = useState<Friend | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
          if (!users_id) {
            setLoading(false);
            onReady?.();
            return;
          }
          async function fetchUsers() {
            const { data, error } = await supabase
              .from("profiles")
              .select("user_id, username, avatar_key")
              .eq("user_id", Number(users_id))
              .single();
            if (error) {
              console.error("Failed to fetch user profile:", error.message);
              setLoading(false);
              onReady?.();
              return;
            }
            let url: string | null = null;
            if (data?.avatar_key) {
              const urls = await getPhotoUrl([data.avatar_key]);
              url = urls[0]?.url ?? null;
              setAvatarUrl(url);
            }
            setFriend(data);
            setLoading(false);
            if (!url) onReady?.();
          }
          fetchUsers();
        }, [users_id]);

    const user_color = friend?.user_id
        ? getUserColor(String(friend.user_id))
        : color;

  if (loading) return <PinSkeleton size={size} />;

  const innerSize = size - RING_WIDTH * 2;

  return (
    <View style={styles.wrapper}>
      <PinRing size={size} color={user_color} borderWidth={RING_WIDTH}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            }}
            contentFit="cover"
            onLoad={onReady}
            onError={onReady}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
            ]}
          >
            {friend?.username && (
              <Text style={[styles.avatarInitial, { fontSize: innerSize * 0.5 }]}>
                {friend.username[0].toUpperCase()}
              </Text>
            )}
          </View>
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
  avatar: {
    backgroundColor: "#fefbea",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: Fonts.bold,
    color: "#000",
  },
});
