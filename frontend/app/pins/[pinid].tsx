import { Stars } from "@/components/stars";
import { Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
//import { AutoSkeletonView } from "react-native-auto-skeleton";
import LoadingPage from "@/components/loading-page";
import { getPhotoUrl } from "@/lib/photo-utils";
import { getPinChanged, setPinChanged } from "@/lib/pin_refresh_data";

type Friend = {
  user_id: number;
  username: string;
  location: string | null;
};

type Pin = {
  pin_id: number | null;
  location_id: number | null;
  user_id: number | null;
  user_rating: number | null;
  user_note: string | null;
  name: string | null;
  address: string | null;
  pin_tags:
    | {
        tags: {
          tag_id: number | null;
          name: string | null;
        } | null;
      }[]
    | null;
  pin_lists:
    | {
        lists: {
          list_id: number | null;
          name: string | null;
        } | null;
      }[]
    | null;
  pin_visits:
    | {
        visit_id: number | null;
        visit_timestamp: string | null;
      }[]
    | null;
  pin_photos:
    | {
        photos: {
          photo_id: number | null;
          key: string | null;
        } | null;
        cover: boolean | null;
      }[]
    | null;
  private: boolean | null;
};

type Cluster = {
  pin_ids: number[];
  user_ids: number[];
}

type Notes = {
  user_id: number;
  user_note: string | null;
  users: {
    username: string;
  } | null;
}

export default function PinPage() {
  const { pinid, viewMode } = useLocalSearchParams();

  const [pin, setPin] = useState<Pin | null>(null);
  const [friends, setFriends] = useState<Friend[] | null>([]);
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [notes, setNotes] = useState<Notes[] | null>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [photoList, setPhotoList] = useState<string[] | null>(null);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  useFocusEffect(
    useCallback(() => {
      async function fetchPin() {
        const { data, error } = await supabase
          .from("pins")
          .select(
            `*,
            pin_tags(tags( tag_id, name )),
            pin_lists(lists( list_id, name )),
            pin_visits( visit_id, visit_timestamp ),
            pin_photos(photos( photo_id, key ), cover)`,
          )
          .eq("pin_id", Number(pinid))
          .single();
        if (error) {
          Alert.alert(error.message);
          return;
        }
        setPin(data as Pin);
        getPhotos(data as Pin);
      }

      async function getPhotos(myPin: Pin) {
        if (
          myPin == null ||
          myPin.pin_photos?.[0] == null ||
          myPin.pin_photos?.[0].photos?.key == ""
        ) {
          setCoverPhoto("");
          return;
        }
        const coverPhotoKey = myPin.pin_photos
          ?.filter((pin_photo) => pin_photo.cover)
          .flatMap((pin_photo) => pin_photo?.photos?.key);
        const otherPhotoKeys = myPin.pin_photos
          ?.filter((pin_photo) => !pin_photo.cover)
          .flatMap((pin_photo) => pin_photo.photos?.key);
        const coverPhotoUri = (await getPhotoUrl(coverPhotoKey))[0].url;
        const otherPhotoUris = (await getPhotoUrl(otherPhotoKeys)).flatMap(
          (otherPhoto) => otherPhoto.url,
        );
        setCoverPhoto(coverPhotoUri);
        setPhotoList(otherPhotoUris);
      }
      if (getPinChanged()) {
        setPinChanged(false);
        fetchPin();
      }
    }, [pinid]),
  );

  useEffect(() => {
    async function fetchSharedPins() {
      const { data, error } = await supabase
      .from("pin_clusters")
      .select("pin_ids, user_ids")
      .contains("pin_ids", [Number(pinid)])
      .single();

      if (error) {
        console.log(error.message);
        return;
      }

      setCluster(data);
    }
    fetchSharedPins();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      if (!cluster || !pin) return;
      if (!cluster?.user_ids?.length) return;

      const filteredUserIds = cluster?.user_ids?.filter((id) => id !== pin?.user_id) ?? [];

      const { data, error } = await supabase
        .from("users")
        .select("user_id, username, location")
        .in("user_id", filteredUserIds ?? []);
      setFriends(data ?? []);
      if (error) {
        Alert.alert(error.message);
        return;
      }
    }
    fetchUsers();
  }, [cluster, pin]);

  useEffect(() => {
    async function fetchUserNotes() {
      if (!cluster?.pin_ids?.length) return;

      const filteredPinIds = cluster?.pin_ids?.filter((id) => id !== pin?.pin_id) ?? [];

      const { data, error } = await supabase
        .from("pins")
        .select("user_id, user_note, users:user_id( username )")
        .in("pin_id", filteredPinIds ?? []);

        const normalized = (data ?? []).map((row) => ({
          user_id: row.user_id,
          user_note: row.user_note,
          users: Array.isArray(row.users)
          ? row.users[0] ?? null
          : row.users ?? null,
        }));

      setNotes(normalized);
      if (error) {
        Alert.alert(error.message);
        return;
      }
    }
    fetchUserNotes();
  }, [cluster, pin]);

  if (!pin || !friends || coverPhoto == null) {
    return <LoadingPage />;
  }

  return (
    <>
      <ScrollView>
        {/* Image */}

        <Image
          source={
            coverPhoto
              ? { uri: coverPhoto }
              : require("@/assets/images/no_image_default.png")
          }
          style={styles.img}
          transition={500}
          placeholder={"blur"}
          placeholderContentFit="cover"
        />

        <View style={{ marginHorizontal: 16 }}>
          {/* Title */}
          <View
            style={[
              styles.editRow,
              {
                alignItems: "center",
                alignContent: "center",
                marginTop: 10,
                marginRight: 25,
                gap: 6,
              },
            ]}
          >
            <Text style={styles.title}>{pin.name ?? "No pin name"}</Text>
            {pin.private === true && (
              <Ionicons name="lock-closed" size={20} color="#243e36" />
            )}
            {pin.private === false && (
              <Ionicons name="people" size={20} color="#243e36" />
            )}
          </View>

          {/* Address */}
          <View>
            <Text style={styles.address}>
              {pin.address ?? "No pin address"}
            </Text>
          </View>

          {/* Stars */}
          <View style={styles.starRow}>
            <Stars starnum={pin.user_rating} />
          </View>

          {/* Friend Visits */}
          <Text style={styles.subtitle}>Friends Who Have Visited</Text>
          <View style={{ marginHorizontal: -16 }}>
            {friends?.length === 0 && (
                <View style={[styles.cardFullRow, {width: "92%", alignSelf: "center"}]}>
                  <Text style={styles.boxText}>
                    None of your friends share this pin yet
                  </Text>
                </View>
              )}
            <ScrollView
              horizontal
              style={styles.cardRow}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {friends?.map((friend) => (
                <Pressable
                  key={friend?.user_id}
                  style={styles.cardPartialRow}
                >
                  <View
                    style={{
                      flexDirection: "column",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View style={[styles.avatar, { marginBottom: 10 }]}>
                      <Text style={styles.avatarInitial}>
                        {friend?.username?.[0]?.toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      style={{ fontFamily: Fonts.bold, fontSize: 15 }}
                      adjustsFontSizeToFit
                      minimumFontScale={0.5}
                      numberOfLines={1}
                    >
                      {friend?.username ?? "Unnamed friend"}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Notes */}
          <Text style={styles.subtitle}>My Notes</Text>
          <View style={styles.cardFullRow}>
            <Text style={styles.boxText}>
              {pin.user_note || "You have no notes yet"}
            </Text>
          </View>

          {/* Friend Notes */}
          <Text style={styles.subtitle}>Friends' Notes</Text>
          {notes?.length === 0 && (
            <View style={styles.cardFullRow}>
              <Text style={styles.boxText}>
                None of your friends share this pin yet
              </Text>
            </View>
          )}
          {notes?.length! > 0 && (
            <FlatList
              data={notes}
              keyExtractor={(item, index) =>
                `${item.user_id}-${index}`
              }
              scrollEnabled={false}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <Pressable style={styles.cardFullRow}>
                  {/* Avatar */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarInitial}>
                      {item.users?.username?.[0]?.toUpperCase() ?? ""}
                    </Text>
                  </View>

                  {/* Content */}
                  <View style={styles.cardInfo}>
                    <Text style={styles.username}>
                      {item.users?.username ?? "Unknown user"}
                    </Text>

                    <Text style={[styles.boxText, {marginLeft: 15}]}>
                      {item.user_note || "No note added"}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          )}

          {/* Tags */}
          <View style={styles.editRow}>
            <Text style={styles.subtitle}>Tags</Text>
          </View>
          <View style={styles.cardFullRow}>
            <ScrollView
              contentContainerStyle={{
                flexDirection: "row",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              {pin.pin_tags?.length === 0 && (
                <Text style={styles.boxText}>You have no tags yet</Text>
              )}
              {pin.pin_tags?.map((pin_tag) => (
                <Text key={pin_tag.tags?.tag_id} style={styles.boxText}>
                  {pin_tag.tags?.name ?? "Unnamed tag"}
                </Text>
              ))}
            </ScrollView>
          </View>

          {/* Lists */}
          <View style={styles.editRow}>
            <Text style={styles.subtitle}>Lists</Text>
          </View>
          <View style={styles.cardFullRow}>
            <ScrollView
              contentContainerStyle={{
                flexDirection: "row",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              {pin.pin_lists?.length === 0 && (
                <Text style={styles.boxText}>You have no lists yet</Text>
              )}
              {pin.pin_lists?.map((pin_list) => (
                <Text key={pin_list.lists?.list_id} style={styles.boxText}>
                  {pin_list.lists?.name ?? "Unnamed list"}
                </Text>
              ))}
            </ScrollView>
          </View>

          {/* History */}
          <Text style={styles.subtitle}>Visit History</Text>
          <View
            style={[
              styles.cardFullRow,
              {
                height: 200,
                flexDirection: "column",
                alignItems: "flex-start",
              },
            ]}
          >
            <ScrollView>
              {pin.pin_visits?.length === 0 && (
                <Text style={[styles.boxText, { marginTop: 10 }]}>
                  You have no logged visits
                </Text>
              )}
              {pin.pin_visits?.map((pin_visit) => {
                if (!pin_visit.visit_timestamp) return null;
                const [year, month, day] = pin_visit.visit_timestamp
                  .split("-")
                  .map(Number);
                const displayDate = `${month}/${day}/${year}`;
                return (
                  <Text style={styles.boxText} key={pin_visit.visit_id}>
                    {displayDate}
                  </Text>
                );
              })}
            </ScrollView>
          </View>
          <Text style={styles.subtitle}>Photos</Text>
          <View style={[styles.cardFullRow]}>
            {(photoList == null || photoList.length == 0) && (
              <Text style={styles.boxText}>You have added no photos</Text>
            )}
            <FlatList
              horizontal
              data={photoList}
              keyExtractor={(photo) => photo}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/image-view",
                      params: { uri: encodeURIComponent(item) },
                    })
                  }
                >
                  <Image
                    source={{ uri: item }}
                    style={styles.photoCarousel}
                    transition={500}
                  />
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            />
          </View>
          <View style={{ height: 100 }}></View>
        </View>
      </ScrollView>

      {/* Back and Edit Buttons */}
      <View style={styles.header}>
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.button}
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
            <Text
              style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
            >
              Back
            </Text>
          </Pressable>
          {/* Need to update the route and add a new page that copies the make-pin setup, but autofills with the specific pin's info */}
          <Pressable
            style={styles.button}
            onPress={() => {
              router.push({
                pathname: "/make-pin",
                params: {
                  pinId: pin.pin_id,
                  viewMode: viewMode,
                },
              });
            }}
          >
            <Text
              style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
            >
              Edit
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    color: "#243e36",
    fontFamily: Fonts.bold,
  },
  subtitle: {
    fontSize: 22,
    color: "#243e36",
    fontFamily: Fonts.regular,
  },
  boxText: {
    fontSize: 14,
    color: "#243e36",
    fontFamily: Fonts.regular,
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
  img: {
    height: 200,
    width: "100%",
    top: 0,
  },
  address: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#243e36",
  },
  starRow: {
    flexDirection: "row",
    gap: 5,
    marginVertical: 10,
  },
  editRow: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  cardRow: {
    flexDirection: "row",
    gap: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
  },
  cardFullRow: {
    backgroundColor: "#DEE9E0",
    padding: 12,
    marginBottom: 12,
    marginTop: 5,
    borderRadius: 5,
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  cardPartialRow: {
    backgroundColor: "#DEE9E0",
    padding: 12,
    marginBottom: 12,
    marginTop: 5,
    borderRadius: 5,
    height: 120,
    width: 110,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 999,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 28,
    fontFamily: Fonts.regular,
    color: "#000",
  },
  cardInfo: {
    flex: 1,
  },
  username: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    paddingLeft: 15,
    paddingBottom: 2,
  },
  photoCarousel: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
});
