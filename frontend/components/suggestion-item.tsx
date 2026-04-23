import { Colors, Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils"; // adjust to your path
import { supabase } from "@/lib/supabase"; // adjust to your path
import { Pin } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function SuggestionItem({ item }: { item: Pin }) {
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const pinId = item.pinIds?.[0];

  useEffect(() => {
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
    <Pressable
      style={styles.suggestionItem}
      onPress={() =>
        router.push({
          pathname: "/pins/[pinid]",
          params: { pinid: String(item.pinIds?.[0]) },
        })
      }
    >
      {coverPhoto ? (
        <Image source={{ uri: coverPhoto }} style={styles.suggestionPhoto} />
      ) : (
        <View style={styles.suggestionPhotoPlaceholder}>
          <Ionicons
            name="image-outline"
            size={18}
            color={Colors.light.accent}
          />
        </View>
      )}
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.address ? (
          <Text style={styles.suggestionAddress} numberOfLines={1}>
            {item.address}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.light.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2e4a3e",
  },
  suggestionPhoto: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#243e36",
  },
  suggestionPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#243e36",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontFamily: Fonts.bold,
    color: "#fefbea",
    fontSize: 14,
  },
  suggestionAddress: {
    fontFamily: Fonts.regular ?? Fonts.bold,
    color: Colors.light.accent,
    fontSize: 12,
    marginTop: 1,
  },
});
