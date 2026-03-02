import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import MapView from "react-native-maps";
import PinListView from "../pin_list_view";
import { Fonts } from "../../constants/fonts";
import { SearchBar } from "react-native-screens";

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
    <>
      <View style={styles.container}>
        {/* Pill */}
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

        {isPicking && (
          <View style={styles.crosshairContainer} pointerEvents="none">
            <Ionicons name="location-sharp" size={40} color="red" />
          </View>
        )}
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
      <View>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1/6,
    marginLeft: 8,
  },
  cardsContainer: {
    flex: 1,
  },
  pill: {
    position: "absolute",
    top: 20,
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
    top: 20,
    left: 167,
    backgroundColor: "#243e36",
    color: "#d9d9d9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    width: 105,
    height: 40,
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
