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
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={10}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 80, flexGrow: 1, justifyContent: "flex-start" }}
          >
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
              <View style={styles.avatarWrapper}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatarImage}
                    transition={300}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    {username ? (
                      <Text style={styles.avatarInitial}>{username[0].toUpperCase()}</Text>
                    ) : null}
                  </View>
                )}
                <Pressable style={styles.avatarCover}>
                  <Ionicons name="camera-outline" size={60} color={"rgba(255, 255, 255, 0.9)"}/>
                </Pressable>
              </View>
            </View>
            <View style={styles.container}>
              <View style={{width: "85%"}}>
                <Text style={styles.headerText}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder={username}
                  placeholderTextColor={Colors.light.accent}
                  autoCapitalize="none"
                  keyboardType="default"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              <View style={{width: "85%"}}>
                <Text style={styles.headerText}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder={location ?? undefined}
                  placeholderTextColor={Colors.light.accent}
                  value={location ?? undefined}
                  onChangeText={setLocation}
                />
              </View>

              <View style={{width: "85%"}}>
                <Text style={styles.headerText}>Bio</Text>
                <TextInput
                  style={styles.input}
                  placeholder={bio ?? undefined}
                  placeholderTextColor={Colors.light.accent}
                  value={bio ?? undefined}
                  onChangeText={setBio}
                />
              </View>

            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
};


const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  avatarWrapper: {
    width: 155,
    height: 155,
    borderRadius: 999,
    overflow: "hidden",
    position: "relative",
    marginTop: 119,
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 65,
    fontFamily: Fonts.regular,
    color: "#000",
  },
  headerText: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: "#243e36",
    marginTop: 15,
    marginBottom: 4,
    marginLeft: 6,
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
  input: {
    backgroundColor: "#e4ede4",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.background,
    marginBottom: 4,
  },
});