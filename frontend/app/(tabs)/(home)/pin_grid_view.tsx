import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  pins: Pin[];
  emptyMessage?: string;
};

type FriendAvatar = {
  user_id: number;
  username: string;
  avatarUrl?: string | null;
};

const screenWidth = Dimensions.get("window").width;

function GridCard({ item }: { item: Pin }) {
  const { profile } = useAuth();
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [friendAvatars, setFriendAvatars] = useState<FriendAvatar[]>([]);
  const [extraCount, setExtraCount] = useState(0);

  useEffect(() => {
    async function fetchFriendAvatars() {
      if (!item.userIds?.length) {
        setFriendAvatars([]);
        return;
      }

      if (item.userIds.length === 1 && item.userIds[0] === profile?.user_id) {
        setFriendAvatars([]);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_key")
        .in("user_id", item.userIds)
        .limit(3);

      if (error || !data) return;

      const limitedData = data.slice(0, 3);
      setExtraCount(Math.max(0, item.userIds.length - limitedData.length));

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
          onPress={() => {
            const pinId = item.pinIds?.[0];
            if (!pinId) return;

            if (item.isShared) {
              router.push({
                pathname: "/select-pins/[selectid]",
                params: {
                  selectid: JSON.stringify(item.pinIds),
                },
              });
            } else {
              router.push({
                pathname: "/pins/[pinid]",
                params: {
                  pinid: String(pinId),
                },
              });
            }
          }}
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
                {extraCount > 0 && (
                  <View style={styles.moreAvatar}>
                    <Text style={styles.moreText}>+{extraCount}</Text>
                  </View>
                )}
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

export default function PinGridView({ pins, emptyMessage = "No pins to display yet." }: Props) {
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
          <Text style={styles.emptyText}>{emptyMessage}</Text>
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
    width: screenWidth - 10
  },

  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 30,
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
