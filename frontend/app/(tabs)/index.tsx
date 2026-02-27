import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import PinListView from "../pin_list_view";

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
  const [isPicking, setIsPicking] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  return (
    <View style={styles.container}>
      {/* Pill */}
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
              color={viewMode === mode ? "#fff" : "#555"}
            />
          </Pressable>
        ))}
      </View>

      {isPicking && (
        <View style={styles.crosshairContainer} pointerEvents="none">
          <Ionicons name="location-sharp" size={40} color="red" />
        </View>
      )}

      {viewMode === "map" && (
        <MapView
          initialRegion={INITIAL_REGION}
          style={styles.map}
          onLongPress={() => setIsPicking(true)}
        />
      )}
      {viewMode === "list" && (
        <View>
          <PinListView />
        </View>
      )}
      {viewMode === "grid" && (
        <View style={styles.placeholder}>
          <Ionicons name="grid" size={48} color="#ccc" />
        </View>
      )}
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
  crosshairContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -40 }],
    zIndex: 10,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
