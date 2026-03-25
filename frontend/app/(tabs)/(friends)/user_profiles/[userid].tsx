import LoadingPage from "@/components/loading-page";
import { Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Friend = {
  user_id: number;
  username: string;
  location: string | null;
  bio: string | null;
};

export default function FriendProfilePage() {
  const { userid } = useLocalSearchParams();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
      async function fetchUsers() {
        const { data } = await supabase
          .from("users")
          .select("user_id, username, location, bio")
          .eq("user_id", Number(userid))
          .single();
        setFriend(data);
        setLoading(false);
      }
      fetchUsers();
    }, []);

  if (loading) return <LoadingPage />;

  if (!requestSent) return (
    <>
      <View style={{ marginTop: 45, marginLeft: 10 }}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
          <Text
            style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
          >
            Back
          </Text>
        </Pressable>
      </View>
      {/* Profile Picture */}
      {/* NOTE: will need to adjust later once pfp est: move the lower pfp into the upper one and replace the .username? check with .pfp? check */}
      <View style={styles.container}>
        {!friend?.username && (
          <View style={styles.avatar} />
        )}
        {friend?.username && (
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{friend.username?.[0]?.toUpperCase()}</Text>
          </View>
        )}

        {/* Username and Bio */}
        <Text style={styles.username}>{friend?.username ?? "Username Unavailable"}</Text>
        <Text style={styles.bio}>{friend?.bio ?? "No bio"}</Text>

        {/* Request to be Friends Button */}
        <View style={{ marginTop: 25}}>
          <Pressable
            style={styles.requestButton}
            onPress={() => {setRequestSent(true)}}
          >
            <Text
              style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 17 }}
            >
              Request to be Friends
            </Text>
          </Pressable>
        </View>
        <View style={{ marginTop: 250}}>
          <Pressable
            style={styles.requestUnsendButton}
            onPress={() => {
              router.push({
              pathname: "/friend_profiles/[friendid]",
              params: {
                friendid: `${friend?.user_id}`
              }})
            }}
          >
            <Text
              style={{ fontFamily: Fonts.bold, color: "#fefbea", fontSize: 15 }}
            >
              For testing: see profile
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );

  if (requestSent) return (
    <>
      <View style={{ marginTop: 45, marginLeft: 10 }}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
          <Text
            style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
          >
            Back
          </Text>
        </Pressable>
      </View>
      {/* Profile Picture */}
      {/* NOTE: will need to adjust later once pfp est: move the lower pfp into the upper one and replace the .username? check with .pfp? check */}
      <View style={styles.container}>
        {!friend?.username && (
          <View style={styles.avatar} />
        )}
        {friend?.username && (
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{friend.username?.[0]?.toUpperCase()}</Text>
          </View>
        )}

        {/* Username and Bio */}
        <Text style={styles.username}>{friend?.username ?? "Username Unavailable"}</Text>
        <Text style={styles.bio}>{friend?.bio ?? "No bio"}</Text>

        {/* Request to be Friends Button */}
        <View style={[styles.requestSentButton, { marginTop: 25}]}>
            <Text
              style={{ fontFamily: Fonts.bold, color: "#333", fontSize: 17 }}
            >
              Requested
            </Text>
        </View>
        <View style={{ marginTop: 10}}>
          <Pressable
            style={styles.requestUnsendButton}
            onPress={() => {setRequestSent(false)}}
          >
            <Text
              style={{ fontFamily: Fonts.bold, color: "#fefbea", fontSize: 15 }}
            >
              Unsend Request
            </Text>
          </Pressable>
        </View>
      </View>
    </>
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
  },
  avatarInitial: {
    fontSize: 75,
    fontFamily: Fonts.regular,
    color: "#000",
  },
});
