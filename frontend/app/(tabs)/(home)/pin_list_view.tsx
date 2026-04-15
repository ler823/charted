import { Fonts } from "@/constants/theme";
import { Pin } from "@/types/types";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, View, Text } from "react-native";
import ListCard from "./list_card";

type Props = {
  pins: Pin[];
};

export default function PinListView({ pins }: Props) {
  const router = useRouter();
  // const {cards} = useCards()
  // this is the context that should be set up with the database for viewing card locations. tutorial #22 i think for how to set it up

  return (
    <View>
      <View style={styles.spacer} />

      <FlatList
        data={pins}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.cards}
            onPress={() =>
              router.push({
                pathname: "/pins/[pinid]",
                params: {
                  pinid: String(item.pinIds?.[0]),
                },
              })
            }
          >
            <ListCard pinId={String(item.pinIds?.[0])} name={item.name} loc={item.address} userIds={item.userIds} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pins to display yet.</Text>
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
      fontSize: 14,
      color: "#243e36",
    },
});
