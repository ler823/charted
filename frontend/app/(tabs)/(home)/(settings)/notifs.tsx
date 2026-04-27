import React, { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "@/components/loading-page";
import { Colors, Fonts } from "@/constants/theme";
import { router } from "expo-router";


export default function Notifications() {
    return (
        <Text>Notifs</Text>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})