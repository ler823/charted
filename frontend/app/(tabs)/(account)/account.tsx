import { Colors, Fonts } from "@/constants/theme";
import { getPhotoUrlMap } from "@/lib/photo-utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const RECENT_PINS_LIMIT = 9; // three rows of the grid
const GRID_GAP = 2;
const SKELETON_COLOR = "#e4ebe5";

type RecentPin = {
  pin_id: number;
  name: string | null;
  photoUrl: string | null;
};

export default function Account() {
  const { profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const tileSize = (screenWidth - GRID_GAP * 2) / 3;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  const [username, setUsername] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pinCount, setPinCount] = useState(0);
  const [friendCount, setFriendCount] = useState(0);
  const [recentPins, setRecentPins] = useState<RecentPin[]>([]);
  const [loading, setLoading] = useState(true);

  // Refetch on focus so edits, new pins and new friends show up right away
  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      let isActive = true;

      async function loadProfile() {
        const [profileRes, userRes, pinCountRes, friendCountRes, recentRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("username, avatar_key")
            .eq("user_id", profile!.user_id)
            .single(),
          supabase
            .from("users")
            .select("location, bio")
            .eq("user_id", profile!.user_id)
            .single(),
          // Public pins only, to match what the pins screen shows
          supabase
            .from("pins")
            .select("pin_id", { count: "exact", head: true })
            .eq("user_id", profile!.user_id)
            .eq("private", false),
          supabase
            .from("user_relationships1")
            .select("id", { count: "exact", head: true })
            .eq("status", "accepted")
            .or(`requester_id.eq.${profile!.id},target_id.eq.${profile!.id}`),
          supabase
            .from("pins")
            .select("pin_id, name, pin_photos(cover, photos(key))")
            .eq("user_id", profile!.user_id)
            .eq("private", false)
            .order("created_at", { ascending: false })
            .limit(RECENT_PINS_LIMIT),
        ]);

        if (recentRes.error) {
          console.error("Failed to fetch recent pins:", recentRes.error.message);
        }

        // Avatar + every pin cover in a single photo request
        const avatarKey = profileRes.data?.avatar_key ?? null;
        const pinRows = (recentRes.data ?? []).map((p: any) => ({
          pin_id: p.pin_id,
          name: p.name,
          coverKey: (p.pin_photos as any[])?.find((ph) => ph.cover)?.photos?.key ?? null,
        }));
        const urlMap = await getPhotoUrlMap([avatarKey, ...pinRows.map((p) => p.coverKey)]);

        if (!isActive) return;

        setUsername(profileRes.data?.username ?? "");
        setAvatarUrl((avatarKey && urlMap[avatarKey]) || null);
        setLocation(userRes.data?.location?.trim() || null);
        setBio(userRes.data?.bio?.trim() || null);
        setPinCount(pinCountRes.count ?? 0);
        setFriendCount(friendCountRes.count ?? 0);
        setRecentPins(
          pinRows.map((p) => ({
            pin_id: p.pin_id,
            name: p.name,
            photoUrl: (p.coverKey && urlMap[p.coverKey]) || null,
          })),
        );
        setLoading(false);
      }

      loadProfile();
      return () => {
        isActive = false;
      };
    }, [profile]),
  );

  const openPins = () => {
    if (!profile) return;
    router.push({
      pathname: "/friend_maps/[friendmap]",
      params: { friendmap: String(profile.user_id), viewMode: "list" },
    });
  };

  const openPin = (pinId: number) =>
    router.push({ pathname: "/pins/[pinid]", params: { pinid: String(pinId) } });

  const topBar = (
    <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
      <Pressable style={styles.iconButton} onPress={() => router.push("/")} hitSlop={8}>
        <Ionicons name="home-outline" size={22} color={Colors.light.text} />
      </Pressable>
      {loading ? (
        <Animated.View style={[styles.skeletonLine, { width: 120, height: 20, opacity: pulseAnim }]} />
      ) : (
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {username}
        </Text>
      )}
      <Pressable style={styles.iconButton} onPress={() => router.push("/edit_account")} hitSlop={8}>
        <Ionicons name="settings-outline" size={22} color={Colors.light.text} />
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 105 }}>
        {topBar}
        <View style={styles.headerRow}>
          <Animated.View style={[styles.avatar, { backgroundColor: SKELETON_COLOR, opacity: pulseAnim }]} />
          <View style={styles.statsRow}>
            {[0, 1].map((i) => (
              <View key={i} style={styles.stat}>
                <Animated.View style={[styles.skeletonLine, { width: 32, height: 20, opacity: pulseAnim }]} />
                <Animated.View style={[styles.skeletonLine, { width: 48, height: 13, marginTop: 6, opacity: pulseAnim }]} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.details}>
          <Animated.View style={[styles.skeletonLine, { width: 140, height: 14, opacity: pulseAnim }]} />
          <Animated.View style={[styles.skeletonLine, { width: 220, height: 14, marginTop: 8, opacity: pulseAnim }]} />
        </View>
        <View style={styles.actionsRow}>
          <Animated.View style={[styles.actionButton, { backgroundColor: SKELETON_COLOR, opacity: pulseAnim }]} />
          <Animated.View style={[styles.actionButton, { backgroundColor: SKELETON_COLOR, opacity: pulseAnim }]} />
        </View>
        <View style={[styles.grid, { marginTop: 52 }]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Animated.View
              key={i}
              style={{ width: tileSize, height: tileSize, backgroundColor: SKELETON_COLOR, opacity: pulseAnim }}
            />
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 105 }}>
      {topBar}

      {/* Avatar + counts */}
      <View style={styles.headerRow}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} transition={300} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{username ? username[0].toUpperCase() : ""}</Text>
          </View>
        )}
        <View style={styles.statsRow}>
          <Pressable style={styles.stat} onPress={openPins}>
            <Text style={styles.statCount}>{pinCount}</Text>
            <Text style={styles.statLabel}>{pinCount === 1 ? "Pin" : "Pins"}</Text>
          </Pressable>
          <Pressable style={styles.stat} onPress={() => router.push("/friends")}>
            <Text style={styles.statCount}>{friendCount}</Text>
            <Text style={styles.statLabel}>{friendCount === 1 ? "Friend" : "Friends"}</Text>
          </Pressable>
        </View>
      </View>

      {/* Location + bio */}
      <View style={styles.details}>
        {location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color={Colors.light.accent} />
            <Text style={styles.location}>{location}</Text>
          </View>
        )}
        {bio ? (
          <Text style={styles.bio}>{bio}</Text>
        ) : (
          <Text style={styles.bioEmpty}>No bio yet</Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={() => router.push("/edit_account")}
        >
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={() => router.push("/lists")}
        >
          <Text style={styles.actionButtonText}>My Lists</Text>
        </Pressable>
      </View>

      {/* Recently pinned grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently Pinned</Text>
        {pinCount > recentPins.length && (
          <Pressable onPress={openPins} hitSlop={8}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        )}
      </View>

      {recentPins.length > 0 ? (
        <View style={styles.grid}>
          {recentPins.map((pin) => (
            <Pressable
              key={pin.pin_id}
              style={{ width: tileSize, height: tileSize }}
              onPress={() => openPin(pin.pin_id)}
            >
              {pin.photoUrl ? (
                <Image source={{ uri: pin.photoUrl }} style={styles.tileImage} contentFit="cover" transition={200} />
              ) : (
                <View style={[styles.tileImage, styles.tilePlaceholder]}>
                  <Ionicons name="location-outline" size={24} color={Colors.light.accent} />
                </View>
              )}
              <View style={styles.tileLabel}>
                <Text style={styles.tileLabelText} numberOfLines={1}>
                  {pin.name ?? "Untitled pin"}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="location-outline" size={28} color={Colors.light.text} />
          </View>
          <Text style={styles.emptyTitle}>No pins yet</Text>
          <Text style={styles.emptySub}>Drop a pin on the map and it'll show up here</Text>
        </View>
      )}

      <Pressable style={styles.signOut} onPress={signOut} hitSlop={8}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.light.text,
    marginHorizontal: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: Colors.light.accentLight,
    borderWidth: 2,
    borderColor: Colors.light.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 36,
    fontFamily: Fonts.bold,
    color: Colors.light.background,
  },
  statsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginLeft: 12,
  },
  stat: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statCount: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.light.text,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#5b6b64",
    marginTop: 2,
  },

  details: {
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  location: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.light.background,
  },
  bio: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.light.text,
  },
  bioEmpty: {
    fontFamily: Fonts.regular_i,
    fontSize: 14,
    color: "#8a9690",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.light.background,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.light.text,
  },
  seeAll: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.light.accent,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tilePlaceholder: {
    backgroundColor: Colors.light.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: "rgba(22, 39, 34, 0.55)",
  },
  tileLabelText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: "#fff",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.light.text,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.light.text,
  },
  emptySub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: "#8a9690",
    textAlign: "center",
    marginTop: 4,
  },

  signOut: {
    alignSelf: "center",
    marginTop: 32,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signOutText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.light.error,
  },

  skeletonLine: {
    borderRadius: 6,
    backgroundColor: SKELETON_COLOR,
  },
});
