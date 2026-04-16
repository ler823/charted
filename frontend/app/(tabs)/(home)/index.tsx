import PinMarker from "@/components/pin-marker";
import { supabase } from "@/lib/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ClusteredMapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import PinListView from "./pin_list_view";

import PinGridView from "@/app/(tabs)/(home)/pin_grid_view";
import DroppingPinOverlay from "@/components/dropping-pin-overlay";
import Header from "@/components/header";
import PinMarkers from "@/components/pin-markers";
import SharedPinMarkers from "@/components/pin-markers-shared";
import PinOverlay from "@/components/pin-overlay";
import { useDroppingPin } from "@/context/DroppingPinContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/hooks/use-location";
import { Coords, Pin, ViewMode, ViewOption } from "@/types/types";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { setPinChanged } from "../../../lib/pin_refresh_data";

const CSULB = {
  latitude: 33.7838,
  longitude: -118.1141,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const INITIAL_REGION = CSULB;

const VIEW_OPTIONS: ViewOption[] = [
  { mode: "map", icon: "map" },
  { mode: "list", icon: "list" },
  { mode: "grid", icon: "grid" },
];

export default function Home() {
  const { viewMode: incomingViewMode } = useLocalSearchParams<{
    viewMode?: ViewMode;
  }>();
  const { isDroppingPin, setIsDroppingPin } = useDroppingPin();
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>(incomingViewMode ?? "map");
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [pinCoords, setPinCoords] = useState<Coords | null>(null);
  const mapRef = useRef<any>(null);
  const { permissionStatus } = useLocation();
  const [region, setRegion] = useState(INITIAL_REGION);

  useFocusEffect(
    useCallback(() => {
    if (!profile) return;

    async function fetchPins() {
      const currentUserId = profile!.user_id;
      const currentUserUuid = profile!.id;

      // Get accepted friends from user_relationships1
      const { data: relData, error: relError } = await supabase
        .from("user_relationships1")
        .select("requester_id, target_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${currentUserUuid},target_id.eq.${currentUserUuid}`);

      if (relError) {
        console.log("Failed to fetch friends:", relError.message);
      }

      // Collect friend UUIDs (exclude self)
      const friendUuids: string[] = [];
      (relData ?? []).forEach((r: any) => {
        const other = r.requester_id === currentUserUuid ? r.target_id : r.requester_id;
        friendUuids.push(other);
      });

      // Convert friend UUIDs to integer user_ids
      let allUserIds: number[] = [currentUserId];
      if (friendUuids.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id")
          .in("id", friendUuids);
        if (profileData) {
          const friendIds = profileData
            .map((p: any) => p.user_id)
            .filter((id: any) => id != null) as number[];
          allUserIds = [...allUserIds, ...friendIds];
        }
      }

      // Fetch pin clusters that overlap with any of these user_ids
      const { data, error } = await supabase
        .from("pin_clusters")
        .select("*")
        .overlaps("user_ids", allUserIds);

      if (error) {
        console.error("Failed to fetch pins:", error.message);
        return;
      }

      const formattedPins: Pin[] = data.map((cluster: any) => ({
        id: String(cluster.cluster_id),
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        address: cluster.address,
        name: cluster.name,
        user_id: cluster.user_ids?.[0]?.toString() ?? "",
        isShared: cluster.is_shared,
        pinCount: cluster.pin_count,
        pinIds: cluster.pin_ids,
        userIds: cluster.user_ids,
      }));

      setPins(formattedPins);
    }

    setPinChanged(true);
    fetchPins();
  }, [profile])
  );

  return (
    <View style={styles.container}>
      {!isDroppingPin && viewMode === "map" && (
        <Pressable
          style={styles.plusButton}
          onPress={() => {
            setPinCoords({
              latitude: region.latitude,
              longitude: region.longitude,
            });
            setIsDroppingPin(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={45} color="#fefbea" />
        </Pressable>
      )}
      {!isDroppingPin && (
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          viewOptions={VIEW_OPTIONS}
          pins={pins}
        />
      )}

      {viewMode === "map" && (
        <ClusteredMapView
          initialRegion={INITIAL_REGION}
          style={styles.map}
          ref={mapRef}
          onRegionChangeComplete={(r) => {
            setPinCoords({
              latitude: r.latitude,
              longitude: r.longitude,
            });
            setRegion(r);
          }}
          onLongPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPinCoords({ latitude, longitude });
            setIsDroppingPin(true);
            mapRef.current?.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta:
                  region.latitudeDelta > 0.01 ? 0.01 : region.latitudeDelta,
                longitudeDelta:
                  region.longitudeDelta > 0.01 ? 0.01 : region.longitudeDelta,
              },
              300,
            );
          }}
          showsUserLocation={permissionStatus === "granted"}
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
                onPress={() => setSelectedPin(pin)}
                tracksViewChanges={false}
              >
                {pin.isShared ? (
                  <SharedPinMarkers
                    users_id={pin.userIds!}
                    number_shared={pin.pinCount!}
                  />
                ) : Number(pin.user_id) === profile?.user_id ? (
                  <PinMarker />
                ) : (
                  <PinMarkers users_id={Number(pin.user_id)} />
                )}
              </Marker>
            ))}
        </ClusteredMapView>
      )}

      {viewMode === "list" && (
        <View style={styles.cardsContainer}>
          <PinListView pins={pins} />
        </View>
      )}
      {viewMode === "grid" && (
        <View>
          <PinGridView pins={pins} />
        </View>
      )}

      {selectedPin && (
        <PinOverlay selectedPin={selectedPin} setSelectedPin={setSelectedPin} />
      )}

      {isDroppingPin && (
        <DroppingPinOverlay coords={pinCoords} viewMode={viewMode} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
  },
  cardsContainer: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  map: {
    width: "100%",
    height: "100%",
  },
});
