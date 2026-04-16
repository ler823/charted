//import { getPhotoUrl } from "@/app/make-pin";
import { Colors, Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Pin } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type FriendAvatar = {
  user_id: number;
  username: string;
  avatarUrl?: string | null;
};

type PinOverlayProps = {
  selectedPin: Pin | null;
  setSelectedPin: Dispatch<SetStateAction<Pin | null>>;
};

export default function PinOverlay({
  selectedPin,
  setSelectedPin,
}: PinOverlayProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [friendAvatars, setFriendAvatars] = useState<FriendAvatar[]>([]);

  useEffect(() => {
    setCoverPhoto(null);
    if (!selectedPin?.pinIds?.[0]) return;

    async function fetchCoverPhoto() {
      const { data } = await supabase
        .from("pins")
        .select("pin_photos(photos(key), cover)")
        .eq("pin_id", selectedPin?.pinIds?.[0])
        .single();

      if (!data?.pin_photos?.length) return;

      const coverEntry = data.pin_photos.find((p: any) => p.cover);
      const key = coverEntry?.photos?.key;
      if (!key) return;

      const urls = await getPhotoUrl([key]);
      if (urls?.[0]?.url) setCoverPhoto(urls[0].url);
    }

    fetchCoverPhoto();
  }, [selectedPin?.pinIds?.[0]]);

  // fetch some users to preview what the friend circles look like
  // later data implementation needed when auth is set up
  // should fetch profiles based on the user's friends and what pins they share
  useEffect(() => {
    async function fetchFriendAvatars() {
      if (!selectedPin?.userIds?.length) {
        setFriendAvatars([]);
        return;
      }

      if (selectedPin?.userIds?.length === 1 && selectedPin.userIds[0] === profile?.user_id) {
        setFriendAvatars([]);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("user_id, username, photos:photo_id(key)")
        .in("user_id", selectedPin.userIds)
        .limit(10);
      
        if (error) {
          console.log(error.message);
          return;
        }

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
  }, [selectedPin?.userIds]);

  const AVATAR_SIZE = 23;

  return (
    <Pressable style={styles.backdrop} onPress={() => setSelectedPin(null)}>
      <Pressable style={styles.overlayCard} onPress={() => {}}>
        <View style={styles.imageWrapper}>
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

          {friendAvatars.length > 0 && (
            <View style={styles.friendsRow}>
              {friendAvatars.map((friend, index) => (
                <View
                  key={friend.user_id}
                  style={[
                    styles.friendAvatar,
                    {
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                      borderRadius: AVATAR_SIZE / 2,
                    },
                  ]}
                >
                  {friend.avatarUrl ? (
                    <Image
                      source={{ uri: friend.avatarUrl }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      transition={300}
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

        <View style={styles.infoContainer}>
          <View style={styles.infoText}>
            <Text style={styles.pinName}>{selectedPin?.name || "Unnamed Location"}</Text>
            <Text style={styles.pinAddress}>{selectedPin?.address || "No Address Available"}</Text>
          </View>
          <Pressable
            onPress={() => {
              const pinId = selectedPin?.pinIds?.[0];
              if (!pinId) return;
  
              if (selectedPin.isShared) {
                router.push({
                  pathname: "/select-pins/[selectid]",
                  params: {
                    selectid: JSON.stringify(selectedPin.pinIds),
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
  imageWrapper: {
    flex: 1,
    position: "relative",
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
  friendsRow: {
    position: "absolute",
    bottom: 5,
    right: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  friendAvatar: {
    backgroundColor: "#d8d8d8",
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginLeft: -6,
  },
  friendInitial: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#000",
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
