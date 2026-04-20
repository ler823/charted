import { supabase } from "@/lib/supabase";

export async function getPinVisits(pinId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from("pin_visits")
    .select("visit_timestamp")
    .eq("pin_id", pinId);

  if (error) {
    console.error("[getPinVisits]", error);
    return [];
  }
  return data.map((v) => v.visit_timestamp as string);
}

export async function saveNewVisits(
  pinId: number,
  allVisits: string[],
  originalVisits: string[],
): Promise<string | null> {
  const newVisits = allVisits.filter((v) => !originalVisits.includes(v));
  if (newVisits.length === 0) return null;

  const { error } = await supabase.from("pin_visits").insert(
    newVisits.map((visit_timestamp) => ({ pin_id: pinId, visit_timestamp })),
  );
  return error?.message ?? null;
}
