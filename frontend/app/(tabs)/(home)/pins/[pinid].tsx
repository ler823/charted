import { Stars } from "@/components/stars";
import { Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
//import { AutoSkeletonView } from "react-native-auto-skeleton";
import { getPhotoUrl } from "@/app/make-pin";
import LoadingPage from "@/components/loading-page";


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
  pin_tags: {
    tags: {
      tag_id: number | null;
      name: string | null;
    } | null;
  }[] | null;
  pin_lists: {
    lists: {
      list_id: number | null;
      name: string | null;
    } | null;
  }[] | null;
  pin_visits: {
    visit_id: number | null;
    visit_timestamp: string | null;
  }[] | null;
  pin_photos: {
    photos: {
      photo_id: number | null;
      key: string | null;
    } | null;
  } | null;
  private: boolean | null;
};


export default function PinPage() {
  const { pinid, viewMode } = useLocalSearchParams();

  const [pin, setPin] = useState<Pin | null>(null);
  const [friends, setFriends] = useState<Friend[] | null>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState("")
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  useFocusEffect(
    useCallback(() => {
      async function fetchPin() {
        const { data, error } = await supabase
          .from("pins")
          .select(`*,
            pin_tags(tags( tag_id, name )),
            pin_lists(lists( list_id, name )),
            pin_visits( visit_id, visit_timestamp ),
            pin_photos(photos( photo_id, key ))` )
          .eq('pin_id', Number(pinid))
          .single();
        if (error) {
          Alert.alert(error.message)
          return;
        }
        setPin(data as Pin);
        getUrl(data as Pin);
      }

      async function getUrl(myPin: Pin) {
        if (myPin == null) {
          console.log("nulled out")
          return;
        }
        if (myPin.pin_photos[0] == null) {
          return;
        }
        if (myPin.pin_photos[0].photos.key == "") {
          return;
        }
        let uri = await getPhotoUrl(myPin.pin_photos[0].photos.key)
        setCoverPhoto(uri)
      }
      fetchPin();
      console.log("Got here between fxns")
    }, [pinid])
  );

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, username, location");
      setFriends(data ?? []);
      if (error) {
        Alert.alert(error.message)
        return;
      }
    }

    fetchUsers();

  }, []);

  if (!pin || !friends) {
    return <LoadingPage />
  }

  return (
    <>
      <ScrollView>
        {/* Image */}

        {coverPhoto == "" && (
          <Image source={require("@/assets/images/no_image_default.png")} style={styles.img} placeholder="blur" />
        )}
        {coverPhoto != "" && (
          <Image source={{ uri: coverPhoto }} style={styles.img} placeholder="blur" cachePolicy={"disk"} />
        )}

        <View style={{ marginHorizontal: 16 }}>
          {/* Title */}
          <View style={[styles.editRow, { alignItems: "center", alignContent: "center", marginTop: 10, marginRight: 25, gap: 6 }]}>
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
            <Text style={styles.address}>{pin.address ?? "No pin address"}</Text>
          </View>

          {/* Stars */}
          <View style={styles.starRow}>
            <Stars starnum={pin.user_rating} />
          </View>

          {/* Friend Visits */}
          <Text style={styles.subtitle}>
            Friends Who Have Visited
          </Text>
          <View style={{ marginHorizontal: -16 }}>
            <ScrollView horizontal style={styles.cardRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {friends?.length === 0 && (
                <Text style={styles.boxText}>None of your friends share this pin yet</Text>
              )}
              {friends?.map((friend) => (
                <Pressable key={friend?.user_id} style={styles.cardPartialRow} onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(home)/friend_profiles/[friendpf]",
                    params: {
                      friendpf: `${friend?.username}`
                    }
                  })}>
                  <View style={{ flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <View style={[styles.avatar, { marginBottom: 10 }]}>
                      <Text style={styles.avatarInitial}>{friend?.username?.[0]?.toUpperCase()}</Text>
                    </View>
                    <Text
                      style={{ fontFamily: Fonts.bold, fontSize: 15, }}
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
          <Text style={styles.subtitle}>
            My Notes
          </Text>
          <View style={styles.cardFullRow}>
            <Text style={styles.boxText}>{pin.user_note || "You have no notes yet"}</Text>
          </View>

          {/* Friend Notes */}
          <Text style={styles.subtitle}>
            Friends' Notes
          </Text>
          {/* Formatting for friend notes, once we implement that:
            <Pressable style={styles.cardFullRow}>
            <View style={styles.avatar}></View>
            <View style={styles.cardInfo}>
              <Text style={styles.username}>seasideauthor</Text>
              <Text style={[styles.boxText, { paddingLeft: 15 }]}>
                They have pretty unique flavors.
              </Text>
            </View>
          </Pressable>
          */}
          <View style={styles.cardFullRow}>
            <Text style={styles.boxText}>None of your friends share this pin yet</Text>
          </View>

          {/* Tags */}
          <View style={styles.editRow}>
            <Text style={styles.subtitle}>
              Tags
            </Text>
          </View>
          <View style={styles.cardFullRow}>
            <ScrollView contentContainerStyle={{ flexDirection: "row", gap: 20, flexWrap: "wrap" }}>
              {pin.pin_tags?.length === 0 && (
                <Text style={styles.boxText}>You have no tags yet</Text>
              )}
              {pin.pin_tags?.map((pin_tag) => (
                <Text key={pin_tag.tags?.tag_id} style={styles.boxText}>{pin_tag.tags?.name ?? "Unnamed tag"}</Text>
              ))}
            </ScrollView>
          </View>

          {/* Lists */}
          <View style={styles.editRow}>
            <Text style={styles.subtitle}>
              Lists
            </Text>
          </View>
          <View style={styles.cardFullRow}>
            <ScrollView contentContainerStyle={{ flexDirection: "row", gap: 20, flexWrap: "wrap" }}>
              {pin.pin_lists?.length === 0 && (
                <Text style={styles.boxText}>You have no lists yet</Text>
              )}
              {pin.pin_lists?.map((pin_list) => (
                <Text key={pin_list.lists?.list_id} style={styles.boxText}>{pin_list.lists?.name ?? "Unnamed list"}</Text>
              ))}
            </ScrollView>
          </View>

          {/* History */}
          <Text style={styles.subtitle}>
            Visit History
          </Text>
          <View style={[styles.cardFullRow, { height: 200, flexDirection: "column", alignItems: "flex-start" }]}>
            <ScrollView>
              {pin.pin_visits?.length === 0 && (
                <Text style={[styles.boxText, { marginTop: 10 }]}>You have no logged visits</Text>
              )}
              {pin.pin_visits?.map((pin_visit) => {
                if (!pin_visit.visit_timestamp) return null;
                const [year, month, day] = pin_visit.visit_timestamp.split("-").map(Number);
                const displayDate = `${month}/${day}/${year}`;
                return <Text style={styles.boxText} key={pin_visit.visit_id}>{displayDate}</Text>
              })}
            </ScrollView>
          </View>
          <View style={{ height: 100 }}>

          </View>

        </View>
      </ScrollView>

      { /* Back and Edit Buttons */}
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
                  viewMode: viewMode
                }
              })
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
    fontFamily: Fonts.bold
  },
  subtitle: {
    fontSize: 22,
    color: "#243e36",
    fontFamily: Fonts.regular
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
    right: 0
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
});
