import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pressable, StyleSheet, View, Text, Linking, Switch } from "react-native";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "@/components/loading-page";
import { Colors, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';


export default function Settings() {
    const [discover, setDiscover] = useState(true);
    const [loading, setLoading] = useState(true);
    const { profile } = useAuth();

    const hasLoaded = useRef(false);

    const toggleDiscover = () => {
    setDiscover((previousState) => !previousState);
    }

    // fetch discoverable value from database
    useEffect(() => {
    if (!profile?.user_id) return;

    const fetchDiscoverability = async () => {
        const { data, error } = await supabase
        .from("users")
        .select("discoverable")
        .eq("user_id", profile.user_id)
        .single();

        if (error) {
        console.error("Error fetching discoverable:", error.message);
        setLoading(false);
        return;
        }

        setDiscover(!!data?.discoverable);
        setLoading(false);
    };

    fetchDiscoverability();
    }, [profile?.user_id]);


    // update discoverable value
    useEffect(() => {
    if (!profile?.user_id) return;

    if (!hasLoaded.current) {
        hasLoaded.current = true;
        return;
    }

    const updateDiscoverability = async () => {
        const { error } = await supabase
        .from("users")
        .update({ discoverable: discover })
        .eq("user_id", profile.user_id);

        if (error) {
        console.error("Error updating discoverable:", error);
        }
    };
    updateDiscoverability();
    }, [discover]);

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
                <Text style={styles.titleText}>Settings</Text>
            </View>
            <Pressable style={{marginHorizontal: 25, marginVertical: 15}} onPress={() => Linking.openSettings()}>
                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                <Text style={styles.settingTitle}>Location</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(0,0,0,0.4)" />
                </View>
                <View style={{width: "70%", marginTop: 5}}>
                <Text style={styles.settingSubtext}>Allow Charted to have access to location services</Text>
                </View>
            </Pressable>
            <Pressable style={{marginHorizontal: 25, marginVertical: 15}} onPress={() => Linking.openSettings()}>
                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={styles.settingTitle}>Notifications</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(0,0,0,0.4)" />
                </View>
                <View style={{width: "70%", marginTop: 5}}>
                    <Text style={styles.settingSubtext}>Allow Charted to send app notifications</Text>
                </View>
            </Pressable>
            <Pressable style={{marginHorizontal: 25, marginVertical: 15}} onPress={(() => {router.push("/account-set")})}>
                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={styles.settingTitle}>Account</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(0,0,0,0.4)" />
                </View>
                <View style={{width: "70%", marginTop: 5}}>
                    <Text style={styles.settingSubtext}>Change the email and password associated with your account</Text>
                </View>
            </Pressable>
            <View style={{marginHorizontal: 25, marginVertical: 15}}>
                <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                    <Text style={styles.settingTitle}>Discoverability</Text>
                    <Switch
                        trackColor={{
                        false: Colors.light.text,
                        true: Colors.light.accent,
                        }}
                        thumbColor="#FFF"
                        ios_backgroundColor={Colors.light.text}
                        onValueChange={toggleDiscover}
                        value={discover}
                        disabled={loading}
                    />
                </View>
                <View style={{width: "70%"}}>
                    <Text style={styles.settingSubtext}>Allow for your account to be discovered by other users</Text>
                </View>
            </View>
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
  title: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  titleText: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    color: "#243e36",
  },
  settingText: {
    fontFamily: Fonts.bold,
    color: "#243e36",
    fontSize: 28,
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