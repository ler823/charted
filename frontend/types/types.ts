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

  listIds?: number[];
  tagIds?: number[];
};

export type ViewOption = {
  mode: ViewMode;
  icon: keyof typeof Ionicons.glyphMap;
};

export type Coords = {
  latitude: number;
  longitude: number;
};

export type PhotoItem = {
  key: string;
  url: string;
  changed: boolean;
};

export type ListType = {
  name: string;
  privacy: number;
};

export type FilterType = {
  friends: number[] | null,
  lists: number[] | null,
  tags: number[] | null,
  openNow: boolean,
  hour: number | null,
  minute: number | null,
  suffix: string | null,
  distance: number | null,
}
