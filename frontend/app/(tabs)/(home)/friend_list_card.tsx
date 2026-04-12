import { Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  userId: string;
  name?: string;
  loc?: string;
  editList?: boolean;
};

export default function FriendListCard({ userId, name, loc, editList }: Props) {
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  useEffect(() => {
    setCoverPhoto(null);
    if (!userId) return;

    async function fetchCoverPhoto() {
      const { data } = await supabase
        .from("users")
        .select("photos(key)")
        .eq("user_id", userId)
        .single();

      const key = data?.photos?.key;
      if (!key) return;

      const urls = await getPhotoUrl([key]);
      if (urls?.[0]?.url) setCoverPhoto(urls[0].url);
    }

    fetchCoverPhoto();
  }, [userId]);

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
        <Text style={styles.cardLoc} numberOfLines={1} ellipsizeMode="tail">
          {loc || "No address available"}
        </Text>
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
    borderRadius: "100%",
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
});
