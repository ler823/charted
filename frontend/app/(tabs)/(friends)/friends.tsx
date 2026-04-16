import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter, Stack } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors, Fonts } from "../../../constants/theme";
import LoadingPage from "@/components/loading-page";
import { getPhotoUrl } from "@/lib/photo-utils";
import { Image } from "expo-image";

type UserCard = {
  profileId: string;   // UUID
  user_id: number;     // integer for friend_profiles routing
  username: string;
  location: string | null;
  avatarUrl?: string | null;
};

export default function Friends() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [friends, setFriends] = useState<UserCard[]>([]);
  const [discover, setDiscover] = useState<UserCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"friends" | "discover">("friends");
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!profile) {
        if (!authLoading) setLoading(false);
        return;
      }
      fetchFriends();
      fetchPendingCount();
    }, [profile, authLoading])
  );

  const fetchFriends = async () => {
    if (!profile) return;
    setLoading(true);

    // Get accepted relationships
    const { data: relData } = await supabase
      .from("user_relationships1")
      .select("requester_id, target_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${profile.id},target_id.eq.${profile.id}`);

    const friendUuids = (relData ?? []).map((r: any) =>
      r.requester_id === profile.id ? r.target_id : r.requester_id
    );

    if (friendUuids.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, user_id, username, avatar_key")
      .in("id", friendUuids);

    const enriched = await Promise.all(
      (profileData ?? []).map(async (p: any) => {
        let avatarUrl = null;
        if (p.avatar_key) {
          const urls = await getPhotoUrl([p.avatar_key]);
          avatarUrl = urls?.[0]?.url ?? null;
        }
        // get location from users table
        const { data: userData } = await supabase
          .from("users")
          .select("location")
          .eq("user_id", p.user_id)
          .single();
        return {
          profileId: p.id,
          user_id: p.user_id,
          username: p.username,
          location: userData?.location ?? null,
          avatarUrl,
        };
      })
    );

    setFriends(enriched);
    setLoading(false);
  };

  const fetchPendingCount = async () => {
    if (!profile) return;
    const { count } = await supabase
      .from("user_relationships1")
      .select("id", { count: "exact", head: true })
      .eq("target_id", profile.id)
      .eq("status", "pending");
    setPendingCount(count ?? 0);
  };

  const fetchDiscover = async (query: string) => {
    if (!profile) return;

    // Get all UUIDs already in a relationship with the current user (this is from user_ralationships1)
    // By checking, we are able to display on the friends of the current logged in users
    const { data: relData } = await supabase
      .from("user_relationships1")
      .select("requester_id, target_id")
      .or(`requester_id.eq.${profile.id},target_id.eq.${profile.id}`);

    const excludedUuids = new Set<string>([profile.id]);
    (relData ?? []).forEach((r: any) => {
      excludedUuids.add(r.requester_id);
      excludedUuids.add(r.target_id);
    });

    let q = supabase
      .from("profiles")
      .select("id, user_id, username, avatar_key")
      .neq("id", profile.id);

    if (query.trim()) {
      q = q.ilike("username", `%${query.trim()}%`);
    }

    const { data } = await q.limit(30);

    const filtered = (data ?? []).filter((p: any) => !excludedUuids.has(p.id));

    const enriched = await Promise.all(
      filtered.map(async (p: any) => {
        let avatarUrl = null;
        if (p.avatar_key) {
          const urls = await getPhotoUrl([p.avatar_key]);
          avatarUrl = urls?.[0]?.url ?? null;
        }
        return {
          profileId: p.id,
          user_id: p.user_id,
          username: p.username,
          location: null,
          avatarUrl,
        };
      })
    );

    setDiscover(enriched);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (mode === "discover") {
      fetchDiscover(text);
    }
  };

  const enterDiscover = () => {
    setMode("discover");
    setSearchQuery("");
    fetchDiscover("");
  };

  const exitDiscover = () => {
    setMode("friends");
    setSearchQuery("");
  };

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayList = mode === "friends" ? filteredFriends : discover;

  if (loading && mode === "friends") return <LoadingPage />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Friends" }} />

      {mode === "friends" ? (
        <Pressable style={styles.plusButton} onPress={enterDiscover}>
          <MaterialCommunityIcons name="plus" size={45} color="#fefbea" />
        </Pressable>
      ) : (
        <Pressable style={styles.plusButton} onPress={exitDiscover}>
          <MaterialCommunityIcons name="close" size={36} color="#fefbea" />
        </Pressable>
      )}

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchText}
            placeholder={mode === "friends" ? "Find a friend" : "Search people…"}
            placeholderTextColor="#fefbea"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          <Ionicons name="search" size={16} color={"#fefbea"} />
        </View>
        {mode === "friends" && (
          <Pressable style={styles.notifBtn} onPress={() => router.push("./friend-notifications")}>
            <Ionicons name="notifications-outline" size={36} color={Colors.light.background} />
            {pendingCount > 0 && <View style={styles.notifBadge} />}
          </Pressable>
        )}
      </View>

      {mode === "discover" && (
        <Text style={styles.discoverLabel}>Find People to Add</Text>
      )}

      <FlatList
        data={displayList}
        keyExtractor={(item) => item.profileId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {mode === "friends" ? "No friends yet. Tap + to find people." : "No users found."}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => {
              if (mode === "friends") {
                router.push({
                  pathname: "/friend_profiles/[friendid]",
                  params: { friendid: String(item.user_id) },
                });
              } else {
                router.push({
                  pathname: "/user_profiles/[userid]",
                  params: { userid: item.profileId },
                });
              }
            }}
          >
            <View style={styles.avatar}>
              {item.avatarUrl ? (
                <Image
                  source={{ uri: item.avatarUrl }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <Text style={styles.avatarInitial}>
                  {item.username?.[0]?.toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.username}>{item.username}</Text>
              {item.location ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-sharp" size={13} color="#111" />
                  <Text style={[styles.location, { paddingLeft: 2 }]}>{item.location}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        )}
      />
      <View style={{ height: 80 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  plusButton: {
    position: "absolute",
    bottom: 115,
    right: 25,
    zIndex: 20,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    backgroundColor: "#243e36",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  notifBtn: { position: "relative" },
  notifBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 999,
    backgroundColor: "#e53935",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 40,
    paddingVertical: 9,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: "#fefbea",
    fontFamily: Fonts.bold,
  },
  discoverLabel: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: "#243e36",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  list: { alignItems: "center", paddingBottom: 20 },
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
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 999,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitial: {
    fontSize: 28,
    fontFamily: Fonts.regular,
    color: "#000",
  },
  cardInfo: { flex: 1 },
  username: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    paddingLeft: 15,
    paddingBottom: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
  },
  location: { fontFamily: Fonts.regular, fontSize: 12 },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#888",
    marginTop: 40,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
