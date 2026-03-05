import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "@/lib/supabase";
import MapView, { Marker } from "react-native-maps";
import { Fonts } from "../../../constants/fonts";
import { Colors } from "../../../constants/theme";
import PinListView from "./pin_list_view";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import PinMarker from "../../../components/pin-marker";

import DroppingPinOverlay from "@/components/dropping-pin-overlay";
import { useDroppingPin } from "@/context/DroppingPinContext";

// CSULB as initial region (for now)
// Later it should be user's location if location services enabled
const INITIAL_REGION = {
  latitude: 33.7838,
  longitude: -118.1141,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type ViewMode = "map" | "list" | "grid";

type Pin = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

const VIEW_OPTIONS: { mode: ViewMode; icon: keyof typeof Ionicons.glyphMap }[] =
  [
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
        }))
      );
    }
    fetchLocations();
  }, []);

  return (
    <View style={styles.container}>
      {!isDroppingPin && (
        <View style={styles.header}>

          {/* Search Bar and Settings*/}
          <View style={styles.row}>
            <Pressable style={styles.searchbar}>
              <Text style={{fontFamily: Fonts.bold, color: "#fefbea", fontSize: 16}}>
                Find a place
              </Text>
              <FontAwesome name="search" size={20} color="#fefbea" />
            </Pressable>
            <View>
              <Pressable style={styles.settings}>
                <Ionicons name="settings" size={32} color="#243e36" />
              </Pressable>
            </View>
          </View>

          {/* Pill and Filter*/}
          <View style={styles.row}>
            <View style={styles.pill}>
              {VIEW_OPTIONS.map(({ mode, icon }) => (
                <Pressable
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  style={[
                    styles.pillOption,
                    viewMode === mode && (
                      mode === "map" 
                        ? styles.pillOptionActiveMap
                        : viewMode === "list"
                        ? styles.pillOptionActiveList
                        : styles.pillOptionActiveGrid
                    )
                  ]}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={viewMode === mode ? "#d9d9d9" : "#d9d9d9"}
                  />
                </Pressable>
              ))}
            </View>

            <View>
              <Pressable style={styles.filter}>
                <Text style={{fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16,}}>
                  Filter
                </Text>
                <Ionicons name="chevron-down" size={20} color="#d9d9d9" />
              </Pressable>
            </View>
          </View>
        </View>
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
                  console.log("Center coords:", {
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
          {pins.filter((pin) => pin.latitude !== 0 && pin.longitude !== 0).map((pin) => (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
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
      {viewMode === "grid" && (
        <View style={styles.placeholder}>
        </View>
      )}
      {/* 
        PIN OVERLAY
      */}
      {selectedPin && (
        <Pressable style={styles.backdrop} onPress={() => setSelectedPin(null)}>
          <Pressable style={styles.overlayCard} onPress={() => {}}>

            <View style={styles.picturePlaceholder}>
              <Ionicons name="image-outline" size={48} color="#bbb" />
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoText}>
                <Text style={styles.pinName}>{selectedPin.name}</Text>
                <Text style={styles.pinAddress}>{selectedPin.address}</Text>
              </View>
              <Ionicons name="expand-outline" size={20} color="#555" />
            </View>

          </Pressable>
        </Pressable>
      )}

      {/* Dropping pin overlay */}
      {isDroppingPin && <DroppingPinOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 45,
    paddingHorizontal: 15,
    zIndex: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  cardsContainer: {
    flex: 1,
  },
  searchbar: {
    backgroundColor: "#7ca982",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    width: 300,
    height: 40,
    borderRadius: 999,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  settings: {
    backgroundColor: "#7ca982",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 40,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  pill: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    borderRadius: 999,
    gap: 4,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  pillOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillOptionActiveMap: {
    backgroundColor: "#7ca982",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  pillOptionActiveList: {
    backgroundColor: "#7ca982",
    borderRadius: 0,
  },
  pillOptionActiveGrid: {
    backgroundColor: "#7ca982",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  filter: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    width: 105,
    height: 40,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  droppingPinOverlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  crosshairContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  droppingPinButtons: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    gap: 16,
  },
  cancelBtn: {
    padding: 16,
    backgroundColor: Colors.light.error,
    borderRadius: 999,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dropBtn: {
    padding: 16,
    backgroundColor: "#243e36",
    borderRadius: 999,
  },
  backdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "transparent",   
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  overlayCard: {
    width: "85%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  picturePlaceholder: {
    width: "100%",
    flex: 1,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  pinName: {
    fontSize: 12,
    fontWeight: "700",
    color: "162722",
  },
  pinAddress: {
    fontSize: 10,
    color: "#654236",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});