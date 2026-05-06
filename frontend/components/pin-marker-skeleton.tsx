import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import LoadingPage from "./loading-page";
import { getPhotoUrl } from "@/lib/photo-utils";
import { Image } from "expo-image";


export default function PinSkeleton() {

  return (
    <View style={styles.wrapper}>
      <View style={[styles.outer, { backgroundColor: "#b7bcb8" }]}>
        <View style={[styles.avatar, { backgroundColor: "#ecf1ed"}]} />
      </View>
      <View style={styles.stem} />
      <View style={{height: 62}}/>
    </View>

  );
}


const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  outer: {
    width: 42,
    height: 42,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#fefbea",
    alignItems: "center",
    justifyContent: "center",
  },
  stem: {
    width: 4,
    height: 20,
    backgroundColor: "#111",
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
    avatarInitial: {
      fontSize: 20,
      fontFamily: Fonts.bold,
      color: "#000",
    },
});
