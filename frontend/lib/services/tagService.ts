import { supabase } from "@/lib/supabase";

export async function getUserTags(userId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("name")
    .eq("user_id", userId);

  if (error) {
    console.error("[getUserTags]", error);
    return [];
  }
  return data.map((t) => t.name as string);
}

export async function addTag(
  userId: number,
  name: string,
  privacy: number,
): Promise<string | null> {
  const { error } = await supabase
    .from("tags")
    .insert({ user_id: userId, name, privacy });
  return error?.message ?? null;
}

export async function syncPinTags(
  pinId: string | number,
  selectedTagNames: string[],
): Promise<string | null> {
  const { data: tagIds, error: tagIdsError } = await supabase
    .from("tags")
    .select("tag_id")
    .in("name", selectedTagNames.length > 0 ? selectedTagNames : ["__none__"]);

  if (tagIdsError) return tagIdsError.message;

  const localIds = new Set((tagIds ?? []).map((t) => t.tag_id as number));

  const { data: currentTags, error: currentTagsError } = await supabase
    .from("pin_tags")
    .select("tag_id")
    .eq("pin_id", pinId);

  if (currentTagsError) return currentTagsError.message;

  const dbIds = new Set((currentTags ?? []).map((t) => t.tag_id as number));

  const toAdd = [...localIds].filter((id) => !dbIds.has(id));
  const toDelete = [...dbIds].filter((id) => !localIds.has(id));

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("pin_tags")
      .insert(toAdd.map((tag_id) => ({ pin_id: pinId, tag_id })));
    if (error) return error.message;
  }

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("pin_tags")
      .delete()
      .eq("pin_id", pinId)
      .in("tag_id", toDelete);
    if (error) return error.message;
  }

  return null;
}

export async function cleanupUnusedTags(userId: number): Promise<void> {
  const { error } = await supabase.rpc("update_tags", { p_user_id: userId });
  if (error) console.error("[cleanupUnusedTags]", error);
}
