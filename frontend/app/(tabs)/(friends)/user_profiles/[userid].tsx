import LoadingPage from "@/components/loading-page";
import { useAuth } from "@/context/AuthContext";
import { Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { sendPushNotification } from "@/lib/push-notifications";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RelationshipStatus = "none" | "pending_sent" | "pending_received" | "accepted";

type ProfileData = {
  username: string;
  avatar_key: string | null;
  user_id: number;
  bio: string | null;
};

export default function UserProfilePage() {
  const { userid } = useLocalSearchParams<{ userid: string }>();
  const { profile: currentProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<RelationshipStatus>("none");
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  useEffect(() => {
    if (!userid || !currentProfile) return;
    fetchProfile();
    checkRelationship();
  }, [userid, currentProfile]);

  const fetchProfile = async () => {
    // THis part grabs the curent user's profile using UUID
    const { data: p } = await supabase
      .from("profiles")
      .select("username, avatar_key, user_id")
      .eq("id", userid)
      .single();

    if (!p) { setLoading(false); return; }

    // Get bio from users table, users are associated via profiles
    const { data: u } = await supabase
      .from("users")
      .select("bio")
      .eq("user_id", p.user_id)
      .single();

    if (p.avatar_key) {
      const urls = await getPhotoUrl([p.avatar_key]);
      setAvatarUrl(urls?.[0]?.url ?? null);
    }

    setProfileData({ username: p.username, avatar_key: p.avatar_key, user_id: p.user_id, bio: u?.bio ?? null });
    setLoading(false);
  };

  const checkRelationship = async () => {
    if (!currentProfile || !userid) return;
    const myUuid = currentProfile.id;

    const { data } = await supabase
      .from("user_relationships1")
      .select("id, requester_id, target_id, status")
      .or(
        `and(requester_id.eq.${myUuid},target_id.eq.${userid}),and(requester_id.eq.${userid},target_id.eq.${myUuid})`
      )
      .maybeSingle();

    if (!data) { setStatus("none"); return; }

    setRelationshipId(data.id);
    if (data.status === "accepted") {
      setStatus("accepted");
    } else if (data.status === "pending") {
      setStatus(data.requester_id === myUuid ? "pending_sent" : "pending_received");
    } else {
      setStatus("none");
    }
  };

  const handleRequest = async () => {
    if (!currentProfile || !userid) return;
    const { data, error } = await supabase
      .from("user_relationships1")
      .insert({ requester_id: currentProfile.id, target_id: userid, status: "pending" })
      .select("id")
      .single();
    if (!error && data) {
      setRelationshipId(data.id);
      setStatus("pending_sent");
      sendPushNotification(
        userid,
        "Charted",
        `Friend request received: ${currentProfile.username}`
      );
    }
  };

  const handleUnsend = async () => {
    if (!relationshipId) return;
    await supabase.from("user_relationships1").delete().eq("id", relationshipId);
    setRelationshipId(null);
    setStatus("none");
  };

  if (loading) return <LoadingPage />;

  return (
    <>
      <View style={{ marginTop: 45, marginLeft: 10 }}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
          <Text style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
          ) : (
            <Text style={styles.avatarInitial}>{profileData?.username?.[0]?.toUpperCase()}</Text>
          )}
        </View>

        <Text style={styles.username}>{profileData?.username ?? "Unknown"}</Text>
        <Text style={styles.bio}>{profileData?.bio ?? "No bio"}</Text>

        <View style={{ marginTop: 25, alignItems: "center", gap: 10 }}>
          {status === "none" && (
            <Pressable style={styles.requestButton} onPress={handleRequest}>
              <Text style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 17 }}>
                Request to be Friends
              </Text>
            </Pressable>
          )}

          {status === "pending_sent" && (
            <>
              <View style={styles.requestSentButton}>
                <Text style={{ fontFamily: Fonts.bold, color: "#333", fontSize: 17 }}>Requested</Text>
              </View>
              <Pressable style={styles.requestUnsendButton} onPress={handleUnsend}>
                <Text style={{ fontFamily: Fonts.bold, color: "#fefbea", fontSize: 15 }}>Unsend Request</Text>
              </Pressable>
            </>
          )}

          {status === "pending_received" && (
            <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: "#555" }}>
              This person sent you a friend request.
            </Text>
          )}

          {status === "accepted" && (
            <View style={styles.requestSentButton}>
              <Text style={{ fontFamily: Fonts.bold, color: "#333", fontSize: 17 }}>Friends</Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  username: {
    fontSize: 26,
    color: "#333",
    textAlign: "center",
    fontFamily: Fonts.bold,
  },
  bio: {
    fontSize: 15,
    marginHorizontal: 50,
    marginVertical: 4,
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
  requestButton: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    width: 250,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  requestSentButton: {
    backgroundColor: "#DEE9E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    width: 250,
    height: 50,
  },
  requestUnsendButton: {
    backgroundColor: "#7CA982",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    width: 250,
    height: 40,
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
    overflow: "hidden",
  },
  avatarInitial: {
    fontSize: 75,
    fontFamily: Fonts.regular,
    color: "#000",
  },
});
