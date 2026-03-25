import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, Fonts } from "../../constants/theme";
import LoadingPage from "@/components/loading-page";

type UserProfile = {
  user_id: number;
  username: string;
  location: string | null;
  bio: string | null;
};

const STAT_FAVORITE = {
  label: "Favorite",
  image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
  rating: 4,
};
const STAT_TOP_VISITED = {
  label: "Top Visited",
  image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
  visits: "Five Visits",
};
const RECENT_ACTIVITY = [
  { id: 1, type: "New Pin", place: "Seaside Creamery"},
  { id: 2, type: "Visited", place: "University Student Union"},
  { id: 3, type: "Friend Added", place: "Elizabeth_0772"},
];

export default function Account() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // When authentication is ready, implement getUser 
  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from("users")
        .select("user_id, username, location, bio")
        .eq("user_id", 1)
        .single();
      setProfile(data ?? null);
      setLoading(false);
    }
    fetchProfile();
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Edit Account Button */}
        <View style={styles.editRow}>
          <Pressable style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Account</Text>
          </Pressable>
        </View>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {profile?.username?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        </View>

        {/* Username */}
        <Text style={styles.username}>{profile?.username ?? "—"}</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={15} color={Colors.light.background} />
          <Text style={styles.location}>{profile?.location ?? "—"}</Text>
        </View>

        {/* Bio */}
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {/* Statistics Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Statistics</Text>
          <View style={styles.statsRow}>
            {/* Favorite */}
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{STAT_FAVORITE.label}</Text>
              <View>
                <Ionicons name="image-outline" size={48}/>
                {/* <View style={styles.statOverlay}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons
                        key={i}
                        name={i <= STAT_FAVORITE.rating ? "star" : "star-outline"}
                        size={14}
                        color="#f5c518"
                      />
                    ))}
                  </View>
                </View> */}
              </View>
            </View>

            {/* Top Visited */}
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{STAT_TOP_VISITED.label}</Text>
              <View style={styles.statImageWrapper}>
                <Ionicons name="image-outline" size={48}/>
                {/* <View style={styles.statOverlay}>
                  <Text style={styles.visitText}>{STAT_TOP_VISITED.visits}</Text>
                </View> */}
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {RECENT_ACTIVITY.map((item, index) => (
              <View key={item.id}>
                <View style={styles.activityItem}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.activityAvatar}
                  />
                  <Text style={styles.activityText}>
                    <Text style={styles.activityType}>{item.type}: </Text>
                    {item.place}
                  </Text>
                </View>
                {index < RECENT_ACTIVITY.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  editRow: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  editBtn: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  editBtnText: {
    color: "#fefbea",
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: Colors.light.accentLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.light.accentLight,
  },
  avatarInitial: {
    fontSize: 52,
    fontFamily: Fonts.bold,
    color: Colors.light.background,
  },
  username: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: "#111",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.light.background,
  },
  bio: {
    fontStyle: "italic",
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  /* Statistics & Activity shared card */
  card: {
    width: "100%",
    height: 230,
    backgroundColor: Colors.light.accentLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: Fonts.regular,
    fontSize: 30,
    textAlign: "center",
    marginBottom: 12,
    color: "#111",
  },
  /* Statistics */
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    width: 145,
    height: 145,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#c8d8ca",
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontStyle: "italic",
    fontSize: 20,
    textAlign: "center",
    paddingVertical: 6,
    color: "#111",
  },
  statImageWrapper: {
    position: "absolute",
  },
  statImage: {
    width: "100%",
    height: 110,
  },
  statOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  visitText: {
    color: "#fff",
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  /* Recent Activity */
  activityList: {
    width: "100%",
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c8d8ca",
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 12,
  },
  activityAvatar: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#ccc",
  },
  activityText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#111",
    flex: 1,
    flexWrap: "wrap",
  },
  activityType: {
    fontFamily: Fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: "#c8d8ca",
    marginHorizontal: 60,
  },
});
