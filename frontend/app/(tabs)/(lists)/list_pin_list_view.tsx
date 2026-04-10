import { Fonts } from "@/constants/theme";
import { setPinChanged } from "@/lib/pin_refresh_data";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ListCard from "../(home)/list_card";

export default function ListPinListView() {
  const { listIdToView } = useLocalSearchParams();
  const [pins, setPins] = useState<Pin[]>([]);
  const [listName, setListName] = useState("");
  const getListName = async (listId: any) => {
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

  useFocusEffect(
    useCallback(() => {
      setPinChanged(true);
    }, [])
  )

  useEffect(() => {
    getListPins(listIdToView);
    getListName(listIdToView);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.button}
          onPress={() => { router.back() }}>
          <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
          <Text
            style={styles.buttonText}
          >
            Back
          </Text>
        </Pressable>
        <Pressable
        style={styles.button}>
          <Text
          style={styles.buttonText}>
            Edit
          </Text>
        </Pressable>
      </View>
      <Text ellipsizeMode="tail" style={styles.title}>{listName}</Text>
      <View style={styles.spacer} />

      <FlatList
        data={pins}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.cards}
            onPress={() => {
              router.push({
                pathname: "/pins/[pinid]",
                params: { pinid: Number(item.id), viewMode: "" }
              }
              )
            }}
          >
            <ListCard name={item.name} pinId={item.id} loc={item.address} />
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    textAlign: "center"
  },
  button: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    position: "relative",
    paddingTop: 50,
    paddingRight: 16,
    paddingLeft: 16,
    zIndex: 10,
  },
  buttonText: { fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }
});