import { Stars } from "@/components/light-stars";
import { Colors, Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type FavPin = {
  user_id: number;
  pin_id: number;
  user_rating: number;
  name: string;
  last_visited: string | null;
};

type VisPin = {
  user_id: number;
  pin_id: number;
  visit_count: number;
  name: string;
  last_visited: string | null;
};

export default function Account() {
  const { profile, loading: authLoading, signOut } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(true);
  const [visitLoading, setVisitLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const loading = userLoading || favLoading || visitLoading || activityLoading;
  const [favorite, setFavorite] = useState<FavPin | null>(null);
  const [favPhoto, setFavPhoto] = useState<string | null>(null);
  const [visited, setVisited] = useState<VisPin | null>(null);
  const [visPhoto, setVisPhoto] = useState<string | null>(null);
  const [recentVisit, setRecentVisit] = useState<string | null>(null);
  const [recentFriend, setRecentFriend] = useState<string | null>(null);
  const [recentPin, setRecentPin] = useState<string | null>(null);
  const [recentVisitPhoto, setRecentVisitPhoto] = useState<string | null>(null);
  const [recentFriendPhoto, setRecentFriendPhoto] = useState<string | null>(
    null,
  );
  const [recentPinPhoto, setRecentPinPhoto] = useState<string | null>(null);
  const [recentVisitPinId, setRecentVisitPinId] = useState<number | null>(null);
  const [recentFriendId, setRecentFriendId] = useState<number | null>(null);
  const [recentPinId, setRecentPinId] = useState<number | null>(null);


  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadUser = async () => {
        if (!profile) return;

        const { data: freshProfile } = await supabase
          .from("profiles")
          .select("username, avatar_key")
          .eq("user_id", profile.user_id)
          .single();

        if (!isActive || !freshProfile) return;

        setUsername(freshProfile.username);

        const key = freshProfile.avatar_key;

        if (key) {
          const urls = await getPhotoUrl([key]);

          setAvatarUrl(null);
          setTimeout(() => {
            if (isActive) setAvatarUrl(urls?.[0]?.url ?? null);
          }, 0);
        } else {
          setAvatarUrl(null);
        }

        const { data: userData } = await supabase
          .from("users")
          .select("location, bio")
          .eq("user_id", profile.user_id)
          .single();

        if (!isActive) return;

        setLocation(userData?.location ?? null);
        setBio(userData?.bio?.trim() ? userData.bio : null);
        setUserLoading(false);
      };

      loadUser();

      return () => {
        isActive = false;
      };
    }, [profile?.user_id])
  );

  useEffect(() => {
    if (!profile) return;
    async function fetchFavorite() {
      const { data, error } = await supabase
        .from("pins_with_last_visit")
        .select("*")
        .eq("user_id", profile!.user_id)
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
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    async function fetchTopVisited() {
      const { data, error } = await supabase
        .from("pins_with_visit_count")
        .select("*")
        .eq("user_id", profile!.user_id)
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
  }, [profile]);

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

  useEffect(() => {
    async function fetchPinCoverUrl(pinId: number): Promise<string | null> {
      const { data } = await supabase
        .from("pins")
        .select("pin_photos(photos(key), cover)")
        .eq("pin_id", String(pinId))
        .single();
      if (!data?.pin_photos?.length) return null;
      const coverEntry = (data.pin_photos as any[]).find((p) => p.cover);
      const key = coverEntry?.photos?.key;
      if (!key) return null;
      const urls = await getPhotoUrl([key]);
      return urls?.[0]?.url ?? null;
    }

    // Deala with Recent Activty fetching of data from Supabase DB
    // For now, does practical queries such as most recent pins made and most recent user create
    // Awaits multiple user integration in Sprint 3 to support accurate data
    async function fetchActivity() {
      if (!profile) return;

      const [visitRes, pinRes] = await Promise.all([
        // Most recently visited pin by this user
        supabase
          .from("pins_with_last_visit")
          .select("pin_id, name, last_visited")
          .eq("user_id", profile.user_id)
          .eq("private", false)
          .not("last_visited", "is", null)
          .order("last_visited", { ascending: false })
          .limit(1)
          .maybeSingle(),
        // Most recently created pin by this user
        supabase
          .from("pins")
          .select("pin_id, name")
          .eq("user_id", profile.user_id)
          .eq("private", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      // Most recently accepted friend from user_relationships1
      const { data: relData } = await supabase
        .from("user_relationships1")
        .select("requester_id, target_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${profile.id},target_id.eq.${profile.id}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let friendUsername: string | null = null;
      let friendAvatarKey: string | null = null;
      let friendUserId: number | null = null;

      if (relData) {
        const friendUuid =
          relData.requester_id === profile.id
            ? relData.target_id
            : relData.requester_id;
        const { data: friendProfile } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_key")
          .eq("id", friendUuid)
          .single();
        friendUsername = friendProfile?.username ?? null;
        friendAvatarKey = friendProfile?.avatar_key ?? null;
        friendUserId = friendProfile?.user_id ?? null;
      }

      if (visitRes.data?.name) {
        setRecentVisit(visitRes.data.name);
      }
      if (friendUsername) {
        setRecentFriend(friendUsername);
      }
      if (pinRes.data?.name) {
        setRecentPin(pinRes.data.name);
      }

      const visitPinId = visitRes.data?.pin_id ?? null;
      const newPinId = pinRes.data?.pin_id ?? null;

      setRecentVisitPinId(visitPinId);
      setRecentPinId(newPinId);
      setRecentFriendId(friendUserId);

      // This sections supports the mini photos found in the Recent Activity box
      const [visitPhotoUrl, newPinPhotoUrl] = await Promise.all([
        visitPinId ? fetchPinCoverUrl(visitPinId) : Promise.resolve(null),
        newPinId ? fetchPinCoverUrl(newPinId) : Promise.resolve(null),
      ]);
      setRecentVisitPhoto(visitPhotoUrl);
      setRecentPinPhoto(newPinPhotoUrl);

      if (friendAvatarKey) {
        const urls = await getPhotoUrl([friendAvatarKey]);
        setRecentFriendPhoto(urls?.[0]?.url ?? null);
      }

      setActivityLoading(false);
    }
    fetchActivity();
  }, [profile]);

  if (loading) {
    return (
      <ScrollView>
        <View style={{ height: 15 }} />
        <View style={{ marginTop: 45, marginHorizontal: 10, flexDirection: "row", justifyContent: "flex-end" }}>
          <Animated.View style={[styles.editAccountButton, { width: 130, opacity: pulseAnim, backgroundColor: "#c5d4c8" }]} />
        </View>
        <View style={styles.container}>
          <Animated.View style={[styles.avatar, { opacity: pulseAnim, backgroundColor: "#c5d4c8" }]} />
          <Animated.View style={{ height: 26, width: 160, borderRadius: 8, backgroundColor: "#c5d4c8", marginBottom: 8, opacity: pulseAnim }} />
          <Animated.View style={{ height: 17, width: 110, borderRadius: 8, backgroundColor: "#c5d4c8", marginBottom: 8, opacity: pulseAnim }} />
          <Animated.View style={{ height: 15, width: 200, borderRadius: 8, backgroundColor: "#c5d4c8", marginBottom: 10, opacity: pulseAnim }} />
          <Animated.View style={[styles.infoBox, { opacity: pulseAnim, backgroundColor: "#c5d4c8" }]} />
          <Animated.View style={[styles.infoBox, { opacity: pulseAnim, backgroundColor: "#c5d4c8" }]} />
        </View>
        <View style={{ height: 105 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <View style={{ height: 15 }} />
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
          <View style={styles.avatar}>
            {username ? (
              <Text style={styles.avatarInitial}>
                {username[0].toUpperCase()}
              </Text>
            ) : null}
          </View>
        )}

        {/* Username, Location, Bio */}
        <Text style={styles.username}>{username}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={17} color="#333" />
          <Text style={[styles.location, { paddingLeft: 2 }]}>
            {location?.trim() ? location : "No location set"}
          </Text>
        </View>
        <Text style={styles.bio}>{bio?.trim() ? bio : "No bio"}</Text>

        {/* Stats */}
        <View style={styles.infoBox}>
          <Text style={styles.header}>Statistics</Text>
          <View style={[styles.statsRow, { gap: 20 }]}>
            <Pressable
              style={[
                styles.infoWindow,
                { width: "42%", alignItems: "center" },
              ]}
              onPress={() => {
                router.push({
                  pathname: "/pins/[pinid]",
                  params: { pinid: String(favorite?.pin_id) },
                });
              }}
            >
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
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 13,
                      textAlign: "center",
                      marginTop: 15,
                      marginHorizontal: 2,
                    }}
                  >
                    {favorite?.name ? (
                      <>
                        {favorite.name}
                        {"\n"}
                        <Text
                          style={{ fontFamily: Fonts.regular_i, fontSize: 11 }}
                        >
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
                <View
                  style={{
                    flexDirection: "row",
                    gap: 1,
                    justifyContent: "center",
                  }}
                >
                  <Stars starnum={favorite?.user_rating ?? 0} />
                </View>
              </View>
            </Pressable>
            <Pressable
              style={[
                styles.infoWindow,
                { width: "42%", alignItems: "center" },
              ]}
              onPress={() => {
                router.push({
                  pathname: "/pins/[pinid]",
                  params: { pinid: String(visited?.pin_id) },
                });
              }}
            >
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
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 13,
                      textAlign: "center",
                      marginTop: 15,
                      marginHorizontal: 2,
                    }}
                  >
                    {visited?.name ? (
                      <>
                        {visited.name}
                        {"\n"}
                        <Text
                          style={{ fontFamily: Fonts.regular_i, fontSize: 11 }}
                        >
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
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 16,
                    color: "#fefbea",
                    marginHorizontal: 7,
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
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
            <Pressable
              style={styles.activityRow}
              onPress={() =>
                recentVisitPinId &&
                router.push({
                  pathname: "/pins/[pinid]",
                  params: { pinid: String(recentVisitPinId) },
                })
              }
            >
              {recentVisitPhoto ? (
                <Image
                  source={{ uri: recentVisitPhoto }}
                  style={styles.locAvatar}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <View style={styles.locAvatar} />
              )}
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
                {recentVisit ?? "—"}
              </Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.activityRow}
              onPress={() =>
                recentFriendId &&
                router.push({
                  pathname: "/friend_profiles/[friendid]",
                  params: { friendid: String(recentFriendId), from: "account" },
                })
              }
            >
              {recentFriendPhoto ? (
                <Image
                  source={{ uri: recentFriendPhoto }}
                  style={styles.locAvatar}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <View style={styles.locAvatar} />
              )}
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
                {recentFriend ?? "—"}
              </Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.activityRow}
              onPress={() =>
                recentPinId &&
                router.push({
                  pathname: "/pins/[pinid]",
                  params: { pinid: String(recentPinId) },
                })
              }
            >
              {recentPinPhoto ? (
                <Image
                  source={{ uri: recentPinPhoto }}
                  style={styles.locAvatar}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <View style={styles.locAvatar} />
              )}
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
                {recentPin ?? "—"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.container}>
        <Pressable style={styles.button} onPress={signOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      </View>
      <View style={{ height: 105 }} />
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
  avatarInitial: {
    fontSize: 65,
    fontFamily: Fonts.regular,
    color: "#000",
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
    backgroundColor: Colors.light.accent,
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 150,
    paddingHorizontal: 16,
    marginVertical: 24,
    backgroundColor: Colors.light.error,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
});
