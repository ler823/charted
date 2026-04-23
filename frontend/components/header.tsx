import { Colors, Fonts } from "@/constants/theme";
import { Pin, ViewMode, ViewOption } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Filter from "./filter";
import PlaceSuggestionItem from "./place-suggestion-item";
import SuggestionItem from "./suggestion-item";

type PlacePrediction = {
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
};

type HeaderProps = {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  viewOptions: ViewOption[];
  pins: Pin[];
  onPlaceSelect?: (lat: number, lng: number) => void;
  onFilteredPinsChange?: (filtered: Pin[] | null, query: string) => void;
};

export default function Header({
  viewMode,
  setViewMode,
  viewOptions,
  pins = [],
  onPlaceSelect,
  onFilteredPinsChange,
}: HeaderProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [suggestionsType, setSuggestionsType] = useState<"pins" | "places">(
    "pins",
  );

  const isMapView = viewMode === "map";
  const [placeSuggestions, setPlaceSuggestions] = useState<PlacePrediction[]>(
    [],
  );
  const [placesLoading, setPlacesLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (suggestionsType !== "places" || query.trim().length === 0) {
      setPlaceSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPlacesLoading(true);
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&language=en&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        setPlaceSuggestions(json.predictions?.slice(0, 5) ?? []);
      } catch {
        setPlaceSuggestions([]);
      } finally {
        setPlacesLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, suggestionsType]);

  async function handlePlaceSelect(placeId: string) {
    Keyboard.dismiss();
    setIsFocused(false);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      if (loc && onPlaceSelect) onPlaceSelect(loc.lat, loc.lng);
    } catch {
      // silently fail — map stays where it is
    }
  }

  const matchingPins =
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
      : [];

  const pinSuggestions = isMapView ? matchingPins.slice(0, 5) : matchingPins;

  useEffect(() => {
    if (!isMapView) {
      onFilteredPinsChange?.(query.trim().length > 0 ? matchingPins : null, query.trim());
    }
  }, [query, isMapView, pins, onFilteredPinsChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const showSuggestions = isMapView && isFocused && query.trim().length > 0;

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
              placeholderTextColor="#fefbea"
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
            <Ionicons name="settings" size={24} color="#d9d9d9" />
          </Pressable>
        </View>

        {showSuggestions && (
          <>
            <View style={styles.suggestionsPill}>
              <Pressable
                onPress={() => setSuggestionsType("pins")}
                style={[
                  styles.suggestionsPillOption,
                  suggestionsType === "pins" &&
                  styles.suggestionsPillOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.suggestionsPillText,
                    suggestionsType === "pins" &&
                    styles.suggestionsPillTextActive,
                  ]}
                >
                  Pins
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSuggestionsType("places")}
                style={[
                  styles.suggestionsPillOption,
                  suggestionsType === "places" &&
                  styles.suggestionsPillOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.suggestionsPillText,
                    suggestionsType === "places" &&
                    styles.suggestionsPillTextActive,
                  ]}
                >
                  Places
                </Text>
              </Pressable>
            </View>

            {/* Suggestions Dropdown */}
            <View style={styles.suggestions}>
              {suggestionsType === "pins" ? (
                pinSuggestions.length > 0 ? (
                  pinSuggestions.map((item) => (
                    <SuggestionItem key={item.id} item={item} />
                  ))
                ) : (
                  <View style={styles.noResults}>
                    <Ionicons
                      name="search-outline"
                      size={16}
                      color={Colors.light.accent}
                    />
                    <Text style={styles.noResultsText}>No pins found</Text>
                  </View>
                )
              ) : placesLoading ? (
                <View style={styles.noResults}>
                  <Ionicons
                    name="search-outline"
                    size={16}
                    color={Colors.light.accent}
                  />
                  <Text style={styles.noResultsText}>Searching...</Text>
                </View>
              ) : placeSuggestions.length > 0 ? (
                placeSuggestions.map((item) => (
                  <PlaceSuggestionItem
                    key={item.place_id}
                    item={item}
                    onPress={handlePlaceSelect}
                  />
                ))
              ) : (
                <View style={styles.noResults}>
                  <Ionicons
                    name="search-outline"
                    size={16}
                    color={Colors.light.accent}
                  />
                  <Text style={styles.noResultsText}>No places found</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Pill and Filter */}
        {!showSuggestions && (
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

            <Pressable style={styles.filter} onPress={() => setFilterModalVisible(true)}>
              <Text
                style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
              >
                Filter <Text style={{ color: "#243e36" }}>.</Text>
              </Text>
              <Ionicons name="chevron-down" size={20} color="#d9d9d9" />
            </Pressable>
            <Filter isVisible={filterModalVisible} onClose={() => setFilterModalVisible(false)} />
          </View>)}
      </View>
    </>
  );
}

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
    backgroundColor: Colors.light.accent,
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
    backgroundColor: Colors.light.background,
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

  suggestionsPill: {
    flexDirection: "row",
    backgroundColor: "#243e36",
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 10,
    padding: 3,
    zIndex: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  suggestionsPillOption: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
  },
  suggestionsPillOptionActive: {
    backgroundColor: Colors.light.accent,
  },
  suggestionsPillText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.light.accent,
  },
  suggestionsPillTextActive: {
    color: "#fefbea",
  },

  suggestions: {
    marginTop: 6,
    zIndex: 30,
    backgroundColor: "#1a2e27",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
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
    color: Colors.light.accent,
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
    color: Colors.light.accent,
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
    backgroundColor: Colors.light.accent,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  pillOptionActiveList: {
    backgroundColor: Colors.light.accent,
    borderRadius: 0,
  },
  pillOptionActiveGrid: {
    backgroundColor: Colors.light.accent,
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
