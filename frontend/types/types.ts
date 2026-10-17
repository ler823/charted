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

  hours?: OpeningHours[] | null;
};

// One day's opening period from Google Places; times are "HHMM" strings.
export type OpeningHours = {
  day?: number;
  open?: string;
  close?: string;
};

// Raw `opening_hours.periods` entry from the Google Places Details API.
export type GooglePeriod = {
  open?: { day: number; time: string };
  close?: { day: number; time: string };
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
  self: boolean,
  friends: number[] | null,
  lists: number[] | null,
  tags: number[] | null,
  openNow: boolean,
  time: number | null,
  hour: number | null,
  minute: number | null,
  suffix: string | null,
  distance: number | null,
}
