import { Fonts } from "@/constants/theme";
import { Pin } from "@/types/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, Share, StyleSheet, Text, View } from "react-native";

type Props = {
  pins: Pin[];
};

export default function PinGridView({ pins }: Props) {
  const [savedPins, setSavedPins] = useState<number[]>([]);

  const handleSaveToggle = (pinId: number) => {
    setSavedPins((prev) =>
      prev.includes(pinId)
        ? prev.filter((id) => id !== pinId)
        : [...prev, pinId]
    );
  };

  const handleShare = async (pin: Pin) => {
    try {
      await Share.share({
        message: `Check out this pin: ${pin.name || "Unnamed Pin"}${pin.address ? `\n${pin.address}` : ""}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  return (
    <FlatList
      data={pins}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const isSaved = savedPins.includes(Number(item.id));

        return (
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
                  placeholder="blur"
                />
              </View>

              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.name || "Unnamed Pin"}
              </Text>

              <Text style={styles.cardLoc} numberOfLines={3}>
                {item.address || "No address available"}
              </Text>
            </Pressable>

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.actionButton}
                onPress={() => handleSaveToggle(Number(item.id))}
              >
                <Text style={styles.actionText}>
                  {isSaved ? "Unsave" : "Save"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => handleShare(item)}
              >
                <Text style={styles.actionText}>Share</Text>
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
    paddingLeft: 20,
    paddingRight: 5,
    paddingTop: 170,
    paddingBottom: 24,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#DEE9E0",
    borderRadius: 8,
    padding: 10,
    width: "48%",
    minHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },

  imgPlaceholder: {
    width: "100%",
    height: 110,
    borderRadius: 9,
    backgroundColor: "#cfd8d1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 9,
  },

  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    marginBottom: 4,
    color: "#000",
  },

  cardLoc: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: "#000",
    marginBottom: 10,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: "auto",
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#B7CDBB",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },

  actionText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: "#243e36",
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