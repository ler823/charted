import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import LoadingPage from "./loading-page";
import { getPhotoUrl } from "@/lib/photo-utils";
import { Image } from "expo-image";
interface PinMarkerProps {
  color?: string;
  users_id: number;
}


type Friend = {
  user_id: number;
  username: string;
  location: string | null;
  bio: string | null;
  photos: {
    key: string | null;
  }[];
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

/**
 * Matched the pin that looks like the one on Figma design
 * Custom pin-marker with customizable style just like the Figma design
 */
export default function PinMarkers({
  color = Colors.light.accent,
  users_id,
}: PinMarkerProps) {
    const [friend, setFriend] = useState<Friend | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
          async function fetchUsers() {
            const { data, error } = await supabase
              .from("users")
              .select("user_id, username, location, bio, photos:photo_id( key )")
              .eq("user_id", Number(users_id))
              .single();
            if (error) {
                console.error("Failed to fetch users:", error.message);
                return;
              }
            if (data?.photos?.key) {
              const key = data?.photos?.key ?? null;
              if (!key) return;
              const urls = await getPhotoUrl([key]);
              setAvatarUrl(urls[0].url);
            }
            setFriend(data);
            setLoading(false);
          }
          fetchUsers();
        }, []);
    
    const user_color = friend?.user_id
        ? getUserColor(String(friend.user_id))
        : color;

  if (loading) return <LoadingPage />;
  
  return (
    <View style={styles.wrapper}>
      <View style={[styles.outer, { backgroundColor: user_color }]}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            transition={300}
          />
          ) : !friend?.username ? (
              <View style={styles.avatar} />
            ) : friend?.username && (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{friend.username?.[0]?.toUpperCase()}</Text>
              </View>
            )
        }
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
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#fefbea",
    alignItems: "center",
    justifyContent: "center",
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
    },
});
