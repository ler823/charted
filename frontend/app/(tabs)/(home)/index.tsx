import { Ionicons } from "@expo/vector-icons";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import { Fonts } from "../../../constants/fonts";
import { Colors } from "../../../constants/theme";
import PinListView from "./pin_list_view";

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
      {!isDroppingPin && (
        <Pressable style={styles.plusButton}>
          <MaterialCommunityIcons name="plus" size={45} color="#fefbea" />
        </Pressable>
      )}
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
          style={StyleSheet.absoluteFillObject}
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
  plusButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    zIndex: 20,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#243e36",
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4
  }
});