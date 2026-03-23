import { Fonts } from "@/constants/theme";
import { Pin } from "@/types/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  pins: Pin[];
};

export default function PinGridView({ pins }: Props) {
  return (
    <FlatList
      data={pins}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        return (
          <View style={styles.shadowWrapper}>
            <View style={styles.card}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/pins/[pinid]",
                    params: {
                      pinid: item.id,
                    },
                  })
                }
              >
                <View style={styles.imgPlaceholder}>
                  <Image
                    source={require("@/assets/images/no_image_default.png")}
                    style={styles.image}
                    contentFit="cover"
                    placeholder="blur"
                  />
                </View>

                <View style={styles.textContainer}>
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name || "Unnamed Pin"}
                  </Text>

                  <Text
                    style={styles.cardLoc}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.address || "No address available"}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pins to display yet.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 170,
    paddingBottom: 95,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 5,
  },

  shadowWrapper: {
    width: "48%",
    shadowColor: "#000",
    marginHorizontal: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  card: {
    backgroundColor: "#DEE9E0",
    borderRadius: 12,
    overflow: "hidden",
  },

  imgPlaceholder: {
    width: "100%",
    height: 110,
    backgroundColor: "#cfd8d1",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  textContainer: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
  },

  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    marginBottom: 2,
    color: "#000",
  },

  cardLoc: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#000",
  },

  emptyContainer: {
    flex: 1,
    marginTop: 40,
    alignItems: "center",
  },

  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#243e36",
  },
});
