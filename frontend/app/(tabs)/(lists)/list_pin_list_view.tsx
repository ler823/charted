import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ListCard from "../(home)/list_card";

export default function ListPinListView() {
  const { listIdToView } = useLocalSearchParams();
  const [pins, setPins] = useState<Pin[]>([]);
  const [listName, setListName] = useState("");
  const getListName = async(listId: any) => {
    const { data, error } = await supabase 
      .from("lists")
      .select("name")
      .eq("list_id", listId)
    setListName(data?.[0].name);
  }
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
    const pinsInList: Pin[] = data?.map(pin => ({ id: pin.pins.pin_id, name: pin.pins.name, address: pin.pins.address, latitude: pin.pins.locations.latitude, longitude: pin.pins.locations.longitude }))
    setPins(pinsInList)
  }

  useEffect(() => {
    getListPins(listIdToView);
    getListName(listIdToView);
  }, []);

  return (
    <View>
      <SafeAreaView>
        <Pressable 
        style={styles.deleteBtn}
        onPress={() => {router.back()}}>
          <Text style={styles.cancelText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{listName}</Text>
        <View style={styles.spacer} />

        <FlatList
          data={pins}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.cards}
              onPress={() => {
                router.push({pathname: "/pins/[pinid]",
                  params: {pinid: Number(item.id), viewMode: ""}}
                )
              }}
            >
              <ListCard name={item.name} pinId={item.id} loc={item.address} />
            </Pressable>
          )}
        />
      </SafeAreaView>
    </View>
  )
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
  },
  deleteBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 10,
      padding: 16,
      backgroundColor: Colors.light.error,
      borderRadius: 999,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 4,
      marginTop: 24,
    },
    cancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});