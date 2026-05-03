import { Stars } from "@/components/light-stars";
import LoadingPage from "@/components/loading-page";
import PinMarkers from "@/components/pin-markers";
import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ClusteredMapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";

// CSULB is default region if user does not share location
const CSULB = {
  latitude: 33.7838,
  longitude: -118.1141,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

type Friend = {
  user_id: number;
  username: string;
  location: string | null;
  bio: string | null;
};

type PinRow = {
  pin_id: number;
  name: string;
  address: string;
  location_id: number;
  user_id: number;
  locations?:
    | {
        id: number;
        latitude: number;
        longitude: number;
      }[]
    | null;
};

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

type RecentVisit = {
  pin_id: number;
  name: string;
  last_visited: string | null;
};

type RecentFriend = {
  username: string;
};

type RecentPin = {
  pin_id: number;
  name: string;
  created_at: string | null;
};

export default function FriendProfilePage() {
  const { friendid, from } = useLocalSearchParams<{
    friendid: string;
    from?: string;
  }>();
  const { profile: currentProfile } = useAuth();
  const { showToast } = useToast();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [friendProfileId, setFriendProfileId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(true);
  const [visitLoading, setVisitLoading] = useState(true);
  const [favorite, setFavorite] = useState<FavPin | null>(null);
  const [favPhoto, setFavPhoto] = useState<string | null>(null);
  const [visited, setVisited] = useState<VisPin | null>(null);
  const [visPhoto, setVisPhoto] = useState<string | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [recentVisit, setRecentVisit] = useState<RecentVisit | null>(null);
  const [recentFriend, setRecentFriend] = useState<RecentFriend | null>(null);
  const [recentPin, setRecentPin] = useState<RecentPin | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const loading =
    pinLoading || userLoading || favLoading || visitLoading || activityLoading;

  // This fetches data from the 'pins' table in Supabase. Also has error handling if unable to fetch
  useFocusEffect(
    useCallback(() => {
      async function fetchLocations() {
        const { data, error } = await supabase
          .from("pins")
          .select(
            `pin_id, location_id, user_id, name, address, private,
             locations:location_id( id, latitude, longitude )`,
          )
          .eq("user_id", Number(friendid))
          .order("pin_id", { ascending: true })
          .eq("private", false);

        if (error) {
          console.error("Failed to fetch locations:", error.message);
          return;
        }

        const typedData = data as PinRow[];

        setPins(
          typedData.map((row) => {
            const loc = Array.isArray(row.locations)
              ? row.locations[0]
              : row.locations;

            return {
              id: String(row.pin_id),
              name: row.name,
              address: row.address,
              latitude: loc?.latitude ?? 0,
              longitude: loc?.longitude ?? 0,
              user_id: String(row.user_id),
            };
          }),
        );
        setPinLoading(false);
      }
      fetchLocations();
    }, []),
  );

  const validPins = pins.filter((p) => p.latitude !== 0 && p.longitude !== 0);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, username, location, bio")
        .eq("user_id", Number(friendid))
        .single();

      if (error) {
        console.error("Failed to fetch user:", error.message);
        return;
      }
      setFriend(data);
      setUserLoading(false);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, avatar_key")
        .eq("user_id", Number(friendid))
        .single();

      if (profileData?.id) setFriendProfileId(profileData.id);

      if (profileData?.avatar_key) {
        const urls = await getPhotoUrl([profileData.avatar_key]);
        setAvatarUrl(urls[0]?.url ?? null);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchFavorite() {
      const { data, error } = await supabase
        .from("pins_with_last_visit")
        .select("*")
        .eq("user_id", Number(friendid))
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
        .eq("user_id", Number(friendid))
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
    async function fetchActivity() {
      try {
        // Most recently visited place
        const { data: visitData } = await supabase
          .from("pins_with_last_visit")
          .select("pin_id, name, last_visited")
          .eq("user_id", Number(friendid))
          .eq("private", false)
          .not("last_visited", "is", null)
          .order("last_visited", { ascending: false })
          .limit(1)
          .maybeSingle();

        setRecentVisit(visitData ?? null);

        // Most recently added friend (if discoverable)
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", Number(friendid))
          .single();

        const myProfileId = myProfile?.id;

        if (myProfileId) {
          const { data: relData } = await supabase
            .from("user_relationships1")
            .select("requester_id, target_id")
            .eq("status", "accepted")
            .or(`requester_id.eq.${myProfileId},target_id.eq.${myProfileId}`)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (relData) {
            const otherProfileId =
              relData.requester_id === myProfileId
                ? relData.target_id
                : relData.requester_id;

            const { data: profileData } = await supabase
              .from("profiles")
              .select("user_id, username")
              .eq("id", otherProfileId)
              .maybeSingle();

            if (profileData) {
              const { data: userData } = await supabase
                .from("users")
                .select("discoverable")
                .eq("user_id", profileData.user_id)
                .maybeSingle();

              if (userData?.discoverable) {
                setRecentFriend({
                  username: profileData.username ?? "Unknown",
                });
              } else {
                setRecentFriend(null);
              }
            } else {
              setRecentFriend(null);
            }
          } else {
            setRecentFriend(null);
          }
        }

        // Most recently created pin
        const { data: pinData } = await supabase
          .from("pins")
          .select("pin_id, name, created_at")
          .eq("user_id", Number(friendid))
          .eq("private", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setRecentPin(pinData ?? null);
      } catch (err) {
        console.error("Activity fetch error:", err);
        setRecentVisit(null);
        setRecentFriend(null);
        setRecentPin(null);
      } finally {
        setActivityLoading(false);
      }
    }
    fetchActivity();
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

  const deleteFriendship = async () => {
    await supabase
      .from("user_relationships1")
      .delete()
      .or(
        `and(requester_id.eq.${currentProfile!.id},target_id.eq.${friendProfileId}),and(requester_id.eq.${friendProfileId},target_id.eq.${currentProfile!.id})`,
      )
      .eq("status", "accepted");
  };

  const navigateToUserProfile = () => {
    router.replace({
      pathname: "/user_profiles/[userid]",
      params: { userid: friendProfileId! },
    });
  };

  const handleUnfriend = () => {
    Alert.alert(
      "Unfriend",
      `Are you sure you want to unfriend ${friend?.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unfriend",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("user_relationships1")
              .delete()
              .or(
                `and(requester_id.eq.${currentProfile!.id},target_id.eq.${friendProfileId}),and(requester_id.eq.${friendProfileId},target_id.eq.${currentProfile!.id})`,
              )
              .eq("status", "accepted");

            if (error) {
              showToast("Failed to unfriend. Try again.", "error");
              return;
            }

            setSettingsVisible(false);
            showToast(`Unfriended ${friend?.username}`, "success");
            navigateToUserProfile();
          },
        },
      ],
    );
  };

  const handleBlock = () => {
    Alert.alert(
      "Unfriend and Block",
      `Are you sure you want to unfriend and block ${friend?.username}? They won't be able to find you or send you friend requests.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            await deleteFriendship();

            const { error } = await supabase
              .from("user_relationships1")
              .insert({
                requester_id: currentProfile!.id,
                target_id: friendProfileId,
                status: "blocked",
              });

            if (error) {
              showToast("Failed to block. Try again.", "error");
              return;
            }

            setSettingsVisible(false);
            showToast(`Blocked ${friend?.username}`, "success");
            navigateToUserProfile();
          },
        },
      ],
    );
  };

  if (loading) return <LoadingPage />;

  return (
    <ScrollView>
      <View
        style={{
          marginTop: 45,
          marginHorizontal: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (from === "account") {
              router.replace("/(tabs)/(account)/account");
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
          <Text
            style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
          >
            Back
          </Text>
        </Pressable>
        <Pressable
          style={styles.settingsButton}
          onPress={() => setSettingsVisible(true)}
        >
          <Text
            style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
          >
            Settings
          </Text>
        </Pressable>
      </View>
      {/* Profile Picture */}
      <View style={styles.container}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            transition={300}
          />
        ) : !friend?.username ? (
          <View style={styles.avatar} />
        ) : (
          friend?.username && (
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {friend.username?.[0]?.toUpperCase()}
              </Text>
            </View>
          )
        )}

        {/* Username, Location, and Bio */}
        <Text style={styles.username}>
          {friend?.username ?? "Username Unavailable"}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={17} color="#333" />
          <Text style={[styles.location, { paddingLeft: 2 }]}>
            {friend?.location?.trim() ? friend.location : "No location set"}
          </Text>
        </View>
        <Text style={styles.bio}>
          {friend?.bio?.trim() ? friend.bio : "No bio"}
        </Text>

        {/* Map */}
        <View style={styles.infoBox}>
          <Text style={styles.header}>Map</Text>
          <View style={styles.infoWindow}>
            <ClusteredMapView
              initialRegion={
                validPins.length > 0
                  ? {
                      latitude: validPins[0].latitude,
                      longitude: validPins[0].longitude,
                      latitudeDelta: 0.015,
                      longitudeDelta: 0.015,
                    }
                  : CSULB
              }
              style={{ width: "100%", flex: 1 }}
              scrollEnabled={false}
              zoomEnabled={false}
              ref={mapRef}
              clusterColor="#243e36"
              clusterTextColor="#fefbea"
              clusterFontFamily="System"
            >
              {pins
                .filter((pin) => pin.latitude !== 0 && pin.longitude !== 0)
                .map((pin) => (
                  <Marker
                    key={pin.id}
                    coordinate={{
                      latitude: pin.latitude,
                      longitude: pin.longitude,
                    }}
                    tracksViewChanges={false}
                  >
                    <PinMarkers users_id={Number(friendid)} />
                  </Marker>
                ))}
            </ClusteredMapView>
            <Pressable
              style={styles.mapExpand}
              onPress={() =>
                router.push({
                  pathname: "/friend_maps/[friendmap]",
                  params: {
                    friendmap: `${friendid}`,
                  },
                })
              }
            >
              <Ionicons name="expand-outline" size={21} color="#fefbea" />
            </Pressable>
          </View>
        </View>

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
        {/* Activity */}
        <View style={styles.infoBox}>
          <Text style={styles.header}>Recent Activity</Text>
          <View style={[styles.infoWindow, { justifyContent: "center" }]}>
            {/* Most recently visited */}
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
                {recentVisit?.name ?? "No visits yet"}
              </Text>
            </View>

            <View
              style={{
                height: 1,
                width: "75%",
                marginLeft: 30,
                backgroundColor: Colors.light.accent,
                marginVertical: 5,
              }}
            />

            {/* Most recently added friend */}
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
                {recentFriend?.username ?? "No friends yet"}
              </Text>
            </View>

            <View
              style={{
                height: 1,
                width: "75%",
                marginLeft: 30,
                backgroundColor: Colors.light.accent,
                marginVertical: 5,
              }}
            />

            {/* Most recently created pin */}
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
                {recentPin?.name ?? "No pins yet"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ height: 100 }} />

      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSettingsVisible(false)}
        >
          <View style={styles.settingsDropdown}>
            <Pressable
              style={styles.settingsDropdownHeader}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={styles.settingsDropdownTitle}>Friend Settings</Text>
              <Ionicons name="chevron-up" size={18} color="#333" />
            </Pressable>
            <Pressable style={styles.unfriendButton} onPress={handleUnfriend}>
              <Text style={styles.unfriendText}>Unfriend</Text>
            </Pressable>
            <Pressable style={styles.blockButton} onPress={handleBlock}>
              <Text style={styles.blockText}>Unfriend and Block</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  backButton: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    width: 105,
    height: 40,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  settingsButton: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    width: 105,
    height: 40,
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
  avatarInitial: {
    fontSize: 75,
    fontFamily: Fonts.regular,
    color: "#000",
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
  image: {
    width: "100%",
    height: "100%",
  },
  mapExpand: {
    backgroundColor: Colors.light.accent,
    width: 25,
    height: 25,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 111,
    right: 5,
    alignSelf: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  statsWindows: {
    height: 96,
    width: "88%",
    backgroundColor: "#d9d9d9",
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  settingsDropdown: {
    position: "absolute",
    top: 88,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    width: 210,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    overflow: "hidden",
  },
  settingsDropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#243e36",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingsDropdownTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: "#d9d9d9",
  },
  unfriendButton: {
    backgroundColor: "#7CA982",
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
  },
  unfriendText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: "#fff",
  },
  blockButton: {
    backgroundColor: "#7B1111",
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
  },
  blockText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: "#fff",
  },
});
