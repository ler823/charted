import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getPhotoUrl } from "@/lib/photo-utils";
import { sendPushNotification } from "@/lib/push-notifications";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type FriendRequest = {
  id: string;
  otherUserId: string;
  username: string;
  avatarUrl?: string | null;
};

function Avatar({ username, avatarUrl }: { username: string; avatarUrl?: string | null }) {
  return (
    <View style={styles.avatar}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      ) : (
        <Text style={styles.avatarInitial}>{username?.[0]?.toUpperCase()}</Text>
      )}
    </View>
  );
}

export default function FriendNotifications() {
  const router = useRouter();
  const { profile } = useAuth();
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [unsent, setUnsent] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setErrorMsg(null), 4000);
  };

  useEffect(() => () => { if (errorTimer.current) clearTimeout(errorTimer.current); }, []);

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

    let profileMap: Record<string, { username: string; avatarUrl: string | null }> = {};
    if (allUuids.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, avatar_key")
        .in("id", allUuids);

      await Promise.all(
        (profileData ?? []).map(async (p: any) => {
          let avatarUrl = null;
          if (p.avatar_key) {
            const urls = await getPhotoUrl([p.avatar_key]);
            avatarUrl = urls?.[0]?.url ?? null;
          }
          profileMap[p.id] = { username: p.username, avatarUrl };
        })
      );
    }

    setReceived(
      (receivedData ?? []).map((r: any) => ({
        id: r.id,
        otherUserId: r.requester_id,
        username: profileMap[r.requester_id]?.username ?? r.requester_id,
        avatarUrl: profileMap[r.requester_id]?.avatarUrl ?? null,
      }))
    );
    setSent(
      (sentData ?? []).map((r: any) => ({
        id: r.id,
        otherUserId: r.target_id,
        username: profileMap[r.target_id]?.username ?? r.target_id,
        avatarUrl: profileMap[r.target_id]?.avatarUrl ?? null,
      }))
    );
  };

  const handleAccept = async (user: FriendRequest) => {
    const { error } = await supabase
      .from("user_relationships1")
      .update({ status: "accepted" })
      .eq("id", user.id);
    if (error) { showError("Error: failed to accept request."); return; }
    setAccepted((prev) => new Set(prev).add(user.id));
    if (profile?.username) {
      sendPushNotification(
        user.otherUserId,
        "Charted",
        `Friend request accepted: ${profile.username}`
      );
    }
  };

  const handleReject = async (user: FriendRequest) => {
    const { error } = await supabase.from("user_relationships1").delete().eq("id", user.id);
    if (error) { showError("Error: failed to reject request."); return; }
    setRejected((prev) => new Set(prev).add(user.id));
    if (profile?.username) {
      sendPushNotification(
        user.otherUserId,
        "Charted",
        `Friend request denied: ${profile.username}`
      );
    }
  };

  const handleUnsend = async (id: string) => {
    const { error } = await supabase.from("user_relationships1").delete().eq("id", id);
    if (error) { showError("Error: failed to unsend request."); return; }
    setUnsent((prev) => new Set(prev).add(id));
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
            <Avatar username={user.username} avatarUrl={user.avatarUrl} />
            <Text style={styles.username}>{user.username}</Text>
            {accepted.has(user.id) ? (
              <View style={styles.acceptedBtn}>
                <Text style={styles.statusText}>Accepted</Text>
              </View>
            ) : rejected.has(user.id) ? (
              <View style={styles.rejectedBtn}>
                <Text style={styles.statusText}>Rejected</Text>
              </View>
            ) : (
              <View style={styles.actions}>
                <Pressable style={styles.acceptBtn} onPress={() => handleAccept(user)}>
                  <Text style={styles.acceptText}>Accept</Text>
                </Pressable>
                <Pressable style={styles.rejectBtn} onPress={() => handleReject(user)}>
                  <Text style={styles.rejectText}>Reject</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Sent Friend Requests</Text>
        {sent.length === 0 && (
          <Text style={styles.emptyText}>No sent friend requests.</Text>
        )}
        {sent.map((user) => (
          <View key={user.id} style={styles.card}>
            <Avatar username={user.username} avatarUrl={user.avatarUrl} />
            <Text style={styles.username}>{user.username}</Text>
            <Pressable
              style={unsent.has(user.id) ? styles.unsentBtn : styles.unsendBtn}
              onPress={() => handleUnsend(user.id)}
            >
              <Text style={styles.unsendText}>
                {unsent.has(user.id) ? "Unsent" : "Unsend Request"}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

       {/* Error Banner as seen in Figma design. Should appear on the bottom of the screen */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
          <Pressable onPress={() => setErrorMsg(null)} hitSlop={8}>
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>
      )}
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
    overflow: "hidden",
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
  acceptedBtn: {
    backgroundColor: "rgba(36, 62, 54, 0.6)",
    paddingVertical: 8,
    width: 152,
    alignItems: "center",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  rejectedBtn: {
    backgroundColor: "rgba(124, 169, 130, 0.8)",
    paddingVertical: 8,
    width: 152,
    alignItems: "center",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  statusText: {
    color: "#fff",
    fontFamily: Fonts.bold,
    fontSize: 13,
  },
  unsentBtn: {
    backgroundColor: "#8a9a8e",
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
  errorBanner: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#8B2020",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  errorBannerText: {
    flex: 1,
    color: "#fff",
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginRight: 12,
  },
});
