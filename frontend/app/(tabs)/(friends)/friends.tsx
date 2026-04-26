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
import Sort from "@/components/sort-lists";

type UserCard = {
  profileId: string;
  user_id: number;
  username: string;
  location: string | null;
  avatarUrl?: string | null;
  date: string | null;
};

export default function Friends() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [friends, setFriends] = useState<UserCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortChoice, setSortChoice] = useState("date");
  const [ascending, setAscending] = useState(true);

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

    const { data: relData } = await supabase
      .from("user_relationships1")
      .select("requester_id, target_id, created_at")
      .eq("status", "accepted")
      .or(`requester_id.eq.${profile.id},target_id.eq.${profile.id}`);

    const friendDateMap: Record<string, string> = {};

    (relData ?? []).forEach((r: any) => {
      const friendId =
        r.requester_id === profile.id ? r.target_id : r.requester_id;

      friendDateMap[friendId] = r.created_at;
    });

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
          date: friendDateMap[p.id] ?? null,
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

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFriends = [...filteredFriends].sort((a, b) => {
    if (sortChoice === "name") {
      return ascending
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username);
    }

    if (sortChoice === "location") {
      const aLoc = a.location ?? "";
      const bLoc = b.location ?? "";

      return ascending
        ? aLoc.localeCompare(bLoc)
        : bLoc.localeCompare(aLoc);
    }
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;

    return ascending ? aTime - bTime : bTime - aTime;
  });

  if (loading) return <LoadingPage />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Friends" }} />

      <Pressable style={styles.plusButton} onPress={() => router.push("./add-friends")}>
        <MaterialCommunityIcons name="plus" size={45} color="#fefbea" />
      </Pressable>

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchText}
            placeholder="Find a friend"
            placeholderTextColor="#fefbea"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={16} color={"#fefbea"} />
        </View>
        <Pressable style={styles.sortBtn} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.sortText}>Sort</Text>
          <Ionicons name="chevron-down" size={14} color={"#fefbea"} />
        </Pressable>
        <Pressable style={styles.notifBtn} onPress={() => router.push("./friend-notifications")}>
          <Ionicons name="notifications-outline" size={36} color={Colors.light.background} />
          {pendingCount > 0 && <View style={styles.notifBadge} />}
        </Pressable>
      </View>

      <FlatList
        data={sortedFriends}
        keyExtractor={(item) => item.profileId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No friends yet. Tap + to find people.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/friend_profiles/[friendid]",
                params: { friendid: String(item.user_id) },
              })
            }
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
      <Sort 
        contentType="friend"
        isVisible={sortModalVisible} 
        onClose={() => setSortModalVisible(false)}
        sortChoice={sortChoice}
        setSortChoice={setSortChoice}
        ascending={ascending}
        setAscending={setAscending}
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
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accent,
    borderRadius: 999,
    height: 40,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  sortText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#fefbea",
  },
});
