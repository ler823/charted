import { Fonts } from "@/constants/theme";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  name?: string;
  loc?: string;
};

export default function ListCard({ name, loc }: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={require("@/assets/images/no_image_default.png")}
        style={styles.img}
        placeholder="blur"
      />
      <View style={styles.textContainer}>
        <Text
          style={styles.cardTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name || "Unnamed Pin"}
        </Text>
        <Text
          style={styles.cardLoc}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {loc || "No address available"}
        </Text>
      </View>
    </View>
  );
}

/*
// dynamic return, for once database is set up
export default function ListCard({ photo, name, loc }) {
    return (
        <View style={styles.card}>
              <Image source={photo} style={styles.img} />
              <View style={styles.textContainer}>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                    {name}
                </Text>
                <Text
                  style={styles.cardLoc}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                    // will need to add location information if the user has their location on
                    {loc} miles away
                </Text>
              </View>
          </View>
    );
}
*/

const styles = StyleSheet.create({
  img: {
    width: 65,
    height: 65,
    resizeMode: "cover",
    aspectRatio: 1,
    borderRadius: 9,
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

  textContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },

  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    paddingBottom: 1,
    flexShrink: 1,
  },

  cardLoc: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    flexShrink: 1,
  },
});