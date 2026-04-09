import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors, Fonts } from "../../../constants/theme";
import LoadingPage from "@/components/loading-page";

type Friend = {
  user_id: number;
  username: string;
  location: string | null;
};

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  // Searching Implementation
  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /*
  This chunk queries the database for 'users' table in Supabase
  photo_id is left out for once we start dealing with photos, for now there is a white circle
  */
  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from("users")
        .select("user_id, username, location");
      setFriends(data ?? []);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Friends" }} />
      {/* 
      Deals with the Add Button at the top of the screen.
      Looks a little small so might need to tweak the sizing a bit
      Pressable components for future interaction implmenetation
      */}
      <View style={styles.header}>
        <Pressable style={styles.addFriendBtn}>
          <Ionicons name="add-circle-outline" size={20} color="#FEFBEA" />
          <Text style={styles.addFriendText}>Add Friend</Text>
        </Pressable>
        {/* CHECK: This bell looks a little off when loaded*/}
        <Pressable style={styles.notifBtn} onPress={() => router.push("/friend-notifications")}>
          <Ionicons
            name="notifications-outline"
            size={33}
            color={Colors.light.background}
          />
          <View style={styles.notifBadge} />
        </Pressable>
      </View>

      <View style={{ borderBottomColor: Colors.light.background, borderBottomWidth: 1, marginHorizontal: 16 }} />

      {/*  
      Deals with the serach row and sort button 
      */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchText}
            placeholder="Search"
            placeholderTextColor="#fefbea"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={16} color={"#fefbea"} />
        </View>
        <Pressable style={styles.sortBtn}>
          <Text style={styles.sortText}>Sort</Text>
          <Ionicons name="chevron-down" size={14} color={"#fefbea"} />
        </Pressable>
      </View>

      {/* 
      Deals with the friends cards and the list of the friends cards
      */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => String(item.user_id)}
        contentContainerStyle={styles.list}
        // Handling if user has no friends/if not data fetched from DB
        ListEmptyComponent={<Text style={styles.emptyText}>No Friends Available</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => 
            router.push({
              pathname: "/friend_profiles/[friendid]",
              params: {
                friendid: `${item.user_id}`
              }})}>
            {/* 
            Placeholder cirlce for now. 
            PIcture will be added once figured out how to load pictures from cloud/db
            Later implement: display uploaded photo or default initial for no photo 
            */}
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{item.username?.[0]?.toUpperCase()}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.username}>{item.username}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={13} color="#111" />
                <Text style={[styles.location, { paddingLeft: 2 }]}>
                  {item.location}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
      <View style={{ height: 80 }}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  /* 
  Styling for the add button and notification button
  */
  header: {
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addFriendBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    paddingVertical: 13,
    borderRadius: 999,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  addFriendText: {
    color: "#fefbea",
    fontFamily: Fonts.bold,
    fontSize: 20,
  },
  notifBtn: {
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: "#e53935",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  /* 
  Styling for the search bar and the sort button
   */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
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
    fontSize: 15,
    color: "#fefbea",
    fontFamily: Fonts.bold,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accent,
    borderRadius: 999,
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
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "#fefbea",
  },
  /* 
  Styling for the friend cards
  Mostly taken from list_card.tsx
  */
  list: {
    alignItems: "center",
    paddingBottom: 20,
  },
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
  },
  avatarInitial: {
    fontSize: 28,
    fontFamily: Fonts.regular,
    color: "#000",
  },
  cardInfo: {
    flex: 1,
  },
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
  location: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#888",
    marginTop: 40,
  },
});
