// store/usePinsStore.ts
import { Pin } from "@/types";
import { create } from "zustand";

type PinsStore = {
  pins: Pin[];
  addPin: (pin: Pin) => void;
  removePin: (id: string) => void;
};

export const usePinsStore = create<PinsStore>((set) => ({
  pins: [],
  addPin: (pin) => set((state) => ({ pins: [...state.pins, pin] })),
  removePin: (id) =>
    set((state) => ({ pins: state.pins.filter((p) => p.id !== id) })),
}));
