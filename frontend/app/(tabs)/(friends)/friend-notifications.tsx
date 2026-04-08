import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// temp data just like Figma design
// impement real data once auth is set up
const MOCK_RECEIVED = [
  { id: 1, username: "Preston" },
  { id: 2, username: "TimTimTim" },
];

const MOCK_SENT = [
  { id: 3, username: "Sage_123" },
];

function Avatar({ username }: { username: string }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarInitial}>{username?.[0]?.toUpperCase()}</Text>
    </View>
  );
}

export default function FriendNotifications() {
  const router = useRouter();
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const [rejected, setRejected] = useState<Set<number>>(new Set());
  const [unsent, setUnsent] = useState<Set<number>>(new Set());

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
        {/* 
        Received Friend Requests Section with Temp Data
        */}
        {MOCK_RECEIVED.map((user) => (
          <View key={user.id} style={styles.card}>
            <Avatar username={user.username} />
            <Text style={styles.username}>{user.username}</Text>
            {accepted.has(user.id) ? (
              <View style={styles.acceptedBtn}>
                <Text style={styles.acceptedText}>Accepted</Text>
              </View>
            ) : rejected.has(user.id) ? (
              <View style={styles.rejectedBtn}>
                <Text style={styles.acceptedText}>Rejected</Text>
              </View>
            ) : (
              <View style={styles.actions}>
                <Pressable style={styles.acceptBtn} onPress={() => setAccepted(prev => new Set(prev).add(user.id))}>
                  <Text style={styles.acceptText}>Accept</Text>
                </Pressable>
                <Pressable style={styles.rejectBtn} onPress={() => setRejected(prev => new Set(prev).add(user.id))}>
                  <Text style={styles.rejectText}>Reject</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Sent Friend Requests</Text>

        {/* 
        Sent Friend Requests Section with Temp Data
        */}
        {MOCK_SENT.map((user) => (
          <View key={user.id} style={styles.card}>
            <Avatar username={user.username} />
            <Text style={styles.username}>{user.username}</Text>
            <Pressable
              style={unsent.has(user.id) ? styles.unsentBtn : styles.unsendBtn}
              onPress={() => !unsent.has(user.id) && setUnsent(prev => new Set(prev).add(user.id))}
            >
              <Text style={styles.unsendText}>
                {unsent.has(user.id) ? "Unsent" : "Unsend Request"}
              </Text>
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
  backText: {
    color: "#fefbea",
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  scroll: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
    width: "100%",
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
  acceptedText: {
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