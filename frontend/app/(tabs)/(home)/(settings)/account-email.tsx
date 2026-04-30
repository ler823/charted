import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pressable, StyleSheet, View, Text, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "@/components/loading-page";
import { Colors, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';


export default function AccountSet() {
    const [passVisible, setPassVisible] = useState(false);
    const [email, setEmail] = useState("");
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserEmail = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error(error);
                return null;
            }

            setEmail(data?.user?.email || "");
            setLoading(false);
        };
        getUserEmail();
    }, []);

    if (loading) return <LoadingPage />;


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                <View>
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
                            <Text style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}>
                                Back
                            </Text>
                        </Pressable>
                    </View>
                    <View style={styles.title}>
                        <Text style={styles.titleText}>Change Your Email</Text>
                    </View>
                    <View style={{alignItems: "center"}}>
                        <View style={{width: "85%"}}>
                            <View style={{flexDirection: "row", alignItems: "center", gap: 7}}>
                                <Text style={styles.headerText}>Email</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder={email}
                                placeholderTextColor={Colors.light.accent}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                />
                        </View>
                    </View>
                </View>
            </Pressable>
        </KeyboardAvoidingView>
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
    marginBottom: 30,
  },
  titleText: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    color: "#243e36",
  },
  input: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "#e4ede4",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.background,
    marginBottom: 4,
    fontFamily: Fonts.regular,
  },
  inputText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  headerText: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: "#243e36",
    marginTop: 15,
    marginBottom: 4,
    marginLeft: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    height: 40,
    width: 200,
    gap: 7,
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 270,
    backgroundColor: Colors.light.error,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
})