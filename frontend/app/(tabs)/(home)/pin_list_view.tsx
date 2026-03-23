import { Pin } from "@/types/types";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
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
                  pinid: item.id,
                },
              })
            }
          >
            <ListCard name={item.name} loc={item.address} />
          </Pressable>
        )}
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
});
