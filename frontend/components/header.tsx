import { Colors } from "@/constants/theme";
import { ViewMode, ViewOption } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type HeaderProps = {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  viewOptions: ViewOption[];
};

export default function Header({ viewMode, setViewMode, viewOptions }: HeaderProps) {
  return (
    <View style={styles.header}>
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
                  : mode === "list"
                  ? styles.pillOptionActiveList
                  : styles.pillOptionActiveGrid),
            ]}
          >
            <Ionicons name={icon} size={20} color={Colors.light.background} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: "center",
  },
  pill: {
    backgroundColor: "#fff",
    flexDirection: "row",
    borderRadius: 999,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.light.accentLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  pillOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillOptionActiveMap: {
    backgroundColor: Colors.light.accentLight,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  pillOptionActiveList: {
    backgroundColor: Colors.light.accentLight,
    borderRadius: 0,
  },
  pillOptionActiveGrid: {
    backgroundColor: Colors.light.accentLight,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
});
