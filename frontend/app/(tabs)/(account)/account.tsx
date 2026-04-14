import { Stars } from "@/components/light-stars";
import LoadingPage from "@/components/loading-page";
import { Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";

type FavPin = {
  user_id: number;
  pin_id: number;
  user_rating: number;
  name: string;
  last_visited: string | null;
}

type VisPin = {
  user_id: number;
  pin_id: number;
  visit_count: number;
  name: string;
  last_visited: string | null;
}

export default function Account() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(true);
  const [visitLoading, setVisitLoading] = useState(true);
  const loading = userLoading || favLoading || visitLoading;
  const [favorite, setFavorite] = useState<FavPin | null>(null);
  const [favPhoto, setFavPhoto] = useState<string | null>(null);
  const [visited, setVisited] = useState<VisPin | null>(null);
  const [visPhoto, setVisPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("username, avatar_key")
          .eq("id", user.id)
          .single();
        if (data) {
          setUsername(data.username);
          if (data.avatar_key) {
            const urls = await getPhotoUrl([data.avatar_key]);
            setAvatarUrl(urls[0].url);
          }
        }
      }
      setUserLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchFavorite() {
      const { data, error } = await supabase
        .from("pins_with_last_visit")
        .select("*")
        .eq("user_id", Number(2))
        .eq("private", false)
        .order("user_rating", { ascending: false })
        .order("last_visited", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Failed to fetch favorite pin:", error.message);
        return;
      }
      
      setFavorite(data);    
      setFavLoading(false);
    }
    fetchFavorite();
  }, []);

  useEffect(() => {
    async function fetchTopVisited() {
      const { data, error } = await supabase
        .from("pins_with_visit_count")
        .select("*")
        .eq("user_id", Number(2))
        .eq("private", false)
        .order("visit_count", { ascending: false })
        .order("last_visited", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Failed to fetch most visited pin:", error.message);
        return;
      }
      
      setVisited(data);    
      setVisitLoading(false);
    }
    fetchTopVisited();
  }, []);
  
  useEffect(() => {
    setFavPhoto(null);
    if (!favorite?.pin_id) return;

    async function fetchFavPhoto() {
      const { data } = await supabase
        .from("pins")
        .select("pin_photos(photos(key), cover)")
        .eq("pin_id", String(favorite?.pin_id))
        .single();

      if (!data?.pin_photos?.length) return;

      const coverEntry = data.pin_photos.find((p: any) => p.cover);
      const key = coverEntry?.photos?.key;
      if (!key) return;

      const urls = await getPhotoUrl([key]);
      if (urls?.[0]?.url) setFavPhoto(urls[0].url);
    }

    fetchFavPhoto();
  }, [favorite]);

  useEffect(() => {
    setVisPhoto(null);
    if (!visited?.pin_id) return;

    async function fetchVisPhoto() {
      const { data } = await supabase
        .from("pins")
        .select("pin_photos(photos(key), cover)")
        .eq("pin_id", String(visited?.pin_id))
        .single();

      if (!data?.pin_photos?.length) return;

      const coverEntry = data.pin_photos.find((p: any) => p.cover);
      const key = coverEntry?.photos?.key;
      if (!key) return;

      const urls = await getPhotoUrl([key]);
      if (urls?.[0]?.url) setVisPhoto(urls[0].url);
    }

    fetchVisPhoto();
  }, [visited]);

  if (loading) return <LoadingPage />;

  return (
    <ScrollView>
      <View
        style={{
          marginTop: 45,
          marginHorizontal: 10,
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={styles.editAccountButton}
          onPress={() => {
            router.push("/edit_account");
          }}
        >
          <Text
            style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
          >
            Edit Account
          </Text>
        </Pressable>
      </View>

      <View style={styles.container}>
        {/* Avatar */}
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            transition={300}
          />
        ) : (
          <View style={styles.avatar} />
        )}

        {/* Username, Location, Bio */}
        <Text style={styles.username}>{username}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={17} color="#333" />
          <Text style={[styles.location, { paddingLeft: 2 }]}>Location</Text>
        </View>
        <Text style={styles.bio}>Bio</Text>

        {/* Stats */}
          <View style={styles.infoBox}>
            <Text style={styles.header}>Statistics</Text>
            <View style={[styles.statsRow, {gap: 20}]}>
              <Pressable style={[styles.infoWindow, {width: "42%", alignItems: "center"}]} onPress={() => {router.push({
                  pathname: "/pins/[pinid]",
                  params: { pinid: String(favorite?.pin_id) },
                })}}>
                <Text style={styles.subHeader}>Favorite</Text>
                <View style={styles.statsWindows}>
                  {favPhoto && (
                    <Image
                      source={
                        favPhoto
                          ? { uri: favPhoto }
                          : require("@/assets/images/no_image_default.png")
                      }
                      style={styles.image}
                      contentFit="cover"
                      transition={300}
                      placeholder="blur"
                    />
                  )}
                  {!favPhoto && (
                    <Text style={{fontFamily: Fonts.bold, fontSize: 13, textAlign: "center", marginTop: 15, marginHorizontal: 2}}>
                      {favorite?.name ? (
                        <>
                          {favorite.name}
                          {"\n"}
                          <Text style={{ fontFamily: Fonts.regular_i, fontSize: 11 }}>
                            No photo set
                          </Text>
                        </>
                      ) : (
                        "This user has no pins yet."
                      )}
                    </Text>
                  )}
                </View>
                <View style={styles.statsBar}>
                  <View style={{flexDirection: "row", gap: 1, justifyContent: "center"}}>
                    <Stars starnum={favorite?.user_rating ?? 0}/>
                  </View>
                </View>
              </Pressable>
              <Pressable style={[styles.infoWindow, {width: "42%", alignItems: "center"}]} onPress={() => {router.push({
                  pathname: "/pins/[pinid]",
                  params: { pinid: String(visited?.pin_id) },
                })}}>
                <Text style={styles.subHeader}>Top Visited</Text>
                <View style={styles.statsWindows}>
                  {visPhoto && (
                    <Image
                      source={
                        visPhoto
                          ? { uri: visPhoto }
                          : require("@/assets/images/no_image_default.png")
                      }
                      style={styles.image}
                      contentFit="cover"
                      transition={300}
                      placeholder="blur"
                    />
                  )}
                  {!visPhoto && (
                    <Text style={{fontFamily: Fonts.bold, fontSize: 13, textAlign: "center", marginTop: 15, marginHorizontal: 2}}>
                      {visited?.name ? (
                        <>
                          {visited.name}
                          {"\n"}
                          <Text style={{ fontFamily: Fonts.regular_i, fontSize: 11 }}>
                            No photo set
                          </Text>
                        </>
                      ) : (
                        "This user has no pins yet."
                      )}
                    </Text>
                  )}
                </View>
                <View style={styles.statsBar}>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 16, color: "#fefbea", marginHorizontal: 7, flexShrink: 1 }}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                    {visited?.visit_count ?? "-"}{" "}
                    {visited?.visit_count === 1 ? "Visit" : "Visits"}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

        {/* Activity */}
        <View style={styles.infoBox}>
          <Text style={styles.header}>Recent Activity</Text>
          <View style={[styles.infoWindow, { justifyContent: "center" }]}>
            <View style={styles.activityRow}>
              <View style={styles.locAvatar} />
              <Text
                style={{ fontFamily: Fonts.bold, fontSize: 14, marginLeft: 13 }}
              >
                Visited:{" "}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 14,
                  flexShrink: 1,
                  marginRight: 13,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                —
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.activityRow}>
              <View style={styles.locAvatar} />
              <Text
                style={{ fontFamily: Fonts.bold, fontSize: 14, marginLeft: 13 }}
              >
                Friend Added:{" "}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 14,
                  flexShrink: 1,
                  marginRight: 13,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                —
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.activityRow}>
              <View style={styles.locAvatar} />
              <Text
                style={{ fontFamily: Fonts.bold, fontSize: 14, marginLeft: 13 }}
              >
                New Pin:{" "}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 14,
                  flexShrink: 1,
                  marginRight: 13,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                —
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  username: {
    fontSize: 26,
    color: "#333",
    textAlign: "center",
    fontFamily: Fonts.bold,
  },
  location: {
    fontFamily: Fonts.bold_i,
    fontSize: 15,
  },
  bio: {
    fontSize: 15,
    marginHorizontal: 50,
    marginTop: 3,
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
    fontFamily: Fonts.regular_i,
  },
  editAccountButton: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  avatar: {
    width: 155,
    height: 155,
    borderRadius: 999,
    marginTop: 25,
    marginBottom: 10,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  locAvatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "93%",
  },
  divider: {
    height: 1,
    width: "75%",
    marginLeft: 30,
    backgroundColor: "#7ca982",
    marginVertical: 5,
  },
  infoBox: {
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#DEE9E0",
    marginVertical: 12,
    height: 225,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  header: {
    fontFamily: Fonts.regular,
    fontSize: 35,
    color: "#333",
    marginTop: 10,
  },
  subHeader: {
    fontFamily: Fonts.regular_i,
    fontSize: 23,
    color: "#333",
    marginVertical: 5,
  },
  infoWindow: {
    height: 145,
    width: "90%",
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#7CA982",
    marginVertical: 10,
    alignItems: "center",
  },
  statsWindows: {
    height: 96,
    width: "88%",
    backgroundColor: "#d9d9d9",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  statsBar: {
    backgroundColor: "#243e36",
    width: "65%",
    height: 25,
    position: "absolute",
    alignSelf: "flex-start",
    marginTop: 118,
    marginLeft: -2,
    borderTopRightRadius: 12,
    justifyContent: "center",
  },
});
