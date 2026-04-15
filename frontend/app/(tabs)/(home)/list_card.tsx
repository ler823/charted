import { Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  pinId: string;
  name?: string;
  loc?: string;
  editList?: boolean;
  userIds?: number[];
};

type FriendAvatar = {
  user_id: number;
  username: string;
  avatarUrl?: string | null;
};

export default function ListCard({ pinId, name, loc, editList, userIds }: Props) {
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [friendAvatars, setFriendAvatars] = useState<FriendAvatar[]>([]);

  useEffect(() => {
    async function fetchFriendAvatars() {
      if (!userIds?.length) {
        setFriendAvatars([]);
        return;
      }

      if (userIds.length === 1 && userIds[0] === 4) {
        setFriendAvatars([]);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("user_id, username, photos:photo_id(key)")
        .in("user_id", userIds)
        .limit(3);

      if (!data) return;

      const enriched = await Promise.all(
        data.map(async (user) => {
          const key = user.photos?.key;

          let avatarUrl = null;
          if (key) {
            const urls = await getPhotoUrl([key]);
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
    if (!pinId) return;

    async function fetchCoverPhoto() {
      const { data } = await supabase
        .from("pins")
        .select("pin_photos(photos(key), cover)")
        .eq("pin_id", pinId)
        .single();

      if (!data?.pin_photos?.length) return;

      const coverEntry = data.pin_photos.find((p: any) => p.cover);
      const key = coverEntry?.photos?.key;
      if (!key) return;

      const urls = await getPhotoUrl([key]);
      if (urls?.[0]?.url) setCoverPhoto(urls[0].url);
    }

    fetchCoverPhoto();
  }, [pinId]);

  return (
    <View style={(editList != null) ? styles.editListCard : styles.card}>
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
          {name || "Unnamed Pin"}
        </Text>
        <View style={styles.addressRow}>
          <Text
            style={styles.cardLoc}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {loc || "No address available"}
          </Text>

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
  editListCard: {
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
});
