import { Ionicons } from "@expo/vector-icons";

export type ViewMode = "map" | "list" | "grid";

export type Pin = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type ViewOption = {
  mode: ViewMode;
  icon: keyof typeof Ionicons.glyphMap;
};
