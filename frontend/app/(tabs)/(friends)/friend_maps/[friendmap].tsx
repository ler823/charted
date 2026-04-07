import FriendHeader from "@/components/friend-header";
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
  const { friendmap } = useLocalSearchParams();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [pinLoading, setPinLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const loading = pinLoading || userLoading;
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
            .eq("user_id", Number(friendmap))
            .order("pin_id", { ascending: true })
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
          private: boolean;
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

        setPinLoading(false);
      }
      fetchLocations();
    }, [friendmap]),
    );

    const validPins = pins.filter(
        (p) => p.latitude !== 0 && p.longitude !== 0
    );

    {/* Will later change to just pull their pfp to display on the pins */}
    useEffect(() => {
      async function fetchUsers() {
        const { data } = await supabase
          .from("users")
          .select("user_id, username, location, bio")
          .eq("user_id", Number(friendmap))
          .single();
        setFriend(data);
        setUserLoading(false);
      }
      fetchUsers();
    }, []);

  if (loading) return <LoadingPage />;

  return (
    <>
    <FriendHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        viewOptions={VIEW_OPTIONS}
    />
    {viewMode === "map" && (
        <ClusteredMapView
            initialRegion={validPins.length > 0
                ? {
                    latitude: validPins[0].latitude,
                    longitude: validPins[0].longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                }
                : CSULB}
            style={{width: "100%", height: "100%"}}
            ref={mapRef}
            clusterColor="#243e36"
            clusterTextColor="#fefbea"
            clusterFontFamily="System"
        >
            {validPins
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
        <View style={{flex: 1, marginTop: 55}}>
            <PinListView pins={pins}/>
        </View>
    )}
    {viewMode === "grid" && (
        <View style={{marginTop: 55}}>
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
  
});