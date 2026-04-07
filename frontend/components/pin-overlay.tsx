import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { getPhotoUrl } from "@/app/make-pin";
import { Image } from "expo-image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

type PinOverlayProps = {
  selectedPin: Pin | null;
  setSelectedPin: Dispatch<SetStateAction<Pin | null>>;
};

export default function PinOverlay({
  selectedPin,
  setSelectedPin,
}: PinOverlayProps) {
  const router = useRouter();
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  useEffect(() => {
    setCoverPhoto(null);
    if (!selectedPin?.id) return;

    async function fetchCoverPhoto() {
      const { data } = await supabase
        .from("pins")
        .select("pin_photos(photos(key), cover)")
        .eq("pin_id", selectedPin.id)
        .single();

      if (!data?.pin_photos?.length) return;

      const coverEntry = data.pin_photos.find((p: any) => p.cover);
      const key = coverEntry?.photos?.key;
      if (!key) return;

      const urls = await getPhotoUrl([key]);
      if (urls?.[0]?.url) setCoverPhoto(urls[0].url);
    }

    fetchCoverPhoto();
  }, [selectedPin?.id]);

  return (
    <Pressable style={styles.backdrop} onPress={() => setSelectedPin(null)}>
      <Pressable style={styles.overlayCard} onPress={() => {}}>
        {coverPhoto ? (
          <Image
            source={{ uri: coverPhoto }}
            style={styles.coverImage}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.picturePlaceholder}>
            <Ionicons name="image-outline" size={48} />
          </View>
        )}

        <View style={styles.infoContainer}>
          <View style={styles.infoText}>
            <Text style={styles.pinName}>{selectedPin?.name}</Text>
            <Text style={styles.pinAddress}>{selectedPin?.address}</Text>
          </View>
          <Pressable
            onPress={() => {
              if (!selectedPin?.id) return;
              router.push({
                pathname: "/pins/[pinid]",
                params: { pinid: selectedPin?.id },
              });
            }}
          >
            <Ionicons name="expand-outline" size={20} color="#555" />
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  overlayCard: {
    width: "80%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#111",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  coverImage: {
    width: "100%",
    flex: 1,
  },
  picturePlaceholder: {
    width: "100%",
    flex: 1,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  pinName: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.light.text,
  },
  pinAddress: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#888",
  },
});
