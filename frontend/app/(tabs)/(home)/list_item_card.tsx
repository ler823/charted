import { Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  listId: string;
  name?: string;
  user?: string | null;
};

export default function ListItemsCard({ listId, name, user=null }: Props) {
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

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
        {user != null && (
          <Text style={styles.cardLoc} numberOfLines={1} ellipsizeMode="tail">
            Shared by {user}
          </Text>
        )}
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
});
