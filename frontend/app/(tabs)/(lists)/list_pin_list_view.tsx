import { Colors, Fonts } from "@/constants/theme";
import { setPinChanged } from "@/lib/pin_refresh_data";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ListCard from "../(home)/list_card";

export default function ListPinListView() {
  const { listIdToView, isShared } = useLocalSearchParams();
  const [pins, setPins] = useState<Pin[]>([]);
  const [listName, setListName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const userId = 4;

  const filteredPins = pins.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const onLeaveList = async () => {
    Alert.alert(
      "Are you sure you want to leave this list?",
      "This action cannot be undone.\nIf you want access to this list later, you will have to contact the list's owner",
      [
        { text: "Cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("list_members")
              .delete()
              .eq("list_id", listIdToView)
              .eq("viewer_id", userId)
            if (error) {
              console.log(error.message);
            }
            router.dismissAll();
            router.replace("/lists")
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      setPinChanged(true);
      getListPins(listIdToView)
      getListName(listIdToView)
    }, [])
  )

  useEffect(() => {

    getListName(listIdToView);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchText}
            placeholder="Search"
            placeholderTextColor="#fefbea"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={16} color={"#fefbea"} />
        </View>
        <Pressable style={styles.sortBtn}>
          <Text style={styles.sortText}>Sort</Text>
          <Ionicons name="chevron-down" size={14} color={"#fefbea"} />
        </Pressable>
      </View>
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
        {isShared == "false" && (
          <Pressable
            style={styles.button}>
            <Text
              style={styles.buttonText}
              onPress={() => {
                router.push(
                  {
                    pathname: "/(tabs)/(lists)/edit_list",
                    params: { listIdToView: listIdToView }
                  }
                )
              }}>
              Edit
            </Text>
          </Pressable>
        )}
        {isShared == "true" && (
          <Pressable
            style={styles.cancelButton}
            onPress={onLeaveList}>
            <Text style={styles.buttonText}>Leave this list</Text>
          </Pressable>
        )}
      </View>
      <Text ellipsizeMode="tail" style={styles.title}>{listName}</Text>
      <View style={styles.spacer} />

      <FlatList
        data={filteredPins}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={(
          <Text style={styles.text}>You have not added any pins to this list</Text>
        )}
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
    paddingTop: 50
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
    paddingVertical: 15,
    paddingRight: 16,
    paddingLeft: 16,
    zIndex: 10,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: "#d9d9d9",
    fontSize: 16
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,

  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: "#fefbea",
    fontFamily: Fonts.bold,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  sortText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: "#fefbea",
  },
  text: {
    margin: 15,
    fontFamily: Fonts.regular,
    fontSize: 16,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: Colors.light.error,
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
});