import { supabase } from "@/lib/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import PinMarker from "../../../components/pin-marker";
import PinListView from "./pin_list_view";

import DroppingPinOverlay from "@/components/dropping-pin-overlay";
import Header from "@/components/header";
import PinOverlay from "@/components/pin-overlay";
import { useDroppingPin } from "@/context/DroppingPinContext";
import { Pin, ViewMode, ViewOption } from "@/types/types";

// CSULB as initial region (for now)
// Later it should be user's location if location services enabled
const INITIAL_REGION = {
  latitude: 33.7838,
  longitude: -118.1141,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

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

  // This fetches data from the 'locations' table in Supabase. Also has error handling if unable to fetch
  useEffect(() => {
    async function fetchLocations() {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, address, latitude, longitude");
      if (error) {
        console.error("Failed to fetch locations:", error.message);
        return;
      }
      setPins(
        (data ?? []).map((row) => ({
          id: String(row.id),
          name: row.name,
          address: row.address,
          latitude: row.latitude ?? 0,
          longitude: row.longitude ?? 0,
        })),
      );
    }
    fetchLocations();
  }, []);

  const [pinCoords, setPinCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  return (
    <View style={styles.container}>
      {!isDroppingPin && (
        <Pressable
          style={styles.plusButton}
          onPress={() => setIsDroppingPin(true)}
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
        <MapView
          initialRegion={INITIAL_REGION}
          style={styles.map}
          onLongPress={() => {
            setIsDroppingPin(true);
          }}
          onRegionChangeComplete={
            isDroppingPin
              ? (region) => {
                  setPinCoords({
                    latitude: region.latitude,
                    longitude: region.longitude,
                  });
                }
              : undefined
          }
        >
          {/* 
            controls pin marker, takes from pin-marker component
          */}
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
        </MapView>
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
