import AddTagOrList from "@/components/add-tag";
import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ListItemsCard from "../(home)/list_item_card";

type listItems = {
  listId: string,
  name: string
};

export default function Lists() {
  const router = useRouter();
  const [lists, setLists] = useState<listItems[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [addListModalVisible, setAddListModalVisible] = useState(false)
  const [newList, setNewList] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("user")

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
    setLists(data.map((list: any) => ({ listId: list.list_id, name: list.name })))
    return data.map((list: any) => ({ listId: list.list_id, name: list.name }));
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
    const pinsInList: Pin[] = data?.map(pin => ({ id: pin.pins.pin_id, name: pin.pins.name, address: pin.pins.address, latitude: pin.pins.locations.latitude, longitude: pin.pins.locations.longitude }))
    setPins(pinsInList)
  }

  const switchToUserView = async () => {
    setViewMode("user")
  }

  const switchToSharedView = async () => {
    setViewMode("shared")
  }

  useFocusEffect(useCallback(() => {
    getUserLists();
  }, []))
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
      <View style={styles.row}>
        <View style={styles.pill}>
          <Pressable
          onPress={switchToUserView}
            style={[
              styles.button,
              {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                backgroundColor: viewMode == "user" ? Colors.light.accent : Colors.light.background
              }]}>
            <Text
              style={styles.buttonText}>My Lists</Text>
          </Pressable>
          <Pressable
            onPress={switchToSharedView}
            style={[
              styles.button,
              {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                backgroundColor: viewMode == "shared" ? Colors.light.accent : Colors.light.background
              },]}>
            <Text
              style={styles.buttonText}>Shared Lists</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.button}>
          <Text
            style={styles.buttonText}>Edit</Text>
        </Pressable>
      </View>
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
                  params: { listIdToView: String(item.listId) }
                }
              )
            }}
          >
            <ListItemsCard name={item.name} listId={item.listId} />
          </Pressable>
        )}
      />
      <Pressable
        style={styles.plusButton}
        onPress={() => setAddListModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={45} color="#fefbea" />
      </Pressable>
      <AddTagOrList
        name="list"
        isVisible={addListModalVisible}
        onClose={() => setAddListModalVisible(false)}
        onSave={() => setAddListModalVisible(false)}
        newEntry={newList}
        setNewEntry={setNewList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
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
  },
  plusButton: {
    position: "absolute",
    bottom: 115,
    right: 25,
    zIndex: 20,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    backgroundColor: "#243e36",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    margin: 15,
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
  pill: {
    flexDirection: "row"
  }
});
