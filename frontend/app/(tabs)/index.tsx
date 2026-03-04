import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Colors } from "../../constants/theme";
import PinMarker from "../../components/pin-marker";

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

/**
 * This is temporary/placeholder data. For the purpose of testing
 * Real data will be queried from database in the future
 */
const PINS: Pin[] = [
  {
    id: "1",
    name: "University Student Union",
    address: "1212 N Bellflower Blvd, Long beach, CA",
    latitude: 33.7838,
    longitude: -118.1141,
  },
  {
    id: "2",
    name: "Seaside Creamery",
    address: "1785 Palo Verde Ave, Long Beach, CA 90815",
    latitude: 33.788277,
    longitude: -118.108657,
  },
  {
    id: "3",
    name: "Shady Tree",
    address: "CSULB - Upper Quad",
    latitude: 33.778647,
    longitude: -118.112355,
  }
];

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

  return (
    <View style={styles.container}>
      {/* Map / List / Grid */}
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
          {PINS.map((pin) => (
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
        <View style={styles.placeholder}>
          <Ionicons name="list" size={48} color="#ccc" />
        </View>
      )}
      {viewMode === "grid" && (
        <View style={styles.placeholder}>
          <Ionicons name="grid" size={48} color="#ccc" />
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
      {/* View pill — hidden when dropping pin */}
      {!isDroppingPin && (
        <View style={styles.pill}>
          {VIEW_OPTIONS.map(({ mode, icon }) => (
            <Pressable
              key={mode}
              onPress={() => setViewMode(mode)}
              style={[
                styles.pillOption,
                viewMode === mode && styles.pillOptionActive,
              ]}
            >
              <Ionicons
                name={icon}
                size={18}
                color={viewMode === mode ? "#fff" : Colors.light.background}
              />
            </Pressable>
          ))}
        </View>
      )}

      {/* Dropping pin overlay */}
      {isDroppingPin && <DroppingPinOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pill: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 999,
    padding: 4,
    gap: 4,
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  pillOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillOptionActive: {
    backgroundColor: "#243e36",
  },
  map: {
    width: "100%",
    height: "100%",
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
    transform: [{ translateX: -20 }, { translateY: -40 }],
    zIndex: 10,
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
});
