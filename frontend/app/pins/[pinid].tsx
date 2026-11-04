import PinDetail from "@/components/pin-detail";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function PinPage() {
  const { pinid, viewMode } = useLocalSearchParams<{ pinid: string; viewMode?: string }>();
  return <PinDetail pinid={Number(pinid)} viewMode={viewMode} />;
}
