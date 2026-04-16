import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type FriendRequest = {
  id: string;
  username: string;
};

function Avatar({ username }: { username: string }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarInitial}>{username?.[0]?.toUpperCase()}</Text>
    </View>
  );
}

export default function FriendNotifications() {
  const router = useRouter();
  const { profile } = useAuth();
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      fetchRequests();
    }, [profile])
  );

  const fetchRequests = async () => {
    if (!profile) return;
    const uuid = profile.id;

    // Received
    const { data: receivedData } = await supabase
      .from("user_relationships1")
      .select("id, requester_id")
      .eq("target_id", uuid)
      .eq("status", "pending");

    // Sent
    const { data: sentData } = await supabase
      .from("user_relationships1")
      .select("id, target_id")
      .eq("requester_id", uuid)
      .eq("status", "pending");

    // Look up usernames for requesters.
    const receivedUuids = (receivedData ?? []).map((r: any) => r.requester_id);
    const sentUuids = (sentData ?? []).map((r: any) => r.target_id);
    const allUuids = [...new Set([...receivedUuids, ...sentUuids])];

    let usernameMap: Record<string, string> = {};
    if (allUuids.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", allUuids);
      (profileData ?? []).forEach((p: any) => {
        usernameMap[p.id] = p.username;
      });
    }

    setReceived(
      (receivedData ?? []).map((r: any) => ({
        id: r.id,
        username: usernameMap[r.requester_id] ?? r.requester_id,
      }))
    );
    setSent(
      (sentData ?? []).map((r: any) => ({
        id: r.id,
        username: usernameMap[r.target_id] ?? r.target_id,
      }))
    );
  };

  const handleAccept = async (id: string) => {
    await supabase
      .from("user_relationships1")
      .update({ status: "accepted" })
      .eq("id", id);
    setReceived((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReject = async (id: string) => {
    await supabase.from("user_relationships1").delete().eq("id", id);
    setReceived((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUnsend = async (id: string) => {
    await supabase.from("user_relationships1").delete().eq("id", id);
    setSent((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
          <Text style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}>
            Back
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Received Friend Requests</Text>
        {received.length === 0 && (
          <Text style={styles.emptyText}>No received friend requests.</Text>
        )}
        {received.map((user) => (
          <View key={user.id} style={styles.card}>
            <Avatar username={user.username} />
            <Text style={styles.username}>{user.username}</Text>
            <View style={styles.actions}>
              <Pressable style={styles.acceptBtn} onPress={() => handleAccept(user.id)}>
                <Text style={styles.acceptText}>Accept</Text>
              </Pressable>
              <Pressable style={styles.rejectBtn} onPress={() => handleReject(user.id)}>
                <Text style={styles.rejectText}>Reject</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Sent Friend Requests</Text>
        {sent.length === 0 && (
          <Text style={styles.emptyText}>No sent friend requests.</Text>
        )}
        {sent.map((user) => (
          <View key={user.id} style={styles.card}>
            <Avatar username={user.username} />
            <Text style={styles.username}>{user.username}</Text>
            <Pressable style={styles.unsendBtn} onPress={() => handleUnsend(user.id)}>
              <Text style={styles.unsendText}>Unsend</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backRow: {
    marginTop: 45,
    marginHorizontal: 10,
  },
  backBtn: {
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
  scroll: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
    width: "100%",
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#888",
    width: "92%",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.light.text,
    width: "92%",
    marginBottom: 6,
    marginTop: 8,
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
    gap: 12,
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
  username: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.light.text,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: Colors.light.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  acceptText: {
    color: "#fefbea",
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  rejectBtn: {
    backgroundColor: Colors.light.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  rejectText: {
    color: "#fefbea",
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  unsendBtn: {
    backgroundColor: Colors.light.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    minWidth: 130,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  unsendText: {
    color: "#fefbea",
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.background,
    width: "92%",
    marginVertical: 16,
  },
});
