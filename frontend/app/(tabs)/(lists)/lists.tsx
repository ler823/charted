import AddTagOrList from "@/components/add-tag";
import Sort from "@/components/sort-lists";
import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ListItemsCard from "../(home)/list_item_card";

type ListType = {
  name: string;
  privacy: number;
}

type listItems = {
  listId: string,
  name: string,
  username: string | null,
  date: string,
  userId: number,
  public: boolean,
};

const SKELETON_COUNT = 7;

function SkeletonCard({ opacity, shared }: { opacity: Animated.Value; shared: boolean }) {
  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonImg} />
      <View style={styles.skeletonText}>
        <View style={styles.skeletonTitle} />
        {shared && <View style={styles.skeletonSub} />}
      </View>
    </Animated.View>
  );
}

export default function Lists() {
  const router = useRouter();
  const { profile } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);
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
    setNewList({ name: "", privacy: 1 })
    refreshLists();
  };

  const getUserFriends = async () => {
    const { data, error } = await supabase
      .from("user_relationships1")
      .select(`
            requester:profiles!user_relationships_requester_id_fkey (
            user_id,
            username
            ),
            target:profiles!user_relationships_target_id_fkey (
            user_id,
            username
            )
            `)
      .or(`requester_id.eq.${profile?.id},target_id.eq.${profile?.id}`)
      .eq("status", "accepted");
    if (error) {
      Alert.alert("Error", error.message);
    }

    var friendsFromDb = data?.map(({ requester, target }) => (

      requester.user_id == profile?.user_id
        ? Number(target.user_id)
        : Number(requester.user_id)
    )) ?? []

    return friendsFromDb
  }

  const getUserLists = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("lists")
      .select("list_id, name, created_at, user_id")
      .eq("user_id", profile.user_id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    const userLists = data.map((list: any) => ({ listId: list.list_id, name: list.name, username: null, date: list.created_at, userId: list.user_id, public: false }));
    handleSort(userLists);
  };

  const getFriendLists = async () => {
    const friends = await getUserFriends();
    const { data: listMemberData, error: listMemberError } = await supabase
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
          username,
          user_id
        )
      `,
      )
      .eq("viewer_id", profile?.user_id ?? 0)

    if (listMemberError) {
      Alert.alert("Error", listMemberError.message);
      return;
    }

    const { data: sharedListData, error: sharedListError } = await supabase
      .from("lists")
      .select(`
        list_id,
        user_id,
        name,
        privacy,
        created_at,
        users!lists_user_id_fkey (
          username
        )
      `)
      .in("user_id", friends)
      .eq("privacy", 2)
    const friendLists = listMemberData.map((list: any) => ({ listId: list.list_id, name: list.lists.name, username: list.users.username, date: list.lists.created_at, userId: list.users.user_id, public: false }))
    const sharedLists = sharedListData?.map((list: any) => ({ listId: list.list_id, name: list.name, username: list.users.username, date: list.created_at, userId: list.user_id, public: true }))
    sharedLists?.forEach((item) => friendLists.push(item))
    setLists(friendLists.sort((a, b) => a.date.localeCompare(b.date)))
  }

  const switchToUserView = async () => {
    setViewMode("user")
    setLoading(true)
  }

  const switchToSharedView = async () => {
    setViewMode("shared")
    setLoading(true)
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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Lists</Text>
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

      {loading ? (
        <View style={styles.listContent}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} opacity={pulseAnim} shared={viewMode === "shared"} />
          ))}
        </View>
      ) : (
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
                    params: { listIdToView: String(item.listId), isShared: viewMode == "user" ? "false" : "true", canLeave: item.public ? "false": "true" }
                  }
                )
              }}
            >
              {viewMode == "user" && (
                <ListItemsCard name={item.name} listId={item.listId} />
              )}
              {viewMode == "shared" && (
                <ListItemsCard name={item.name} listId={item.listId} user={item.username} userIds={[item.userId]} />
              )}
            </Pressable>
          )}
        />
      )}
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
  heading: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: "#243e36",
    paddingHorizontal: 16,
    paddingBottom: 10,
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
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#888",
    marginTop: 40,
    textAlign: "center",
    paddingHorizontal: 30,
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
    paddingBottom: 10,
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
  },
  skeletonCard: {
    backgroundColor: "#DEE9E0",
    padding: 12,
    margin: 5,
    borderRadius: 5,
    height: 80,
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  skeletonImg: {
    width: 65,
    height: 65,
    borderRadius: 9,
    backgroundColor: "#c5d4c8",
  },
  skeletonText: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
    gap: 6,
  },
  skeletonTitle: {
    height: 16,
    width: "55%",
    borderRadius: 8,
    backgroundColor: "#c5d4c8",
  },
  skeletonSub: {
    height: 12,
    width: "35%",
    borderRadius: 8,
    backgroundColor: "#c5d4c8",
  },
});
