import { Colors, Fonts } from "@/constants/theme";
import { getPhotoUrlMap } from "@/lib/photo-utils";
import { getPlaceDetails } from "@/lib/places";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Coords, OpeningHours, Pin } from "@/types/types";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Profile = {
  user_id: number;
  username: string;
  avatarUrl: string | null;
};

type Props = {
  pins: Pin[];
  userCoords: Coords | null;
  emptyMessage?: string;
  // Space above the list, e.g. to clear the header in the full-screen list view
  topSpacing?: number;
  onPinPress: (pin: Pin) => void;
};

const MAX_AVATARS = 3;
const MAX_QUOTES = 3;

const AVATAR_COLORS = ["#d47eaa", "#8c4067", "#d54c4c", "#ec9055", "#b19e24", "#3c6844", "#7ed4d1", "#2c716f", "#b87ed4"];

function userColor(userId: number): string {
  const str = String(userId);
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Categories looked up from Google this session, keyed by place_id
const categoryCache = new Map<string, string | null>();

/**
 * Pin list for the home bottom sheet: name, who saved it, category,
 * distance, opening hours, and quotes from people's notes.
 */
export default function PinSheetList({ pins, userCoords, emptyMessage = "No pins to display yet.", topSpacing = 0, onPinPress }: Props) {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Record<number, Profile>>({});
  const [covers, setCovers] = useState<Record<number, string>>({});
  const [categories, setCategories] = useState<Record<string, string | null>>({});

  const userIdsKey = [...new Set(pins.flatMap((p) => p.userIds ?? []))].sort().join(",");
  const coverPinIdsKey = pins.map(coverPinId).filter(Boolean).join(",");
  const missingPlaceIdsKey = [
    ...new Set(pins.filter((p) => !p.category && p.placeId).map((p) => p.placeId!)),
  ].join(",");

  // Everyone who saved any listed place, fetched once for the whole list
  useEffect(() => {
    const ids = userIdsKey ? userIdsKey.split(",").map(Number) : [];
    if (ids.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_key")
        .in("user_id", ids);
      if (error || !data) return;
      const urls = await getPhotoUrlMap(data.map((p) => p.avatar_key));
      if (cancelled) return;
      const map: Record<number, Profile> = {};
      data.forEach((p) => {
        if (p.user_id == null) return;
        map[p.user_id] = {
          user_id: p.user_id,
          username: p.username ?? "",
          avatarUrl: p.avatar_key ? urls[p.avatar_key] ?? null : null,
        };
      });
      setProfiles(map);
    })();
    return () => { cancelled = true; };
  }, [userIdsKey]);

  // Cover photos for each place's displayed pin
  useEffect(() => {
    const ids = coverPinIdsKey ? coverPinIdsKey.split(",").map(Number) : [];
    if (ids.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("pin_photos")
        .select("pin_id, photos(key)")
        .eq("cover", true)
        .in("pin_id", ids);
      if (error || !data) return;
      const keyByPin: Record<number, string> = {};
      data.forEach((row: any) => {
        if (row.photos?.key) keyByPin[row.pin_id] = row.photos.key;
      });
      const urls = await getPhotoUrlMap(Object.values(keyByPin));
      if (cancelled) return;
      const map: Record<number, string> = {};
      Object.entries(keyByPin).forEach(([pinId, key]) => {
        if (urls[key]) map[Number(pinId)] = urls[key];
      });
      setCovers(map);
    })();
    return () => { cancelled = true; };
  }, [coverPinIdsKey]);

  // Older pins have no saved category: look it up from Google and save it
  // on the pins (RLS only lets this write the current user's own rows).
  useEffect(() => {
    const placeIds = missingPlaceIdsKey ? missingPlaceIdsKey.split(",") : [];
    placeIds.forEach(async (placeId) => {
      if (categoryCache.has(placeId)) {
        const cached = categoryCache.get(placeId) ?? null;
        setCategories((prev) => (prev[placeId] === cached ? prev : { ...prev, [placeId]: cached }));
        return;
      }
      categoryCache.set(placeId, null);
      const details = await getPlaceDetails(placeId, ["primaryTypeDisplayName"]);
      const category = details?.primaryTypeDisplayName?.text ?? null;
      categoryCache.set(placeId, category);
      if (!category) return;
      setCategories((prev) => ({ ...prev, [placeId]: category }));
      if (profile) {
        await supabase
          .from("pins")
          .update({ category })
          .eq("place_id", placeId)
          .eq("user_id", profile.user_id)
          .is("category", null);
      }
    });
  }, [missingPlaceIdsKey, profile?.user_id]);

  return (
    <FlatList
      data={pins}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[styles.listContent, { paddingTop: topSpacing }]}
      ListHeaderComponent={pins.length > 0 ? <Text style={styles.heading}>Pins</Text> : undefined}
      renderItem={({ item }) => (
        <PinSheetCard
          pin={item}
          profiles={profiles}
          coverUrl={covers[coverPinId(item) ?? -1] ?? null}
          category={item.category ?? (item.placeId ? categories[item.placeId] : null) ?? null}
          distance={userCoords ? milesBetween(userCoords, item) : null}
          currentUserId={profile?.user_id}
          onPress={() => onPinPress(item)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
    />
  );
}

function PinSheetCard({
  pin,
  profiles,
  coverUrl,
  category,
  distance,
  currentUserId,
  onPress,
}: {
  pin: Pin;
  profiles: Record<number, Profile>;
  coverUrl: string | null;
  category: string | null;
  distance: number | null;
  currentUserId?: number;
  onPress: () => void;
}) {
  const userIds = pin.userIds ?? [];
  const shownUsers = userIds.slice(0, MAX_AVATARS);
  const extraUsers = userIds.length - shownUsers.length;

  const detailLine = [category, distance != null ? formatDistance(distance) : null]
    .filter(Boolean)
    .join(" • ");
  const hoursLine = openStatus(pin.hours);

  // Friends' notes first, then the current user's
  const quotes = [...(pin.notes ?? [])]
    .sort((a, b) => Number(a.userId === currentUserId) - Number(b.userId === currentUserId))
    .slice(0, MAX_QUOTES);

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress}>
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {pin.name || "Unnamed Pin"}
          </Text>
          <View style={styles.avatarStack}>
            {shownUsers.map((id, i) => (
              <Avatar key={id} profile={profiles[id]} userId={id} style={i > 0 && styles.stacked} />
            ))}
          </View>
          {extraUsers > 0 && <Text style={styles.extraText}>+{extraUsers}</Text>}
        </View>

        {!!detailLine && <Text style={styles.meta} numberOfLines={1}>{detailLine}</Text>}
        {!!hoursLine && <Text style={styles.meta} numberOfLines={1}>{hoursLine}</Text>}

        {quotes.length > 0 && (
          <View style={styles.quotes}>
            {quotes.map((q, i) => (
              <View key={`${q.userId}-${i}`} style={styles.quoteRow}>
                <Text style={styles.quoteText} numberOfLines={1}>
                  “{q.note}”
                </Text>
                <Avatar profile={profiles[q.userId]} userId={q.userId} />
              </View>
            ))}
          </View>
        )}
      </View>

      <Image
        source={coverUrl ? { uri: coverUrl } : require("@/assets/images/no_image_default.png")}
        style={styles.cover}
        contentFit="cover"
        transition={200}
      />
    </Pressable>
  );
}

function Avatar({ profile, userId, style }: { profile?: Profile; userId: number; style?: any }) {
  return (
    <View style={[styles.avatar, { backgroundColor: userColor(userId) }, style]}>
      {profile?.avatarUrl ? (
        <Image source={{ uri: profile.avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Text style={styles.avatarInitial}>{profile?.username?.[0]?.toUpperCase() ?? ""}</Text>
      )}
    </View>
  );
}

function coverPinId(pin: Pin): number | undefined {
  return pin.displayPinId ?? pin.pinIds?.[0];
}

function milesBetween(a: Coords, b: { latitude: number; longitude: number }) {
  const R = 3956.0;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(mi: number) {
  if (mi < 0.1) return "< 0.1 mi";
  return `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`;
}

// "HHMM" -> "4PM" / "4:30PM"
function formatTime(hhmm?: string) {
  if (!hhmm) return "";
  const h = Number(hhmm.slice(0, 2));
  const m = hhmm.slice(2, 4);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === "00" ? `${h12}${suffix}` : `${h12}:${m}${suffix}`;
}

// "Open till 4PM", "Opens 9AM", "Closed", or null when hours are unknown
function openStatus(hours?: OpeningHours[] | null): string | null {
  if (!hours || hours.length === 0) return null;
  // Google lists 24/7 places as a single period that opens and never closes
  if (hours.some((h) => h.open === "0000" && !h.close)) return "Open 24 hours";

  const now = new Date();
  const nowHHMM = now.getHours() * 100 + now.getMinutes();
  const today = hours.filter((h) => h.day === now.getDay() && h.open && h.close);

  for (const h of today) {
    const open = Number(h.open);
    const close = Number(h.close);
    const isOpen = open <= close
      ? nowHHMM >= open && nowHHMM < close
      : nowHHMM >= open || nowHHMM < close; // past midnight
    if (isOpen) return `Open till ${formatTime(h.close)}`;
  }

  const next = today
    .filter((h) => Number(h.open) > nowHHMM)
    .sort((a, b) => Number(a.open) - Number(b.open))[0];
  return next ? `Closed • Opens ${formatTime(next.open)}` : "Closed";
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 265,
  },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.light.background,
    marginTop: 4,
    marginBottom: 10,
    marginLeft: 2,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.light.accentLight,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardBody: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.light.text,
    flexShrink: 1,
    marginRight: 8,
  },
  avatarStack: {
    flexDirection: "row",
  },
  stacked: {
    marginLeft: -6,
  },
  extraText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.light.text,
    marginLeft: 4,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.light.text,
    marginTop: 1,
  },
  quotes: {
    marginTop: 6,
    gap: 4,
  },
  quoteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  quoteText: {
    fontFamily: Fonts.regular_i,
    fontSize: 13,
    color: Colors.light.text,
    flexShrink: 1,
    marginRight: 8,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.light.accentLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitial: {
    fontFamily: Fonts.bold,
    fontSize: 9,
    color: "#fff",
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    marginTop: 45,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
