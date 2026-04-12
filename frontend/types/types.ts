import { Ionicons } from "@expo/vector-icons";

export type ViewMode = "map" | "list" | "grid";

export type Pin = {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  
  isShared?: boolean;
  pinCount?: number;
  pinIds?: number[];
  userIds?: number[];
};

export type ViewOption = {
  mode: ViewMode;
  icon: keyof typeof Ionicons.glyphMap;
};

export type Coords = {
  latitude: number;
  longitude: number;
};
