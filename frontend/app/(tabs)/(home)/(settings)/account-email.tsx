import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pressable, StyleSheet, View, Text, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { setPasswordUpdateFlag, useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import LoadingPage from "@/components/loading-page";
import { Colors, Fonts } from "@/constants/theme";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';


export default function AccountSet() {
    const [email, setEmail] = useState("");
    const { profile } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [baseSnapshot, setBaseSnapshot] = useState<any>(null);

    useEffect(() => {
        const getUserEmail = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error(error);
                return null;
            }

            setEmail(data?.user?.email || "");
            setLoading(false);
            setBaseSnapshot({email: data?.user?.email ?? ""})
        };
        getUserEmail();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setPasswordUpdateFlag(true);

        const { error } = await supabase.auth.updateUser({ email });


        if (error) {
            console.error(error.message);
            setLoading(false);
            setPasswordUpdateFlag(false);
            return;
        }

        await supabase.auth.signOut();
        
        setPasswordUpdateFlag(false);

        setLoading(false);
        router.replace("/(auth)/login");
        };
    
    const hasChanges =
        baseSnapshot &&
        (email !== baseSnapshot.email);

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
                        <View style={styles.topBar}>
                            <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
                            <Text style={styles.cancelText}>Cancel</Text>
                            </Pressable>
            
                            <Pressable
                            style={[
                                styles.saveBtn,
                                (!hasChanges) && styles.saveBtnDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={!hasChanges}
                            >
                            <Text style={styles.saveText}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.title}>
                        <Text style={styles.titleText}>Change Your Email</Text>
                        <Text style={styles.subheaderText}>You will be required to sign in again.</Text>
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
    marginTop: 70,
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
  subheaderText: {
    fontFamily: Fonts.regular_i,
    fontSize: 14,
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    position: "absolute",
    top: 10,
    right: 16,
    left: 16,
    zIndex: 10,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.error,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: "#243e36",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: "#888",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
})