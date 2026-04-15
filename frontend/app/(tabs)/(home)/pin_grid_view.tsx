import { Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  pins: Pin[];
};

type FriendAvatar = {
  user_id: number;
  username: string;
  avatarUrl?: string | null;
};

function GridCard({ item }: { item: Pin }) {
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [friendAvatars, setFriendAvatars] = useState<FriendAvatar[]>([]);

  useEffect(() => {
    async function fetchFriendAvatars() {
      if (!item.userIds?.length) {
        setFriendAvatars([]);
        return;
      }

      if (item.userIds.length === 1 && item.userIds[0] === 4) {
        setFriendAvatars([]);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("user_id, username, photos:photo_id(key)")
        .in("user_id", item.userIds)
        .limit(5);

      if (error || !data) return;

      const enriched = await Promise.all(
        data.map(async (user) => {
          const key = user.photos?.key;

          let avatarUrl = null;
          if (key) {
            const urls = await getPhotoUrl([key]);
            avatarUrl = urls?.[0]?.url ?? null;
          }

          return {
            ...user,
            avatarUrl,
          };
        })
      );

      setFriendAvatars(enriched);
    }

    fetchFriendAvatars();
  }, [item.userIds]);

  useEffect(() => {
    setCoverPhoto(null);
    if (!item.pinIds?.[0]) return;

    async function fetchCoverPhoto() {
      const { data } = await supabase
        .from("pins")
        .select("pin_photos(photos(key), cover)")
        .eq("pin_id", String(item.pinIds?.[0]))
        .single();

      if (!data?.pin_photos?.length) return;

      const coverEntry = data.pin_photos.find((p: any) => p.cover);
      const key = coverEntry?.photos?.key;
      if (!key) return;

      const urls = await getPhotoUrl([key]);
      if (urls?.[0]?.url) setCoverPhoto(urls[0].url);
    }

    fetchCoverPhoto();
  }, [item.pinIds?.[0]]);

  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.card}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/pins/[pinid]",
              params: { pinid: String(item.pinIds?.[0]) },
            })
          }
        >
          <View style={[styles.imgPlaceholder, { position: "relative" }]}>
            <Image
              source={
                coverPhoto
                  ? { uri: coverPhoto }
                  : require("@/assets/images/no_image_default.png")
              }
              style={styles.image}
              contentFit="cover"
              transition={300}
              placeholder="blur"
            />
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

          <View style={styles.textContainer}>
            <Text
              style={styles.cardTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name || "Unnamed Pin"}
            </Text>
            <Text style={styles.cardLoc} numberOfLines={1} ellipsizeMode="tail">
              {item.address || "No address available"}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export default function PinGridView({ pins }: Props) {
  return (
    <FlatList
      data={pins}
      keyExtractor={(item) => String(item.pinIds?.[0])}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <GridCard item={item} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pins to display yet.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 170,
    paddingBottom: 95,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 5,
  },

  friendsRow: {
    position: "absolute",
    bottom: 5,
    right: 5,
    flexDirection: "row",
    alignItems: "center",
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

  shadowWrapper: {
    width: "48%",
    shadowColor: "#000",
    marginHorizontal: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  card: {
    backgroundColor: "#DEE9E0",
    borderRadius: 12,
    overflow: "hidden",
  },

  imgPlaceholder: {
    width: "100%",
    height: 110,
    backgroundColor: "#cfd8d1",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  textContainer: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
  },

  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    marginBottom: 2,
    color: "#000",
  },

  cardLoc: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#000",
  },

  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
  },

  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#243e36",
  },
});
