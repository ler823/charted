import { Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stars } from "@/components/light-stars";

export default function Account() {
  return (
    <ScrollView>
      <View style={{ marginTop: 45, marginHorizontal: 10, flexDirection: "row", justifyContent: "flex-end" }}>
        <Pressable
          style={styles.editAccountButton}
          onPress={() => {
            router.push("/edit_account");
          }}
        >
          <Text style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}>
            Edit Account
          </Text>
        </Pressable>
      </View>

      <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatar} />

        {/* Username, Location, Bio */}
        <Text style={styles.username}>Username</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={17} color="#333" />
          <Text style={[styles.location, { paddingLeft: 2 }]}>Location</Text>
        </View>
        <Text style={styles.bio}>Bio</Text>

        {/* Stats */}
        <View style={styles.infoBox}>
          <Text style={styles.header}>Statistics</Text>
          <View style={[styles.statsRow, { gap: 20 }]}>
            <View style={[styles.infoWindow, { width: "42%", alignItems: "center" }]}>
              <Text style={styles.subHeader}>Favorite</Text>
              <View style={styles.statsWindows} />
              <View style={styles.statsBar}>
                <View style={{ flexDirection: "row", gap: 1, justifyContent: "center" }}>
                  <Stars starnum={4} />
                </View>
              </View>
            </View>
            <View style={[styles.infoWindow, { width: "42%", alignItems: "center" }]}>
              <Text style={styles.subHeader}>Top Visited</Text>
              <View style={styles.statsWindows} />
              <View style={styles.statsBar}>
                <Text
                  style={{ fontFamily: Fonts.regular, fontSize: 16, color: "#fefbea", marginHorizontal: 7, flexShrink: 1 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  — Visits
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Activity */}
        <View style={styles.infoBox}>
          <Text style={styles.header}>Recent Activity</Text>
          <View style={[styles.infoWindow, { justifyContent: "center" }]}>
            <View style={styles.activityRow}>
              <View style={styles.locAvatar} />
              <Text style={{ fontFamily: Fonts.bold, fontSize: 14, marginLeft: 13 }}>Visited: </Text>
              <Text
                style={{ fontFamily: Fonts.regular, fontSize: 14, flexShrink: 1, marginRight: 13 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                —
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.activityRow}>
              <View style={styles.locAvatar} />
              <Text style={{ fontFamily: Fonts.bold, fontSize: 14, marginLeft: 13 }}>Friend Added: </Text>
              <Text
                style={{ fontFamily: Fonts.regular, fontSize: 14, flexShrink: 1, marginRight: 13 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                —
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.activityRow}>
              <View style={styles.locAvatar} />
              <Text style={{ fontFamily: Fonts.bold, fontSize: 14, marginLeft: 13 }}>New Pin: </Text>
              <Text
                style={{ fontFamily: Fonts.regular, fontSize: 14, flexShrink: 1, marginRight: 13 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                —
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
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
  location: {
    fontFamily: Fonts.bold_i,
    fontSize: 15,
  },
  bio: {
    fontSize: 15,
    marginHorizontal: 50,
    marginTop: 3,
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
    fontFamily: Fonts.regular_i,
  },
  editAccountButton: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 8,
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
  locAvatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "93%",
  },
  divider: {
    height: 1,
    width: "75%",
    marginLeft: 30,
    backgroundColor: "#7ca982",
    marginVertical: 5,
  },
  infoBox: {
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#DEE9E0",
    marginVertical: 12,
    height: 225,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  header: {
    fontFamily: Fonts.regular,
    fontSize: 35,
    color: "#333",
    marginTop: 10,
  },
  subHeader: {
    fontFamily: Fonts.regular_i,
    fontSize: 23,
    color: "#333",
    marginVertical: 5,
  },
  infoWindow: {
    height: 145,
    width: "90%",
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#7CA982",
    marginVertical: 10,
    alignItems: "center",
  },
  statsWindows: {
    height: 96,
    width: "88%",
    backgroundColor: "#d9d9d9",
  },
  statsBar: {
    backgroundColor: "#243e36",
    width: "65%",
    height: 25,
    position: "absolute",
    alignSelf: "flex-start",
    marginTop: 118,
    marginLeft: -2,
    borderTopRightRadius: 12,
    justifyContent: "center",
  },
});
