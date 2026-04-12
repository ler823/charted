import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import LoadingPage from "./loading-page";
interface PinMarkerProps {
  color?: string;
  users_id: number[];
  number_shared: number;
}

const COLORS = [
        "#d47eaa",
        "#8c4067",
        "#d54c4c",
        "#7f2020",
        "#ec9055",
        "#aa5823",
        "#d3c777",
        "#b19e24",
        "#3c6844",
        "#7ed4d1",
        "#2c716f",
        "#b87ed4",
        "#6a3a81",
        "#8c694f",
        "#5a3a23"
    ]

function getUserColor(userId: string | number): string {
  const str = String(userId);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return COLORS[Math.abs(hash) % COLORS.length];
}

/**
 * Matched the pin that looks like the one on Figma design
 * Custom pin-marker with customizable style just like the Figma design
 */
export default function SharedPinMarkers({
  color = Colors.light.accent,
  users_id,
  number_shared,
}: PinMarkerProps) {
    const [friend, setFriend] = useState(0);
    
    useEffect(() => {
      if (users_id?.length) {
        setFriend(users_id[0]);
      }
    }, [users_id]);
    
    const user_color = friend !== 0
        ? getUserColor(String(friend))
        : color;
  
  return (
    <View style={styles.wrapper}>
      <View style={[styles.outer, { backgroundColor: user_color }]}>
        <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{number_shared}</Text>
        </View>
      </View>
      <View style={styles.stem} />
      <View style={{height: 62}}/>
    </View>
  );
}

/**
 * Not sure if the sizing is right.
 * NOTE: Pin looks bigger on actual Expo app
 */
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
      paddingBottom: 5,
    },
});
