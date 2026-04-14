import { Fonts } from "@/constants/theme";
import { Pin, ViewMode, ViewOption } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import SuggestionItem from "./suggestion-item";

type HeaderProps = {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  viewOptions: ViewOption[];
  pins: Pin[];
};

// ─── Header ─────────────────────────────────────────────────────────────────
export default function Header({
  viewMode,
  setViewMode,
  viewOptions,
  pins = [],
}: HeaderProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const suggestions =
    query.trim().length > 0
      ? pins
          .filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()))
          .sort((a, b) => {
            const q = query.toLowerCase();
            const aStarts = a.name?.toLowerCase().startsWith(q);
            const bStarts = b.name?.toLowerCase().startsWith(q);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return 0;
          })
          .slice(0, 5)
      : [];

  const showSuggestions = isFocused && query.trim().length > 0;

  return (
    <>
      {/* Full-screen backdrop to catch outside taps */}
      {isFocused && (
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setIsFocused(false);
          }}
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}
      <View style={styles.header}>
        {/* Search Bar and Settings */}
        <View style={styles.row}>
          <View
            style={[styles.searchbar, isFocused && styles.searchbarFocused]}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Find a place"
              placeholderTextColor="#fefbea99"
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // slight delay so tapping a suggestion fires first
                setTimeout(() => setIsFocused(false), 150);
              }}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color="#fefbea" />
              </Pressable>
            ) : (
              <Ionicons name="search" size={16} color="#fefbea" />
            )}
          </View>

          <Pressable style={styles.settings}>
            <Ionicons name="settings" size={32} color="#243e36" />
          </Pressable>
        </View>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <View style={styles.suggestions}>
            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <SuggestionItem key={item.id} item={item} />
              ))
            ) : (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={16} color="#7ca982" />
                <Text style={styles.noResultsText}>No suggestions found</Text>
              </View>
            )}
          </View>
        )}

        {/* Pill and Filter */}
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
                <Ionicons name={icon} size={20} color="#d9d9d9" />
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.filter}>
            <Text
              style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
            >
              Filter <Text style={{ color: "#243e36" }}>.</Text>
            </Text>
            <Ionicons name="chevron-down" size={20} color="#d9d9d9" />
          </Pressable>
        </View>
      </View>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 19, // just below the header's zIndex of 20
  },
  header: {
    position: "absolute",
    top: 45,
    paddingHorizontal: 15,
    zIndex: 20,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    width: "100%",
  },

  // Search
  searchbar: {
    backgroundColor: "#7ca982",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    flex: 1,
    height: 40,
    borderRadius: 999,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  searchbarFocused: {
    backgroundColor: "#6b9870",
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.bold,
    color: "#fefbea",
    fontSize: 16,
  },

  // Settings
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

  // Suggestions
  suggestions: {
    position: "absolute",
    top: 55, // sits just below the search bar row (15 marginTop + 40 height)
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: "#1a2e27",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    margin: 15,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2e4a3e",
  },
  suggestionPhoto: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#243e36",
  },
  suggestionPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#243e36",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontFamily: Fonts.bold,
    color: "#fefbea",
    fontSize: 14,
  },
  suggestionAddress: {
    fontFamily: Fonts.regular ?? Fonts.bold,
    color: "#7ca982",
    fontSize: 12,
    marginTop: 1,
  },
  noResults: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  noResultsText: {
    fontFamily: Fonts.bold,
    color: "#7ca982",
    fontSize: 14,
  },

  // Pill
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

  // Filter
  filter: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 2,
    paddingHorizontal: 10,
    minWidth: 110,
    height: 40,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
});
