import { supabase } from "@/lib/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ClusteredMapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import PinMarker from "../../../components/pin-marker";
import PinListView from "./pin_list_view";

import DroppingPinOverlay from "@/components/dropping-pin-overlay";
import Header from "@/components/header";
import PinOverlay from "@/components/pin-overlay";
import { useDroppingPin } from "@/context/DroppingPinContext";
import { useLocation } from "@/hooks/use-location";
import { Coords, Pin, ViewMode, ViewOption } from "@/types/types";
import { useFocusEffect } from "expo-router";

// CSULB is default region if user does not share location
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
  const { isDroppingPin, setIsDroppingPin } = useDroppingPin();
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [pinCoords, setPinCoords] = useState<Coords | null>(null);
  const mapRef = useRef<any>(null);
  const { userCoords, permissionStatus, fetchUserLocation } = useLocation();
  const [region, setRegion] = useState(INITIAL_REGION);

  // This fetches data from the 'pins' table in Supabase. Also has error handling if unable to fetch
  useFocusEffect(
    useCallback(() => {
      async function fetchLocations() {
        const { data, error } = await supabase
          .from("pins")
          .select(
            `pin_id, location_id, user_id, name, address,
           locations:location_id( id, latitude, longitude )`,
          )
          .eq("user_id", 4);
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
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
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
                <PinMarker />
              </Marker>
            ))}
        </ClusteredMapView>
      )}
      {viewMode === "list" && (
        <View style={styles.cardsContainer}>
          <PinListView />
        </View>
      )}
      {viewMode === "grid" && <View style={styles.placeholder}></View>}
      {/* 
        PIN OVERLAY
      */}
      {selectedPin && (
        <PinOverlay selectedPin={selectedPin} setSelectedPin={setSelectedPin} />
      )}

      {/* Dropping pin overlay */}
      {isDroppingPin && <DroppingPinOverlay coords={pinCoords} />}
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
    bottom: 25,
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
