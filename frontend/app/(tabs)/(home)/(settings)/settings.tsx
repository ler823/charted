import React, { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "@/components/loading-page";
import { Colors, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';


export default function Settings() {

    return (
        <>
            <View
                style={{
                    marginTop: 45,
                    marginHorizontal: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
                >
                <Pressable
                    style={styles.backButton}
                    onPress={() => {router.back()}
                    }
                >
                    <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
                    <Text
                    style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
                    >
                    Back
                    </Text>
                </Pressable>
            </View>
            <Pressable style={styles.settingCard} onPress={(() => {router.push("/general")})}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 15}}>
                    <Ionicons name="settings-outline" size={40} color="#243e36" />
                    <Text style={styles.settingText}>General</Text>
                </View>
                <Ionicons name="chevron-forward" size={30} color="#243e36" />
            </Pressable>
            <Pressable style={styles.settingCard} onPress={(() => {router.push("/account-set")})}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 15}}>
                    <Ionicons name="person-circle-outline" size={40} color="#243e36" />
                    <Text style={styles.settingText}>Account</Text>
                </View>
                <Ionicons name="chevron-forward" size={30} color="#243e36" />
            </Pressable>
            <Pressable style={styles.settingCard} onPress={(() => {router.push("/privacy")})}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 15}}>
                    <Feather name="minus-circle" size={36} color="#243e36" />
                    <Text style={styles.settingText}>Privacy</Text>
                </View>
                <Ionicons name="chevron-forward" size={30} color="#243e36" />
            </Pressable>
            <Pressable style={styles.settingCard} onPress={(() => {router.push("/notifs")})}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 15}}>
                    <Ionicons name="notifications-outline" size={40} color="#243e36" />
                    <Text style={styles.settingText}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={30} color="#243e36" />
            </Pressable>
        </>
    )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    width: 105,
    height: 40,
    marginLeft: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  settingCard: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    height: 100,
    backgroundColor: "#DEE9E0",
    borderRadius: 10,
    margin: 12,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  settingText: {
    fontFamily: Fonts.bold,
    color: "#243e36",
    fontSize: 28,
  }
})