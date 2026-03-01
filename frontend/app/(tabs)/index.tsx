import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import { Colors } from "../../constants/theme";

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
      {/* Map / List / Grid */}
      {viewMode === "map" && (
        <MapView
          initialRegion={INITIAL_REGION}
          style={styles.map}
          onLongPress={() => {
            setIsDroppingPin(true);
          }}
        />
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
      {/* {isDroppingPin && (
        <View style={styles.droppingPinOverlay} pointerEvents="box-none">
          <View style={styles.crosshairContainer}>
            <MaterialCommunityIcons name="crosshairs" size={36} color="black" />
          </View>
          <View style={styles.droppingPinButtons}>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => setIsDroppingPin(false)}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.dropBtn} onPress={handleDropPin}>
              <Text style={styles.btnText}>Drop Pin</Text>
            </Pressable>
          </View>
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pill: {
    position: "absolute",
    top: 40,
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
