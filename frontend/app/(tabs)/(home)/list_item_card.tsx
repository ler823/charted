import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  listId: string;
  name?: string;
  user?: string | null;
  userIds?: number[];
};

type FriendAvatar = {
  user_id: number;
  username: string;
  avatarUrl?: string | null;
};

export default function ListItemsCard({ listId, name, user = null, userIds }: Props) {
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [friendAvatars, setFriendAvatars] = useState<FriendAvatar[]>([]);
  const [extraCount, setExtraCount] = useState(0);
  const { profile } = useAuth();

  useEffect(() => {
    async function fetchFriendAvatars() {
      if (!userIds?.length) {
        setFriendAvatars([]);
        return;
      }

      if (userIds.length === 1 && userIds[0] === profile?.user_id) {
        setFriendAvatars([]);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_key")
        .in("user_id", userIds)
        .limit(3);

      if (!data) return;

      const limitedData = data.slice(0, 3);
      setExtraCount(Math.max(0, userIds.length - limitedData.length));

      const enriched = await Promise.all(
        limitedData.map(async (user) => {
          let avatarUrl = null;
          if (user.avatar_key) {
            const urls = await getPhotoUrl([user.avatar_key]);
            avatarUrl = urls?.[0]?.url ?? null;
          }
          return { ...user, avatarUrl };
        })
      );

      setFriendAvatars(enriched);
    }

    fetchFriendAvatars();
  }, [userIds]);

  useEffect(() => {
    setCoverPhoto(null);
    if (!listId) return;

    async function fetchCoverPhoto() {
      const { data } = await supabase
        .from("lists")
        .select("photos(key)")
        .eq("list_id", listId)
        .single();

      const key = data?.photos?.key;
      if (!key) return;

      const urls = await getPhotoUrl([key]);
      if (urls?.[0]?.url) setCoverPhoto(urls[0].url);
    }

    fetchCoverPhoto();
  }, [listId]);

  return (
    <View style={styles.card}>
      <Image
        source={
          coverPhoto
            ? { uri: coverPhoto }
            : require("@/assets/images/no_image_default.png")
        }
        style={styles.img}
        contentFit="cover"
        transition={300}
        placeholder="blur"
      />
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
          {name || "Unnamed List"}
        </Text>
        <View style={styles.addressRow}>
          {user != null && (
            <Text style={styles.cardLoc} numberOfLines={1} ellipsizeMode="tail">
              Shared by {user}
            </Text>
          )}
          {friendAvatars.length > 0 && (
            <View style={styles.friendsRow}>
              {friendAvatars.map((friend) => (
                <View key={friend.user_id} style={styles.friendAvatar}>
                  {friend.avatarUrl ? (
                    <Image
                      source={{ uri: friend.avatarUrl }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                  ) : (
                    <Text style={styles.friendInitial}>
                      {friend.username?.[0]?.toUpperCase()}
                    </Text>
                  )}
                </View>
              ))}
              {extraCount > 0 && (
                <View style={styles.moreAvatar}>
                  <Text style={styles.moreText}>+{extraCount}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    width: 65,
    height: 65,
    resizeMode: "cover",
    aspectRatio: 1,
    borderRadius: 9,
  },

  card: {
    backgroundColor: "#DEE9E0",
    padding: 12,
    margin: 5,
    borderRadius: 5,
    height: 80,
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },

  textContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },

  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    paddingBottom: 1,
    flexShrink: 1,
  },

  cardLoc: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    flexShrink: 1,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  friendsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  friendAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#d8d8d8",
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginLeft: -6,
  },
  friendInitial: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: "#000",
  },
  moreAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#7CA982",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -6,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  moreText: {
    fontSize: 9,
    color: "#fefbea",
    fontFamily: Fonts.bold,
  },
});
