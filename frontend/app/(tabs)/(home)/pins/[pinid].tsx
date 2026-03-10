import { Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Stars } from "@/components/stars";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { AutoSkeletonView } from "react-native-auto-skeleton";

export default function PinPage() {
  const { pinid } = useLocalSearchParams();

  return (
    <AutoSkeletonView isLoading={loading}> {/* set up the rest of the database and make this a hook that changes to false when loaded */}
      <ScrollView>
        {/* Image */}
        <Image source={require("@/assets/images/test_ss_creamery.png")} style={styles.img} placeholder="blur"/>

        {/* Title */}
        <View style={{marginHorizontal: 10}}>
          <Text style={[styles.title, {marginTop: 10}]}>Seaside Creamery</Text>
          <View>
            <Text style={styles.address}>1785 Palo Verde Ave,</Text>
            <Text style={styles.address}>Long Beach, CA 90815</Text>
          </View>

          {/* Stars */}
          {/* Need to add error handling here to make sure we get 1/2/3/4/5 as a num and nothing else */}
          <View style={styles.starRow}>
            <Stars starnum={4}/>
          </View>

          {/* Friend Visits */}
          <Text style={styles.subtitle}>
            Friends Who Have Visited
          </Text>
          <ScrollView horizontal style={styles.cardRow}>
            <Pressable style={styles.cardPartialRow}>
              <View style={{flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center"}}>
                <View style={[styles.avatar, {marginBottom: 10}]}></View>
                <Text style={{fontFamily: Fonts.bold, fontSize: 15,}}>OliverCJ</Text>
              </View>
            </Pressable>
            <Pressable style={styles.cardPartialRow}>
              <View style={{flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center"}}>
                <View style={[styles.avatar, {marginBottom: 10}]}></View>
                <Text style={{fontFamily: Fonts.bold, fontSize: 15,}}>TimTimTim</Text>
              </View>
            </Pressable>
          </ScrollView>

          {/* Notes */}
          <Text style={styles.subtitle}>
            My Notes
          </Text>
          <View style={styles.cardFullRow}>
            <Text style={styles.boxText}>You have no notes yet</Text>
          </View>

          {/* Friend Notes */}
          <Text style={styles.subtitle}>
            Friends' Notes
          </Text>
          <Pressable style={styles.cardFullRow}>
            {/* 
            Placeholder circle for now. 
            Picture will be added once figured out how to load pictures from cloud/db
            */}
            <View style={styles.avatar}></View>
            <View style={styles.cardInfo}>
              <Text style={styles.username}>seasideauthor</Text>
              <Text style={[styles.boxText, { paddingLeft: 15 }]}>
                They have pretty unique flavors.
              </Text>
            </View>
          </Pressable>

          {/* Tags */}
          <View style={styles.editRow}>
            <Text style={styles.subtitle}>
              Tags
            </Text>
          </View>
          <View style={styles.cardFullRow}>
            <Text style={styles.boxText}>You have no tags yet</Text>
          </View>

          {/* Lists */}
          <View style={styles.editRow}>
            <Text style={styles.subtitle}>
              Lists
            </Text>
          </View>
          <View style={styles.cardFullRow}>
            <Text style={styles.boxText}>You have no lists yet</Text>
          </View>

          {/* History */}
          <Text style={styles.subtitle}>
            Visit History
          </Text>
          <View style={styles.cardFullRow}>
            <Text style={styles.boxText}>You have no logged visits yet</Text>
          </View>
        </View>
      </ScrollView>

      { /* Back and Edit Buttons */ }
      <View style={styles.header}>
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.button}
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
          {/* Need to update the route and add a new page that copies the make-pin setup, but autofills with the specific pin's info */}
          <Pressable
            style={styles.button}
            onPress={() => {
              router.push("/make-pin");
            }}
          >
            <Text
              style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
            >
              Edit Pin
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
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    color: "#243e36",
    fontFamily: Fonts.bold
  },
  subtitle: {
    fontSize: 22,
    color: "#243e36",
    fontFamily: Fonts.regular
  },
  boxText: {
    fontSize: 14,
    color: "#243e36",
    fontFamily: Fonts.regular,
  },
  button: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    width: 105,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  img: {
    height: 200,
    width: "100%",
    top: 0,
  },
  address: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#243e36",
  },
  starRow: {
    flexDirection: "row",
    gap: 5,
    marginVertical: 10,
  },
  editRow: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  cardRow: {
    flexDirection: "row",
    gap: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0
  },
  cardFullRow: {
    backgroundColor: "#DEE9E0",
    padding: 12,
    marginBottom: 12,
    marginTop: 5,
    borderRadius: 5,
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  cardPartialRow: {
    backgroundColor: "#DEE9E0",
    padding: 12,
    marginBottom: 12,
    marginRight: 12,
    marginLeft: 2,
    marginTop: 5,
    borderRadius: 5,
    height: 120,
    width: 110,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
  },
  username: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    paddingLeft: 15,
    paddingBottom: 2,
  },
});
