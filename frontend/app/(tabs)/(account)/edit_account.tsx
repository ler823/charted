import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { getPhotoUrl } from "@/lib/photo-utils";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import LoadingPage from "@/components/loading-page";


import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";


export default function EditAccount() {
    const { profile, loading: authLoading } = useAuth();
    const [userLoading, setUserLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [location, setLocation] = useState<string | null>(null);
    const [bio, setBio] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
        if (!profile) {
            if (!authLoading) {
            setUserLoading(false);
            }
            return;
        }
        setUsername(profile.username);
        if (profile.avatar_key) {
            const urls = await getPhotoUrl([profile.avatar_key]);
            setAvatarUrl(urls[0].url);
        }

        const { data: userData } = await supabase
            .from("users")
            .select("location, bio")
            .eq("user_id", profile.user_id)
            .single();

        setLocation(userData?.location ?? null);
        setBio(userData?.bio ?? null);
        setUserLoading(false);
        };
        loadUser();
    }, [profile, authLoading]);


    return (
    <ScrollView>
      <View style={{height: 99}} />
      <View style={styles.topBar}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[styles.saveBtn, styles.saveBtnDisabled]}
          onPress={() => {}}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
      <View style={styles.container}>
        {/* Avatar */}
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            transition={300}
          />
        ) : (
          <View style={styles.avatar}>
            {username ? (
              <Text style={styles.avatarInitial}>{username[0].toUpperCase()}</Text>
            ) : null}
          </View>
        )}

        {/* Username, Location, Bio */}
        <Text style={styles.username}>{username}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={17} color="#333" />
          <Text style={[styles.location, { paddingLeft: 2 }]}>{location ?? "No location set"}</Text>
        </View>
        <Text style={styles.bio}>{bio ?? "No bio"}</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.title}>Welcome back</Text>
  
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              placeholderTextColor={Colors.light.accent}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isLockedOut}
            />
            {emailError ? (
              <Text style={styles.fieldError}>{emailError}</Text>
            ) : null}
  
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={Colors.light.accent}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLockedOut}
            />
            {credentialsError ? (
              <Text style={styles.fieldError}>{credentialsError}</Text>
            ) : null}
  
            <TouchableOpacity
              onPress={() => {}}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
  
            {isLockedOut && (
              <View style={styles.lockoutBanner}>
                <Text style={styles.lockoutText}>
                  Too many failed attempts. Try again in {secondsLeft}s.
                </Text>
              </View>
            )}
  
            <TouchableOpacity
              style={[styles.button, isLockedOut && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading || isLockedOut}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log in</Text>
              )}
            </TouchableOpacity>
  
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.link}>
                Don&apos;t have an account?{" "}
                <Text style={styles.linkUnderline}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScrollView>
    );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  avatar: {
    width: 155,
    height: 155,
    borderRadius: 999,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 65,
    fontFamily: Fonts.regular,
    color: "#000",
  },
  username: {
    fontSize: 26,
    color: "#333",
    textAlign: "center",
    fontFamily: Fonts.bold,
  },
  location: {
    fontFamily: Fonts.bold_i,
    fontSize: 15,
  },
  bio: {
    fontSize: 15,
    marginHorizontal: 50,
    marginTop: 3,
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
    fontFamily: Fonts.regular_i,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    position: "absolute",
    top: 59,
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
  },
});