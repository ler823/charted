import Header from "@/components/header";
import LoadingPage from "@/components/loading-page";
import PinMarker from "@/components/pin-marker";
import PinOverlay from "@/components/pin-overlay";
import { Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Pin, ViewMode, ViewOption } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ClusteredMapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import PinGridView from "../../(home)/pin_grid_view";
import PinListView from "../../(home)/pin_list_view";


type Friend = {
  user_id: number;
  username: string;
  location: string | null;
  bio: string | null;
};

// CSULB is default region if user does not share location
const CSULB = {
  latitude: 33.7838,
  longitude: -118.1141,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

const VIEW_OPTIONS: ViewOption[] = [
  { mode: "map", icon: "map" },
  { mode: "list", icon: "list" },
  { mode: "grid", icon: "grid" },
];

export default function FriendMap() {
  const { friendid } = useLocalSearchParams();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [pins, setPins] = useState<Pin[]>([]);
  const mapRef = useRef<any>(null);
  const { viewMode: incomingViewMode } = useLocalSearchParams<{ viewMode?: ViewMode }>();
  const [viewMode, setViewMode] = useState<ViewMode>(incomingViewMode ?? "map");
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  // This fetches data from the 'pins' table in Supabase. Also has error handling if unable to fetch
    useFocusEffect(
      useCallback(() => {
        async function fetchLocations() {
          const { data, error } = await supabase
            .from("pins")
            .select(
              `pin_id, location_id, user_id, name, address, private,
             locations:location_id( id, latitude, longitude )`,
            )
            .eq("user_id", 4)
            .eq("private", false);
          if (error) {
            console.error("Failed to fetch locations:", error.message);
            return;
          }
  
          const typedData = data as unknown as {
            pin_id: number;
            name: string;
            address: string;
            location_id: number;
            user_id: number;
            locations?: {
              id: number;
              latitude: number;
              longitude: number;
            } | null;
          }[];
  
          setPins(
            typedData.map((row) => ({
              id: String(row.pin_id),
              name: row.name,
              address: row.address,
              latitude: row.locations?.latitude ?? 0,
              longitude: row.locations?.longitude ?? 0,
            })),
          );
        }
        fetchLocations();
      }, []),
    );

    const initial_region = pins.length > 0
    ? {
      latitude: pins[0].latitude,
      longitude: pins[0].longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }
    : CSULB;

    {/* Will later change to just pull their pfp to display on the pins */}
  useEffect(() => {
      async function fetchUsers() {
        const { data } = await supabase
          .from("users")
          .select("user_id, username, location, bio")
          .eq("user_id", Number(friendid))
          .single();
        setFriend(data);
        setLoading(false);
      }
      fetchUsers();
    }, []);

  if (loading) return <LoadingPage />;

  return (
    <>
    <View style={{ marginTop: 45, marginHorizontal: 10, flexDirection: "row", justifyContent: "space-between" }}>
        <Pressable
          style={styles.backButton}
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
    </View>
    <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        viewOptions={VIEW_OPTIONS}
    />
    {viewMode === "map" && (
        <ClusteredMapView
            initialRegion={initial_region}
            style={{width: "100%", flex: 1}}
            ref={mapRef}
            clusterColor="#243e36"
            clusterTextColor="#fefbea"
            clusterFontFamily="System"
        >
            {pins
            .filter((pin) => pin.latitude !== 0 && pin.longitude !== 0)
            .map((pin) => (
                <Marker
                key={pin.id}
                coordinate={{
                    latitude: pin.latitude,
                    longitude: pin.longitude,
                }}
                tracksViewChanges={false}
                onPress={() => setSelectedPin(pin)}
                >
                <PinMarker />
                </Marker>
            ))}
        </ClusteredMapView>
    )}

    {viewMode === "list" && (
        <View style={{flex: 1}}>
            <PinListView pins={pins}/>
        </View>
    )}
    {viewMode === "grid" && (
        <View>
            <PinGridView pins={pins} />
        </View>
    )}
    {/* 
    PIN OVERLAY
    */}
    {selectedPin && (
        <PinOverlay selectedPin={selectedPin} setSelectedPin={setSelectedPin} />
    )}
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    width: 105,
    height: 40,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  infoBox: {
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#DEE9E0",
    marginVertical: 12,
    height: 225,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  infoWindow: {
    height: 145,
    width: "90%",
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#7CA982",
    marginVertical: 10,
    alignItems: "center",
  },
});