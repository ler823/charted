import AddTagOrList from "@/components/add-tag";
import LoadingPage from "@/components/loading-page";
import Sort from "@/components/sort-lists";
import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Pin } from "@/types/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ListItemsCard from "../(home)/list_item_card";

type ListType = {
  name: string;
  privacy: number;
}

type listItems = {
  listId: string,
  name: string,
  username: string | null,
  date: string
};

export default function Lists() {
  const router = useRouter();
  const { profile } = useAuth();
  const [lists, setLists] = useState<listItems[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [addListModalVisible, setAddListModalVisible] = useState(false)
  const [newList, setNewList] = useState<ListType>({ name: "", privacy: 1 })
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("user")
  const [sortModalVisible, setSortModalVisible] = useState(false)
  const [sortChoice, setSortChoice] = useState("date")
  const [ascending, setAscending] = useState(true)
  const [loading, setLoading] = useState(true)
  
  const filteredLists = lists.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = async (list: listItems[]) => {
    if (sortChoice == "date") {
      if (ascending) {
        setLists(list.sort((a, b) => a.date.localeCompare(b.date)))
      }
      else {
        setLists(list.sort((a, b) => b.date.localeCompare(a.date)))
      }
    }
    else {
      if (ascending) {
        setLists(list.sort((a, b) => a.name.localeCompare(b.name)))
      }
      else {
        setLists(list.sort((a, b) => b.name.localeCompare(a.name)))
      }
    }
  }

  const addList = async () => {
    if (!newList) {
      Alert.alert("Missing field", "Please enter a name for the new list");
      return;
    }
    if (!profile) return;
    let listToAdd = {
      user_id: profile.user_id,
      name: newList.name,
      privacy: newList.privacy,
    };

    const { error: addListError } = await supabase.from("lists").insert(listToAdd);
    if (addListError) {
      Alert.alert(
        "This list has already been added",
        "You have added a list with this name before",
      );
      return;
    }
    setAddListModalVisible(false);
    setNewList({name: "", privacy: 1})
    refreshLists();
  };

  const getUserLists = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("lists")
      .select("list_id, name, created_at")
      .eq("user_id", profile.user_id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    const userLists = data.map((list: any) => ({ listId: list.list_id, name: list.name, username: null, date: list.created_at }));
    handleSort(userLists);
  };

  const getFriendLists = async () => {
    const { data, error } = await supabase
      .from("list_members")
      .select(
        `
        viewer_id,
        list_id,
        lists (
          name,
          privacy,
          created_at
        ),
        users!list_members_creator_id_fkey (
          username
        )
      `,
      )
      .eq("viewer_id", profile?.user_id ?? 0)

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
  const friendLists = data.map((list: any) => ({ listId: list.list_id, name: list.lists.name, username: list.users.username, date: list.lists.created_at }))
  setLists(friendLists.sort((a, b) => a.date.localeCompare(b.date)))
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

  const switchToUserView = async () => {
    setViewMode("user")
  }

  const switchToSharedView = async () => {
    setViewMode("shared")
  }

  const refreshLists = async () => {
    if (viewMode == "user") {
      await getUserLists();
    }
    else if (viewMode == "shared") {
      await getFriendLists();
    }
    setLoading(false)
  }

  useFocusEffect(useCallback(() => {
    refreshLists();
  }, [viewMode, sortModalVisible]))

  if (loading) return <LoadingPage />;
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchText}
            placeholder="Find a list"
            placeholderTextColor="#fefbea"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={16} color={"#fefbea"} />
        </View>
        <Pressable style={styles.sortBtn} onPress={() => setSortModalVisible(true)}>
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
              style={styles.buttonText}>Friend Lists</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.spacer} />

      <FlatList
        data={filteredLists}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => viewMode == "shared" ? (searchQuery == "" ? (
          <Text style={styles.text}>Your friends are not sharing any lists with their friends</Text>
        ) : (
          <Text style={styles.text}>No lists found matching the query</Text>
        )) : (searchQuery == "" ? (
          <Text style={styles.text}>You do not have any lists</Text>
        ) : (
          <Text style={styles.text}>No lists found matching the query</Text>
        ))}
        renderItem={({ item }) => (
          <Pressable
            style={styles.cards}
            onPress={() => {
              router.push(
                {
                  pathname: "/(tabs)/(lists)/list_pin_list_view",
                  params: { listIdToView: String(item.listId), isShared: viewMode == "user" ? "false" : "true" }
                }
              )
            }}
          >
            {viewMode == "user" && (
              <ListItemsCard name={item.name} listId={item.listId} />
            )}
            {viewMode == "shared" && (
              <ListItemsCard name={item.name} listId={item.listId} user={item.username} />
            )}
          </Pressable>
        )}
      />
      {viewMode == "user" && (
        <Pressable
          style={styles.plusButton}
          onPress={() => setAddListModalVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={45} color="#fefbea" />
        </Pressable>
      )}
      <AddTagOrList
        name="list"
        isVisible={addListModalVisible}
        onClose={() => setAddListModalVisible(false)}
        onSave={addList}
        newEntry={newList}
        setNewEntry={setNewList}
      />
      <Sort 
      contentType="list"
      isVisible={sortModalVisible} 
      onClose={() => setSortModalVisible(false)}
      sortChoice={sortChoice}
      setSortChoice={setSortChoice}
      ascending={ascending}
      setAscending={setAscending}
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
  text: {
    margin: 15,
    fontFamily: Fonts.regular,
    fontSize: 16,
    textAlign: "center",
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
    marginTop: 5,
  },
  button: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    // padding: 16,
    height: 40,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: "#fefbea",
    fontSize: 16
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,

  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accent,
    borderRadius: 999,
    height: 40,
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
    fontSize: 16,
    color: "#fefbea",
    fontFamily: Fonts.bold,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accent,
    borderRadius: 999,
    height: 40,
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
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#fefbea",
  },
  pill: {
    flexDirection: "row"
  }
});
