import LoadingPage from "@/components/loading-page";
import Sort from "@/components/sort-lists";
import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getPhotoUrl } from "@/lib/photo-utils";
import { setPinChanged } from "@/lib/pin_refresh_data";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ListCard from "../(home)/list_card";

type PinWithDate = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  date: string;
  user_id: number;
}

export default function ListPinListView() {
  const { listIdToView, isShared, canLeave } = useLocalSearchParams();
  const [pins, setPins] = useState<PinWithDate[]>([]);
  const [listName, setListName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortModalVisible, setSortModalVisible] = useState(false)
  const [sortChoice, setSortChoice] = useState("date")
  const [ascending, setAscending] = useState(true)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth();
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  console.log(canLeave + ", " + isShared)

  const handleSort = async (pin: PinWithDate[]) => {
    if (sortChoice == "date") {
      if (ascending) {
        setPins(pin.sort((a, b) => a.date.localeCompare(b.date)))
      }
      else {
        setPins(pin.sort((a, b) => b.date.localeCompare(a.date)))
      }
    }
    else {
      if (ascending) {
        setPins(pin.sort((a, b) => a.name.localeCompare(b.name)))
      }
      else {
        setPins(pin.sort((a, b) => b.name.localeCompare(a.name)))
      }
    }
  }

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
        created_at,
            pins (
              pin_id,
              name,
              address,
              user_id,
              locations (
                latitude,
                longitude
              )
            )
          `)
      .eq("list_id", Number(listId))
    const pinsInList: PinWithDate[] = data?.map(pin => ({ id: pin.pins.pin_id, name: pin.pins.name, address: pin.pins.address, latitude: pin.pins.locations.latitude, longitude: pin.pins.locations.longitude, date: pin.created_at, user_id: pin.pins.user_id }))
    handleSort(pinsInList)
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
              .eq("viewer_id", profile?.user_id)
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

  const refreshPins = async () => {
    setPinChanged(true);
    await getListPins(listIdToView)
    await getListName(listIdToView)
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      refreshPins()
    }, [sortModalVisible])
  )

  useEffect(() => {
    getListName(listIdToView);
  }, []);

  useEffect(() => {
    setCoverPhoto(null);
    if (!listIdToView) return;

    async function fetchCoverPhoto() {
      const { data } = await supabase
        .from("lists")
        .select("photos(key)")
        .eq("list_id", listIdToView)
        .single();

      if (data?.photos === null) return;
      const coverEntry = data.photos.key;
      console.log(coverEntry)
      if (coverEntry === undefined) return;
      const urls = await getPhotoUrl([coverEntry]);
      if (urls?.[0]?.url) setCoverPhoto(urls[0].url);
    }

    fetchCoverPhoto();
  }, [listIdToView]);

  if (loading) return <LoadingPage />;

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
        <Pressable style={styles.sortBtn} onPress={() => setSortModalVisible(true)}>
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
            style={styles.button}
            onPress={() => {
              router.push(
                {
                  pathname: "/(tabs)/(lists)/edit_list",
                  params: { listIdToView: listIdToView }
                }
              )
            }}>
            <Text style={styles.buttonText}>
              Edit
            </Text>
          </Pressable>
        )}
        {isShared == "true" && canLeave == "true" && (
          <Pressable
            style={styles.cancelButton}
            onPress={onLeaveList}>
            <Text style={styles.buttonText}>Leave this list</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.namePhotoRow}>
        <Image
          source={
            coverPhoto
              ? { uri: coverPhoto }
              : require("@/assets/images/no_image_default.png")
          }
          style={styles.img}
          contentFit="cover"
          transition={300}
          placeholder="blur"
        />
        <Text ellipsizeMode="tail" style={styles.title}>{listName}</Text>
      </View>
      <View style={styles.spacer} />

      <FlatList
        data={filteredPins}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={(
          <Text style={styles.text}>There are no pins in this list</Text>
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
            <ListCard name={item.name} pinId={item.id} loc={item.address} userIds={[item.user_id]} />
          </Pressable>
        )}
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
    // padding: 16,
    height: 40,
    paddingHorizontal: 16,
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
    paddingVertical: 5,
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
    // padding: 16,
    height: 40,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  img: {
    width: 90,
    height: 90,
    resizeMode: "cover",
    aspectRatio: 1,
    borderRadius: 9,
  },
  namePhotoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  }
});