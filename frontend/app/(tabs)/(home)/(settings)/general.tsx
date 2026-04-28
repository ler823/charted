import React, { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pressable, StyleSheet, View, Text, Switch } from "react-native";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "@/components/loading-page";
import { Colors, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


export default function General() {
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
        <View style={styles.title}>
          <Text style={styles.titleText}>General</Text>
        </View>
        <View style={{marginHorizontal: 20}}>
          <View style={{flexDirection: "row", justifyContent: "space-between"}}>
            <Text style={styles.settingTitle}>Location</Text>
            <Switch
              trackColor={{
                false: Colors.light.text,
                true: Colors.light.accent,
              }}
              thumbColor="#FFF"
              ios_backgroundColor={Colors.light.text}
            />
          </View>
          <View style={{width: "70%"}}>
            <Text style={styles.settingSubtext}>Allow Charted to have access to location services</Text>
          </View>
        </View>
        <View style={{marginHorizontal: 20, marginVertical: 30}}>
          <View style={{flexDirection: "row", justifyContent: "space-between"}}>
            <Text style={styles.settingTitle}>Notifications</Text>
            <Switch
              trackColor={{
                false: Colors.light.text,
                true: Colors.light.accent,
              }}
              thumbColor="#FFF"
              ios_backgroundColor={Colors.light.text}
            />
          </View>
          <View style={{width: "70%"}}>
            <Text style={styles.settingSubtext}>Allow Charted to send app notifications</Text>
          </View>
        </View>
      </>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  title: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 50,
  },
  titleText: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    color: "#243e36",
  },
  settingTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: "#000",
  },
  settingSubtext: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.6)",
  }
})