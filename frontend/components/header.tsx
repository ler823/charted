import { Fonts } from "@/constants/theme";
import { ViewMode, ViewOption } from "@/types/types";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type HeaderProps = {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  viewOptions: ViewOption[];
};

export default function Header({
  viewMode,
  setViewMode,
  viewOptions,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      {/* Search Bar and Settings*/}
      <View style={styles.row}>
        <Pressable style={styles.searchbar}>
          <Text
            style={{ fontFamily: Fonts.bold, color: "#fefbea", fontSize: 16 }}
          >
            Find a place
          </Text>
          <Ionicons name="search" size={16} color="#fefbea" />
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
          {viewOptions.map(({ mode, icon }) => (
            <Pressable
              key={mode}
              onPress={() => setViewMode(mode)}
              style={[
                styles.pillOption,
                viewMode === mode &&
                  (mode === "map"
                    ? styles.pillOptionActiveMap
                    : viewMode === "list"
                      ? styles.pillOptionActiveList
                      : styles.pillOptionActiveGrid),
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
            <Text
              style={{
                fontFamily: Fonts.bold,
                color: "#d9d9d9",
                fontSize: 16,
              }}
            >
              Filter
            </Text>
            <Ionicons name="chevron-down" size={20} color="#d9d9d9" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    shadowColor: "#000",
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
    shadowColor: "#000",
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
    shadowColor: "#000",
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
    width: 110,
    height: 40,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
});
