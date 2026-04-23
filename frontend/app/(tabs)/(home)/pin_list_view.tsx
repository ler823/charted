import { Fonts } from "@/constants/theme";
import { Pin } from "@/types/types";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ListCard from "./list_card";

type Props = {
  pins: Pin[];
  emptyMessage?: string;
};

export default function PinListView({ pins, emptyMessage = "No pins to display yet." }: Props) {
  const router = useRouter();

  return (
    <View>
      <View style={styles.spacer} />

      <FlatList
        data={pins}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const pinId = item.pinIds?.[0];
          if (!pinId) return null;

          const handlePress = () => {
            if (item.isShared) {
              router.push({
                pathname: "/select-pins/[selectid]",
                params: {
                  selectid: JSON.stringify(item.pinIds),
                },
              });
            } else {
              router.push({
                pathname: "/pins/[pinid]",
                params: {
                  pinid: String(pinId),
                },
              });
            }
          };

          return (
            <Pressable style={styles.cards} onPress={handlePress}>
              <ListCard
                pinId={String(pinId)}
                name={item.name}
                loc={item.address}
                userIds={item.userIds}
              />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cards: {
    width: "100%",
    alignItems: "center",
  },
  spacer: {
    marginTop: 165,
  },
  listContent: {
    paddingBottom: 265,
  },
  emptyContainer: {
      marginTop: 45,
      alignItems: "center",
    },
    emptyText: {
      fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 30,
    },
});
