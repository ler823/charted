import LoadingPage from "@/components/loading-page";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getPhotoUrl } from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type UserCard = {
  profileId: string;
  user_id: number;
  username: string;
  avatarUrl?: string | null;
  users: {
    discoverable: boolean;
  };
};

export default function AddFriends() {
  const { profile } = useAuth();
  const { bottom } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscover("");
  }, [profile]);

  const fetchDiscover = async (query: string) => {
    if (!profile) return;

    const { data: relData } = await supabase
      .from("user_relationships1")
      .select("requester_id, target_id, status")
      .or(`requester_id.eq.${profile.id},target_id.eq.${profile.id}`);

    const excludedUuids = new Set<string>([profile.id]);
    (relData ?? []).forEach((r: any) => {
      // Don't exclude people I blocked — I should still be able to find them
      if (r.status === "blocked" && r.requester_id === profile.id) return;
      excludedUuids.add(r.requester_id);
      excludedUuids.add(r.target_id);
    });

    let q = supabase
      .from("profiles")
      .select("id, user_id, username, avatar_key, users!inner( discoverable )")
      .neq("id", profile.id)
      .eq("users.discoverable", true);

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
          avatarUrl,
        };
      }),
    );

    setResults(enriched);
    setLoading(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    fetchDiscover(text);
  };

  if (loading) return <LoadingPage />;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
      <Text style={styles.heading}>Add Friends</Text>
      <View style={styles.searchBarRow}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter a username"
            placeholderTextColor="#fefbea"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          <Ionicons name="search" size={16} color="#fefbea" />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.profileId}
        contentContainerStyle={[styles.list, { paddingBottom: bottom + 64 }]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/user_profiles/[userid]",
                params: { userid: item.profileId },
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
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: "#243e36",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchBarRow: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    width: "80%",
  },
  backBtn: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    height: 40,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  backText: {
    fontFamily: Fonts.bold,
    color: "#d9d9d9",
    fontSize: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7CA982",
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 40,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fefbea",
    fontFamily: Fonts.bold,
  },
  list: { alignItems: "center" },
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
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#888",
    marginTop: 40,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
