import { Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ListItemsCard from "../(home)/list_item_card";

type listItems = {
  listId: string,
  name: string
};

export default function Lists() {
  const router = useRouter();
  const [lists, setLists] = useState<listItems[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const getUserLists = async () => {
    const { data, error } = await supabase
      .from("lists")
      .select(
        `
        list_id,
        name,
        users!lists_user_id_fkey (
          username
        )
      `,
      )
      .eq("users.username", "TimTimTim");

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setLists(data.map((list: any) => ({listId: list.list_id, name: list.name})))
    return data.map((list: any) => ({listId: list.list_id, name: list.name}));
  };

  const getListPins = async (listId: any) => {
    const { data, error } = await supabase
      .from("pin_lists")
      .select(`
        pins (
          pin_id,
          name,
          address,
          locations (
            latitude,
            longitude
          )
        )
      `)
      .eq("list_id", Number(listId))
    const pinsInList: Pin[] = data?.map(pin => ({id: pin.pins.pin_id, name: pin.pins.name, address: pin.pins.address, latitude: pin.pins.locations.latitude, longitude: pin.pins.locations.longitude }))
    setPins(pinsInList)
  }

  useFocusEffect(useCallback(() => {
    getUserLists();
  }, []))
  return (
    <SafeAreaView>
      <Text style={styles.title}>My Lists</Text>
      <View style={styles.spacer} />

      <FlatList
        data={lists}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.cards}
            onPress={() => {
              router.push(
                {
                  pathname: "/(tabs)/(lists)/list_pin_list_view",
                  params: {listIdToView: String(item.listId)}
                }
              )
            }}
          >
            <ListItemsCard name={item.name} listId={item.listId} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cards: {
    width: "100%",
    alignItems: "center",
  },
  spacer: {
    marginTop: 0,
  },
  listContent: {
    paddingBottom: 265,
  },
  title: {
    margin: 15,
    fontFamily: Fonts.bold,
    fontSize: 20,
  }
});
