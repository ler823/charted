import FriendsBar from "@/components/friends-bar";
import PinMarker from "@/components/pin-marker";
import { supabase } from "@/lib/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import ClusteredMapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import PinListView from "./pin_list_view";

import PinGridView from "@/app/(tabs)/(home)/pin_grid_view";
import DroppingPinOverlay from "@/components/dropping-pin-overlay";
import Filter from "@/components/filter";
import Header from "@/components/header";
import PinMarkers from "@/components/pin-markers";
import SharedPinMarkers from "@/components/pin-markers-shared";
import PinOverlay from "@/components/pin-overlay";
import PlaceSuggestionItem from "@/components/place-suggestion-item";
import SuggestionItem from "@/components/suggestion-item";
import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useDroppingPin } from "@/context/DroppingPinContext";
import { useFilterContext } from "@/context/FilterContext";
import { useLocation } from "@/hooks/use-location";
import { Coords, Pin, ViewMode, ViewOption } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setPinChanged } from "../../../lib/pin_refresh_data";

const CSULB = {
  latitude: 33.7838,
  longitude: -118.1141,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const INITIAL_REGION = CSULB;

const VIEW_OPTIONS: ViewOption[] = [
  { mode: "map", icon: "map" },
  { mode: "list", icon: "list" },
  { mode: "grid", icon: "grid" },
];

// Bottom sheet detents
const SHEET_MIN = 0;
const SHEET_FRIENDS = 1;
const SHEET_EXPANDED = 2;

// Sheet section heights, excluding safe area
const DRAG_HANDLE_HEIGHT = 20;
const SEARCH_ROW_MIN = 56; // search bar 40 tall
const SEARCH_ROW_MAX = 64; // search bar 48 tall
const FRIENDS_ROW_HEIGHT = 84;
const MIN_HEIGHT = DRAG_HANDLE_HEIGHT + SEARCH_ROW_MIN;
const FRIENDS_HEIGHT = DRAG_HANDLE_HEIGHT + SEARCH_ROW_MAX + FRIENDS_ROW_HEIGHT;

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type PlacePrediction = {
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
};

/**
 * Map marker that keeps tracking view changes until its avatar has
 * rendered, then stops so the map doesn't re-snapshot every frame.
 * (`coordinate` is a direct prop so react-native-map-clustering sees it.)
 */
function PinMapMarker({
  pin,
  coordinate,
  isOwn,
  onPress,
}: {
  pin: Pin;
  coordinate: Coords;
  isOwn: boolean;
  onPress: () => void;
}) {
  // Shared markers have no images, so there's nothing to wait for
  const [tracking, setTracking] = useState(!pin.isShared);

  // Give the final frame a moment to paint before freezing the snapshot
  const handleReady = useCallback(() => {
    setTimeout(() => setTracking(false), 100);
  }, []);

  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      tracksViewChanges={tracking}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {pin.isShared ? (
        <SharedPinMarkers users_id={pin.userIds!} number_shared={pin.pinCount!} />
      ) : isOwn ? (
        <PinMarker onReady={handleReady} />
      ) : (
        <PinMarkers users_id={Number(pin.user_id)} onReady={handleReady} />
      )}
    </Marker>
  );
}

export default function Home() {
  const { viewMode: incomingViewMode } = useLocalSearchParams<{
    viewMode?: ViewMode;
  }>();
  const { isDroppingPin, setIsDroppingPin } = useDroppingPin();
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>(incomingViewMode ?? "map");
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [filteredPins, setFilteredPins] = useState<Pin[] | null>(null);
  const [pinSearchQuery, setPinSearchQuery] = useState("");
  const [pinCoords, setPinCoords] = useState<Coords | null>(null);
  const mapRef = useRef<any>(null);
  const { permissionStatus } = useLocation();
  const [region, setRegion] = useState(INITIAL_REGION);
  const { filterOptions } = useFilterContext();
  const { userCoords } = useLocation();
  const insets = useSafeAreaInsets();

  // Bottom sheet
  const { height: screenHeight } = useWindowDimensions();
  // Detents: 0 = search only, 1 = search + friends, 2 = expanded pin list
  const sheetAnim = useRef(new Animated.Value(SHEET_FRIENDS)).current;
  const sheetDetent = useRef(SHEET_FRIENDS);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetPan = useRef(
    PanResponder.create({
      // Only claim vertical drags so the friends row can still scroll sideways
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => {
        const current = sheetDetent.current;
        let next = current;
        if (g.dy < -30 || g.vy < -0.3) next = Math.min(current + 1, SHEET_EXPANDED);
        else if (g.dy > 30 || g.vy > 0.3) next = Math.max(current - 1, SHEET_MIN);
        if (next === current) return;

        sheetDetent.current = next;
        if (next === SHEET_EXPANDED) setSheetExpanded(true);
        Animated.spring(sheetAnim, { toValue: next, useNativeDriver: false, tension: 50, friction: 9 }).start(() => {
          if (next !== SHEET_EXPANDED) setSheetExpanded(false);
        });
      },
    })
  ).current;

  // Top edge of the sheet, capped at the friends detent (used to anchor
  // the action pill and search suggestions)
  const sheetTopHeight = sheetAnim.interpolate({
    inputRange: [SHEET_MIN, SHEET_FRIENDS],
    outputRange: [MIN_HEIGHT + insets.bottom, FRIENDS_HEIGHT + insets.bottom],
    extrapolate: "clamp",
  });
  // 0 → 1 progress toward the friends detent, for search bar sizing
  const friendsProgress = sheetAnim.interpolate({
    inputRange: [SHEET_MIN, SHEET_FRIENDS],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Search state
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestionsType, setSuggestionsType] = useState<"pins" | "places">("pins");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlacePrediction[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lift the sheet above the keyboard. "Will" events only fire on iOS;
  // Android already resizes the window when the keyboard opens.
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", (e) => {
      Animated.timing(keyboardOffset, {
        toValue: Math.max(0, e.endCoordinates.height - insets.bottom),
        duration: e.duration,
        useNativeDriver: false,
      }).start();
    });
    const hide = Keyboard.addListener("keyboardWillHide", (e) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: e.duration,
        useNativeDriver: false,
      }).start();
    });
    return () => { show.remove(); hide.remove(); };
  }, [insets.bottom]);

  // Filter state
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const isMapView = viewMode === "map";
  const showSuggestions = isMapView && isFocused && query.trim().length > 0;

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3956.0;
    const lat1Rad = lat1 * Math.PI / 180;
    const lon1Rad = lon1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const lon2Rad = lon2 * Math.PI / 180;
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = lon2Rad - lon1Rad;
    const a = Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isBusinessOpen = (givenTime: number, hours: any) => {
    if (hours == null) return false;
    const timeNow = new Date(Date.now());
    const day = timeNow.getDay();
    const filteredHours = hours.filter((entry: any) => entry.day == day);
    for (let i = 0; i < filteredHours.length; i++) {
      let close = Number(filteredHours[i].close);
      if (Number(filteredHours[i].open > Number(filteredHours[i].close))) {
        close += 2400;
        givenTime += 2400;
      }
      if (Number(filteredHours[i].open) <= Number(givenTime) && close > Number(givenTime)) {
        return true;
      }
    }
    return false;
  };

  const filterPins = async () => {
    let queryPins = pins.filter((pin) => (
      (filterOptions.self == false ? (filterOptions.friends == null ? true : filterOptions.friends.includes(Number(pin.user_id))) : filterOptions.friends == null ? Number(pin.user_id) == profile!.user_id : (Number(pin.user_id) == profile!.user_id) || (filterOptions.friends?.includes(Number(pin.user_id)))) &&
      (filterOptions.lists == null ? true : filterOptions.lists.some((id) => pin.listIds?.includes(id))) &&
      (filterOptions.tags == null ? true : filterOptions.tags.some((id) => pin.tagIds?.includes(id))) &&
      (filterOptions.time == null ? true : isBusinessOpen(filterOptions.time, pin.hours)) &&
      (filterOptions.distance == null ? true : haversineDistance(pin.latitude, pin.longitude, userCoords!.latitude, userCoords!.longitude) <= filterOptions.distance)
    ));
    if (pinSearchQuery.trim().length > 0) {
      queryPins = queryPins.filter(p =>
        p.name?.toLowerCase().includes(pinSearchQuery.toLowerCase())
      );
    }
    setFilteredPins(queryPins);
  };

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;

      async function fetchPins() {
        const currentUserId = profile!.user_id;
        const currentUserUuid = profile!.id;

        const { data: relData, error: relError } = await supabase
          .from("user_relationships1")
          .select("requester_id, target_id")
          .eq("status", "accepted")
          .or(`requester_id.eq.${currentUserUuid},target_id.eq.${currentUserUuid}`);

        if (relError) {
          console.log("Failed to fetch friends:", relError.message);
        }

        const friendUuids: string[] = [];
        (relData ?? []).forEach((r: any) => {
          const other = r.requester_id === currentUserUuid ? r.target_id : r.requester_id;
          friendUuids.push(other);
        });

        let allUserIds: number[] = [currentUserId];
        if (friendUuids.length > 0) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("user_id")
            .in("id", friendUuids);
          if (profileData) {
            const friendIds = profileData
              .map((p: any) => p.user_id)
              .filter((id: any) => id != null) as number[];
            allUserIds = [...allUserIds, ...friendIds];
          }
        }

        const { data: clusters, error } = await supabase
          .from("pin_clusters")
          .select("*")
          .overlaps("user_ids", allUserIds);

        if (error) {
          console.error("Failed to fetch pins:", error.message);
          return;
        }

        const allPinIds = [...new Set(clusters.flatMap((c: any) => c.pin_ids || []))];

        let pinsMap: Record<number, any> = {};

        if (allPinIds.length > 0) {
          const { data: pinData, error } = await supabase
            .from("pins")
            .select(`
              pin_id,
              user_id,
              private,
              name,
              address,
              location_id,
              hours,
              pin_lists (list_id),
              pin_tags (tag_id)
            `)
            .in("pin_id", allPinIds);
          if (error) {
            console.error("Failed to fetch pins:", error.message);
            return;
          }
          pinsMap = Object.fromEntries((pinData || []).map((p: any) => [p.pin_id, p]));
        }

        const formattedPins: Pin[] = clusters
          .map((cluster: any) => {
            const validPins = (cluster.pin_ids || [])
              .map((id: number) => pinsMap[id])
              .filter((p: any) => {
                if (!p) return false;
                const isAllowedUser = allUserIds.includes(p.user_id);
                const isVisible = !p.private || p.user_id === currentUserId;
                return isAllowedUser && isVisible;
              });

            if (validPins.length === 0) return null;

            const userIds = [...new Set(validPins.map((p: any) => p.user_id))];
            const pinIds = validPins.map((p: any) => p.pin_id);

            let list_ids: number[] = [];
            validPins.forEach((pin: any) => { list_ids = [...list_ids, ...pin.pin_lists.map((pin_list: any) => pin_list.list_id)]; });

            let tag_ids: number[] = [];
            validPins.forEach((pin: any) => { tag_ids = [...tag_ids, ...pin.pin_tags.map((pin_tag: any) => pin_tag.tag_id)]; });

            const userPin = validPins.find((p: any) => p.user_id === currentUserId);
            const displayPin = userPin ?? validPins[0];

            return {
              id: String(cluster.cluster_id),
              latitude: cluster.latitude,
              longitude: cluster.longitude,
              address: displayPin?.address ?? cluster.address,
              name: displayPin?.name ?? cluster.name,
              user_id: String(userIds[0]),
              isShared: userIds.length > 1,
              pinCount: validPins.length,
              pinIds,
              userIds,
              listIds: list_ids,
              tagIds: tag_ids,
              hours: displayPin?.hours,
            };
          })
          .filter(Boolean) as Pin[];

        setPins(formattedPins);
      }

      setPinChanged(true);
      fetchPins();
    }, [profile]),
  );

  useEffect(() => {
    filterPins();
  }, [filterOptions, pinSearchQuery, pins]);

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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, suggestionsType]);

  async function handlePlaceSelect(placeId: string) {
    Keyboard.dismiss();
    setIsFocused(false);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      if (loc) {
        mapRef.current?.animateToRegion(
          { latitude: loc.lat, longitude: loc.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          400,
        );
      }
    } catch {
      // silently fail — map stays where it is
    }
  }

  const matchingPins = query.trim().length > 0
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

  const pinSuggestions = matchingPins.slice(0, 5);

  const handleCurrentLocation = () => {
    if (!userCoords) return;
    mapRef.current?.animateToRegion(
      { latitude: userCoords.latitude, longitude: userCoords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      400,
    );
  };

  return (
    <View style={styles.container}>
      {!isDroppingPin && (
        <Header viewMode={viewMode} setViewMode={setViewMode} viewOptions={VIEW_OPTIONS} />
      )}

      {viewMode === "map" && (
        <ClusteredMapView
          initialRegion={INITIAL_REGION}
          style={styles.map}
          ref={mapRef}
          onRegionChangeComplete={(r) => {
            setPinCoords({ latitude: r.latitude, longitude: r.longitude });
            setRegion(r);
          }}
          onLongPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPinCoords({ latitude, longitude });
            setIsDroppingPin(true);
            mapRef.current?.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: region.latitudeDelta > 0.01 ? 0.01 : region.latitudeDelta,
                longitudeDelta: region.longitudeDelta > 0.01 ? 0.01 : region.longitudeDelta,
              },
              300,
            );
          }}
          showsUserLocation={permissionStatus === "granted"}
          clusterColor="#243e36"
          clusterTextColor="#fefbea"
          clusterFontFamily="System"
        >
          {(filteredPins ?? [])
            .filter((pin) => pin.latitude !== 0 && pin.longitude !== 0)
            .map((pin) => (
              <PinMapMarker
                key={pin.id}
                pin={pin}
                coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                isOwn={Number(pin.user_id) === profile?.user_id}
                onPress={() => setSelectedPin(pin)}
              />
            ))}
        </ClusteredMapView>
      )}

      {viewMode === "list" && (
        <View style={styles.cardsContainer}>
          <PinListView
            pins={filteredPins ?? pins}
            emptyMessage={pinSearchQuery ? `No pins matched "${pinSearchQuery}"` : "No pins to display yet."}
          />
        </View>
      )}

      {viewMode === "grid" && (
        <View>
          <PinGridView
            pins={filteredPins ?? pins}
            emptyMessage={pinSearchQuery ? `No pins matched "${pinSearchQuery}"` : "No pins to display yet."}
          />
        </View>
      )}

      {selectedPin && (
        <PinOverlay selectedPin={selectedPin} setSelectedPin={setSelectedPin} />
      )}

      {isDroppingPin && (
        <DroppingPinOverlay coords={pinCoords} viewMode={viewMode} />
      )}

      {!isDroppingPin && (
        <>
          {/* Backdrop to dismiss search */}
          {isFocused && (
            <TouchableWithoutFeedback
              onPress={() => { Keyboard.dismiss(); setIsFocused(false); }}
            >
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>
          )}

          {/* Search suggestions — expand upward above the sheet */}
          {showSuggestions && (
            <Animated.View
              style={[
                styles.suggestionsWrapper,
                { bottom: Animated.add(keyboardOffset, sheetTopHeight) },
              ]}
            >
              <View style={styles.suggestionsPill}>
                <Pressable
                  onPress={() => setSuggestionsType("pins")}
                  style={[styles.suggestionsPillOption, suggestionsType === "pins" && styles.suggestionsPillOptionActive]}
                >
                  <Text style={[styles.suggestionsPillText, suggestionsType === "pins" && styles.suggestionsPillTextActive]}>
                    Pins
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSuggestionsType("places")}
                  style={[styles.suggestionsPillOption, suggestionsType === "places" && styles.suggestionsPillOptionActive]}
                >
                  <Text style={[styles.suggestionsPillText, suggestionsType === "places" && styles.suggestionsPillTextActive]}>
                    Places
                  </Text>
                </Pressable>
              </View>
              <View style={styles.suggestions}>
                {suggestionsType === "pins" ? (
                  pinSuggestions.length > 0 ? (
                    pinSuggestions.map((item) => <SuggestionItem key={item.id} item={item} />)
                  ) : (
                    <View style={styles.noResults}>
                      <Ionicons name="search-outline" size={16} color={Colors.light.accent} />
                      <Text style={styles.noResultsText}>No pins found</Text>
                    </View>
                  )
                ) : placesLoading ? (
                  <View style={styles.noResults}>
                    <Ionicons name="search-outline" size={16} color={Colors.light.accent} />
                    <Text style={styles.noResultsText}>Searching...</Text>
                  </View>
                ) : placeSuggestions.length > 0 ? (
                  placeSuggestions.map((item) => (
                    <PlaceSuggestionItem key={item.place_id} item={item} onPress={handlePlaceSelect} />
                  ))
                ) : (
                  <View style={styles.noResults}>
                    <Ionicons name="search-outline" size={16} color={Colors.light.accent} />
                    <Text style={styles.noResultsText}>No places found</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Action pill — above the collapsed sheet */}
          <Animated.View
            style={[
              styles.actionPill,
              { bottom: Animated.add(Animated.add(keyboardOffset, sheetTopHeight), 10) },
            ]}
          >
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setPinCoords({ latitude: region.latitude, longitude: region.longitude });
                setIsDroppingPin(true);
              }}
            >
              <MaterialCommunityIcons name="plus" size={22} color={Colors.light.background} />
            </Pressable>
            <View style={styles.actionDivider} />
            <Pressable style={styles.actionButton} onPress={() => setFilterModalVisible(true)}>
              <Ionicons name="options" size={22} color={Colors.light.background} />
            </Pressable>
            <View style={styles.actionDivider} />
            <Pressable style={styles.actionButton} onPress={handleCurrentLocation}>
              <Ionicons name="locate" size={22} color={Colors.light.background} />
            </Pressable>
          </Animated.View>

          {/* Animated bottom sheet */}
          <Animated.View
            style={[
              styles.sheet,
              {
                height: sheetAnim.interpolate({
                  inputRange: [SHEET_MIN, SHEET_FRIENDS, SHEET_EXPANDED],
                  outputRange: [
                    MIN_HEIGHT + insets.bottom,
                    FRIENDS_HEIGHT + insets.bottom,
                    Math.max(screenHeight * 0.5, FRIENDS_HEIGHT + insets.bottom),
                  ],
                }),
                bottom: keyboardOffset,
                paddingBottom: insets.bottom,
              },
            ]}
          >
            {/* Fixed top section — never stretches regardless of sheet height */}
            <View style={styles.sheetTop} {...sheetPan.panHandlers}>
              {/* Drag handle */}
              <View style={styles.dragHandleRow}>
                <View style={styles.dragHandle} />
              </View>

              {/* Search row — grows slightly when the friends row is shown */}
              <Animated.View
                style={[
                  styles.searchRow,
                  { height: friendsProgress.interpolate({ inputRange: [0, 1], outputRange: [SEARCH_ROW_MIN, SEARCH_ROW_MAX] }) },
                ]}
              >
                <Animated.View
                  style={[
                    styles.searchbar,
                    isFocused && styles.searchbarFocused,
                    { height: friendsProgress.interpolate({ inputRange: [0, 1], outputRange: [40, 48] }) },
                  ]}
                >
                  <AnimatedTextInput
                    style={[
                      styles.searchInput,
                      { fontSize: friendsProgress.interpolate({ inputRange: [0, 1], outputRange: [15, 17] }) },
                    ]}
                    placeholder="Find a place"
                    placeholderTextColor={Colors.light.accent}
                    value={query}
                    onChangeText={(text) => { setQuery(text); setPinSearchQuery(text); }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                  />
                  {query.length > 0 ? (
                    <Pressable onPress={() => { setQuery(""); setPinSearchQuery(""); }} hitSlop={8}>
                      <Ionicons name="close-circle" size={16} color={Colors.light.background} />
                    </Pressable>
                  ) : (
                    <Ionicons name="search" size={16} color={Colors.light.background} />
                  )}
                </Animated.View>
                <Animated.View
                  style={{
                    width: friendsProgress.interpolate({ inputRange: [0, 1], outputRange: [40, 48] }),
                    height: friendsProgress.interpolate({ inputRange: [0, 1], outputRange: [40, 48] }),
                  }}
                >
                  <Pressable style={styles.userButton} onPress={() => router.push("/account")}>
                    <Ionicons name="person" size={22} color={Colors.light.background} />
                  </Pressable>
                </Animated.View>
              </Animated.View>

              {/* Friends bar — swipe down to tuck it away, up to bring it back */}
              <Animated.View
                style={{
                  height: friendsProgress.interpolate({ inputRange: [0, 1], outputRange: [0, FRIENDS_ROW_HEIGHT] }),
                  opacity: friendsProgress.interpolate({ inputRange: [0.4, 1], outputRange: [0, 1], extrapolate: "clamp" }),
                  overflow: "hidden",
                }}
              >
                <FriendsBar />
              </Animated.View>
            </View>

            {/* Expanded content fills remaining space below */}
            {sheetExpanded && (
              <View style={styles.expandedArea}>
                <PinListView
                  pins={filteredPins ?? pins}
                  emptyMessage={pinSearchQuery ? `No pins matched "${pinSearchQuery}"` : "No pins to display yet."}
                  topSpacing={0}
                />
              </View>
            )}
          </Animated.View>

          <Filter
            isVisible={filterModalVisible}
            onClose={() => setFilterModalVisible(false)}
            exportFilter={() => {}}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
  },
  cardsContainer: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 19,
  },

  // Suggestions (expand upward)
  suggestionsWrapper: {
    position: "absolute",
    left: 15,
    right: 15,
    zIndex: 25,
  },
  suggestionsPill: {
    flexDirection: "row",
    backgroundColor: "#243e36",
    borderRadius: 999,
    alignSelf: "flex-start",
    marginBottom: 6,
    padding: 3,
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
    backgroundColor: "#1a2e27",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
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

  // Action pill (vertical, bottom right)
  actionPill: {
    position: "absolute",
    right: 15,
    zIndex: 20,
    backgroundColor: "#fff",
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.accentLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDivider: {
    width: 24,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.accentLight,
  },

  searchbar: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.accentLight,
  },
  searchbarFocused: {
    backgroundColor: "#f0f5f0",
    borderColor: Colors.light.accent,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.bold,
    color: Colors.light.background,
    fontSize: 16,
  },
  userButton: {
    backgroundColor: "#fff",
    borderRadius: 999,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.accentLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 30,
  },
  dragHandleRow: {
    width: "100%",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.accentLight,
  },
  sheetTop: {
    flexShrink: 0,
  },
  expandedArea: {
    flex: 1,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
});
