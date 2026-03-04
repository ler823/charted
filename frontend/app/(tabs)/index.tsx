import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import { Fonts } from "../../constants/fonts";
import { Colors } from "../../constants/theme";
import PinListView from "../pin_list_view";

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

const VIEW_OPTIONS: { mode: ViewMode; icon: keyof typeof Ionicons.glyphMap }[] =
  [
    { mode: "map", icon: "map" },
    { mode: "list", icon: "list" },
    { mode: "grid", icon: "grid" },
  ];

export default function Home() {
  const { isDroppingPin, setIsDroppingPin } = useDroppingPin();
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  return (
    <View style={styles.container}>
      {/* Pill */}
      {!isDroppingPin && (
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
          <View>
            <Pressable style={styles.filter}>
              <Text style={
                {fontFamily: Fonts.bold,
                  color: "#d9d9d9",
                  fontSize: 16,
                }
                }>
                Filter
              </Text>
              <Ionicons name="chevron-down" size={20} color="#d9d9d9" />
            </Pressable>
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
        />
      )}
      {viewMode === "list" && (
        <View style={styles.cardsContainer}>
          <PinListView />
        </View>
      )}
      {viewMode === "grid" && (
        <View style={styles.placeholder}>
          <Ionicons name="grid" size={48} color="#ccc" />
        </View>
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
  cardsContainer: {
    top: 110,
    flex: 1,
  },
  searchbar: {
    backgroundColor: "#7ca982",
    justifyContent: "center",
    flexDirection: "row",
    width: 300,
    height: 40,
    borderRadius: 999,
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  pill: {
    position: "absolute",
    top: 60,
    marginLeft: 15,
    flexDirection: "row",
    backgroundColor: "#243e36",
    borderRadius: 999,
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  pillOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillOptionActiveMap: {
    backgroundColor: "#7ca982",
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },
  pillOptionActiveList: {
    backgroundColor: "#7ca982",
  },
  pillOptionActiveGrid: {
    backgroundColor: "#7ca982",
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  filter: {
    position: "absolute",
    backgroundColor: "#243e36",
    color: "#d9d9d9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    width: 105,
    height: 40,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
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
});
