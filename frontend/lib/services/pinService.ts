import { supabase } from "@/lib/supabase";

export async function checkDuplicateAddress(
  userId: number,
  address: string,
  excludePinId?: string,
): Promise<string | null> {
  if (!address.trim()) return null;

  let query = supabase
    .from("pins")
    .select("name, pin_id")
    .eq("user_id", userId)
    .eq("address", address);

  if (excludePinId) {
    query = query.neq("pin_id", excludePinId);
  }

  const { data, error } = await query.limit(1);
  if (error || !data?.length) return null;
  return data[0].name;
}

type CreatePinParams = {
  address: string;
  latitude: number;
  longitude: number;
  name: string;
  isPrivate: boolean;
  notes: string;
  rating: number;
  userId: number;
};

export async function createPin(
  params: CreatePinParams,
): Promise<{ pinId: number | null; error: string | null }> {
  const { data, error } = await supabase.rpc("create_pin", {
    p_address: params.address,
    p_latitude: params.latitude,
    p_longitude: params.longitude,
    p_pin_name: params.name,
    p_private: params.isPrivate,
    p_user_note: params.notes,
    p_user_rating: params.rating,
    p_user_id: params.userId,
  });
  if (error) return { pinId: null, error: error.message };
  return { pinId: data, error: null };
}

type UpdatePinParams = {
  name: string;
  address: string;
  rating: number;
  notes: string;
  isPrivate: boolean;
};

export async function updatePin(
  pinId: string,
  params: UpdatePinParams,
): Promise<string | null> {
  const { error } = await supabase
    .from("pins")
    .update({
      name: params.name,
      address: params.address,
      user_rating: params.rating,
      user_note: params.notes,
      private: params.isPrivate,
    })
    .eq("pin_id", pinId);
  return error?.message ?? null;
}

export async function deletePin(pinId: string): Promise<string | null> {
  const { error } = await supabase.rpc("delete_pin", { p_pin_id: pinId });
  return error?.message ?? null;
}

export type PinInfo = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  notes: string;
  isPrivate: boolean;
  placeId: number;
  hours: any;
  selectedTags: string[];
  selectedLists: string[];
  visits: string[];
  coverPhotoKey: string | null;
  otherPhotoKeys: string[];
};

export async function getPinInfo(
  pinId: string,
): Promise<{ data: PinInfo | null; error: string | null }> {
  const { data: pinData, error: pinDataError } = await supabase
    .from("pins")
    .select("name, user_rating, user_note, address, location_id, private, place_id, hours")
    .eq("pin_id", pinId);

  if (pinDataError) return { data: null, error: pinDataError.message };
  if (!pinData?.length) return { data: null, error: "Pin not found" };

  const { data: locData, error: locDataError } = await supabase
    .from("locations")
    .select("latitude, longitude")
    .eq("id", pinData[0].location_id);

  if (locDataError) return { data: null, error: locDataError.message };
  if (!locData?.length) return { data: null, error: "Location not found" };

  const { data: tagData, error: tagDataError } = await supabase
    .from("pin_tags")
    .select("tags (name)")
    .eq("pin_id", pinId);

  if (tagDataError) return { data: null, error: tagDataError.message };

  const selectedTags = (tagData ?? []).map(
    (d) => (d.tags as unknown as { name: string }).name,
  );

  const { data: listData, error: listDataError } = await supabase
    .from("pin_lists")
    .select("lists (name)")
    .eq("pin_id", pinId);

  if (listDataError) return { data: null, error: listDataError.message };

  const selectedLists = (listData ?? []).map(
    (d) => (d.lists as unknown as { name: string }).name,
  );

  const { data: visitData, error: visitDataError } = await supabase
    .from("pin_visits")
    .select("visit_timestamp")
    .eq("pin_id", Number(pinId));

  if (visitDataError) return { data: null, error: visitDataError.message };

  const visits = (visitData ?? []).map((v) => v.visit_timestamp as string);

  const { data: photoData } = await supabase
    .from("pin_photos")
    .select("photos (key), cover")
    .eq("pin_id", Number(pinId));

  const coverPhotoKey =
    (photoData?.find((p) => p.cover)?.photos as { key: string } | null)?.key ??
    null;
  const otherPhotoKeys = (photoData?.filter((p) => !p.cover) ?? []).map(
    (p) => (p.photos as { key: string }).key,
  );

  return {
    data: {
      name: pinData[0].name,
      address: pinData[0].address,
      latitude: locData[0].latitude,
      longitude: locData[0].longitude,
      rating: pinData[0].user_rating,
      notes: pinData[0].user_note,
      isPrivate: pinData[0].private,
      placeId: pinData[0].place_id,
      hours: pinData[0].hours,
      selectedTags,
      selectedLists,
      visits,
      coverPhotoKey,
      otherPhotoKeys,
    },
    error: null,
  };
}
