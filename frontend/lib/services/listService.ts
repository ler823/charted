import { supabase } from "@/lib/supabase";

export async function getUserLists(userId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from("lists")
    .select("name")
    .eq("user_id", userId);

  if (error) {
    console.error("[getUserLists]", error);
    return [];
  }
  return data.map((l) => l.name as string);
}

export async function addList(
  userId: number,
  name: string,
  privacy: number,
): Promise<string | null> {
  const { error } = await supabase
    .from("lists")
    .insert({ user_id: userId, name, privacy });
  return error?.message ?? null;
}

export async function syncPinLists(
  pinId: string | number,
  selectedListNames: string[],
): Promise<string | null> {
  const { data: listIds, error: listIdsError } = await supabase
    .from("lists")
    .select("list_id")
    .in(
      "name",
      selectedListNames.length > 0 ? selectedListNames : ["__none__"],
    );

  if (listIdsError) return listIdsError.message;

  const localIds = new Set((listIds ?? []).map((l) => l.list_id as number));

  const { data: currentLists, error: currentListsError } = await supabase
    .from("pin_lists")
    .select("list_id")
    .eq("pin_id", pinId);

  if (currentListsError) return currentListsError.message;

  const dbIds = new Set((currentLists ?? []).map((l) => l.list_id as number));

  const toAdd = [...localIds].filter((id) => !dbIds.has(id));
  const toDelete = [...dbIds].filter((id) => !localIds.has(id));

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("pin_lists")
      .insert(toAdd.map((list_id) => ({ pin_id: pinId, list_id })));
    if (error) return error.message;
  }

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("pin_lists")
      .delete()
      .eq("pin_id", pinId)
      .in("list_id", toDelete);
    if (error) return error.message;
  }

  return null;
}

export async function cleanupUnusedLists(userId: number): Promise<void> {
  const { error } = await supabase.rpc("update_lists", { p_user_id: userId });
  if (error) console.error("[cleanupUnusedLists]", error);
}
