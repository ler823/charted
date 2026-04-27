import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { getPhotoUrl, pickImageAsync, processImage, uploadImageToS3 } from "@/lib/photo-utils";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Alert } from "react-native";
import { Image } from "expo-image";
import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import LoadingPage from "@/components/loading-page";


import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { LocationErrorSubscriber } from "expo-location/build/LocationSubscribers";
import { isSearchBarAvailableForCurrentPlatform } from "react-native-screens";

const validateUsername = (username: string) => {
  if (username.length === 0) return "Username is required";
  if (username.length > 20) return "Username must be 20 characters or less";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Letters, numbers, and underscores only";
  return "";
};

const validateLocation = (location: string) => {
  if (!location) return "";
  if (location.length > 50) return "Location must be 50 characters or less";
  if (!/^[a-zA-Z0-9\s,.-]+$/.test(location))
    return "Letters, numbers, periods, and hyphens only";
  return "";
}

const validateBio = (bio: string) => {
  if (bio.length > 150) return "Bio must be 150 characters or less";
  return "";
}


export default function EditAccount() {
    const { profile, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [location, setLocation] = useState<string | null>("");
    const [bio, setBio] = useState<string | null>("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [baseSnapshot, setBaseSnapshot] = useState<any>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [errors, setErrors] = useState({
      username: "",
      location: "",
      bio: "",
      form: "",
    });

      useFocusEffect(
        useCallback(() => {
          let active = true;

          const load = async () => {
            if (!profile) return;

          setLoading(true);

          const { data: freshProfile } = await supabase
            .from("profiles")
            .select("username, avatar_key")
            .eq("user_id", profile.user_id)
            .single();

          const { data: userData } = await supabase
            .from("users")
            .select("location, bio")
            .eq("user_id", profile.user_id)
            .single();

          if (!active) return;

          const avatarKey = freshProfile?.avatar_key ?? null;

          let url = null;
          if (avatarKey) {
            const urls = await getPhotoUrl([avatarKey]);
            url = urls?.[0]?.url ?? null;
          }

          setUsername(freshProfile?.username ?? "");
          setLocation(userData?.location ?? "");
          setBio(userData?.bio ?? "");

          setAvatarUrl(url);

          setBaseSnapshot({
            username: freshProfile?.username ?? "",
            location: userData?.location ?? "",
            bio: userData?.bio ?? "",
            avatarKey,
          });

          setAvatarUri(null);
          setRemoveAvatar(false);
          setLoading(false);
        };

        load();

        return () => {
          active = false;
        };
      }, [profile?.user_id])
    );


    const handleAvatarOptions = () => {
      Alert.alert("Profile Photo", "Choose an option", [
        {
          text: "Choose New Photo",
          onPress: async () => {
            const result = await pickImageAsync();
            if (!result) return;
            const processed = await processImage(result.assets[0].uri);
            setAvatarUri(processed.uri);
            setRemoveAvatar(false);
          },
        },
        ...(avatarUrl || avatarUri
          ? [
              {
                text: "Remove Photo",
                style: "destructive" as const,
                onPress: () => {
                  setAvatarUri(null);
                  setRemoveAvatar(true);
                },
              },
            ]
          : []),
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    };

    const checkUsernameAvailability = async (value: string) => {
        if (value === baseSnapshot.username) {
          setErrors((e) => ({ ...e, username: "" }));
          setUsernameAvailable(true);
          setCheckingUsername(false);
          return;
        }

        const usernameError = validateUsername(value);
        if (usernameError) {
          setErrors((e) => ({ ...e, username: usernameError }));
          setUsernameAvailable(null);
          return;
        }
        setCheckingUsername(true);
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", value)
          .neq("user_id", profile?.user_id)
          .maybeSingle();
        setCheckingUsername(false);
        if (data) {
          setErrors((e) => ({ ...e, username: "Username is already taken" }));
          setUsernameAvailable(false);
        } else {
          setErrors((e) => ({ ...e, username: "" }));
          setUsernameAvailable(true);
        }
      };

      const handleSave = async () => {
        if (!profile) return;

        const usernameError = validateUsername(username);
        const locationError = validateLocation(location ?? "");
        const bioError = validateBio(bio ?? "");

        setErrors({
          username: usernameError,
          location: locationError,
          bio: bioError,
          form: "",
        });

        if (usernameError || locationError || bioError) return;
        if (usernameAvailable === false) return;

        try {
          let avatarKey = avatarUri
            ? await uploadImageToS3(avatarUri)
            : removeAvatar
              ? null
              : baseSnapshot.avatarKey;

          if (removeAvatar) {
            avatarKey = null;
          }

          if (avatarUri) {
            avatarKey = await uploadImageToS3(avatarUri);
          }

          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              username,
              avatar_key: avatarKey,
            })
            .eq("user_id", profile.user_id);

          if (profileError) throw profileError;

          const { error: userError } = await supabase
            .from("users")
            .update({
              username,
              location,
              bio,
            })
            .eq("user_id", profile.user_id);

          if (userError) throw userError;

          router.back();
        } catch (err) {
          setErrors((e) => ({
            ...e,
            form: "Failed to update profile",
          }));
        }
      };

      const hasChanges =
        baseSnapshot &&
        (username !== baseSnapshot.username ||
          location !== baseSnapshot.location ||
          bio !== baseSnapshot.bio ||
          avatarUri !== null ||
          removeAvatar);

    if (loading) return <LoadingPage />;

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
            <View style={styles.container}>
              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                {removeAvatar ? (
                  <View style={styles.avatarFallback}>
                    {username ? (
                      <Text style={styles.avatarInitial}>
                        {username[0].toUpperCase()}
                      </Text>
                    ) : null}
                  </View>
                ) : avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} transition={300}/>
                ) : avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} transition={300}/>
                ) : (
                  <View style={styles.avatarFallback}>
                    {username ? (
                      <Text style={styles.avatarInitial}>
                        {username[0].toUpperCase()}
                      </Text>
                    ) : null}
                  </View>
                )}

                <Pressable style={styles.avatarCover} onPress={handleAvatarOptions}>
                  <Ionicons name="camera-outline" size={60} color="rgba(255,255,255,0.9)" />
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
                  onChangeText={(v) => {
                    setUsername(v);
                    setUsernameAvailable(null);
                  }}
                  onBlur={() => checkUsernameAvailability(username)}
                />
                {checkingUsername ? (
                  <Text style={styles.hint}>Checking...</Text>
                ) : errors.username ? (
                  <Text style={styles.fieldError}>{errors.username}</Text>
                ) : usernameAvailable ? (
                  <Text style={styles.available}>Username available!</Text>
                ) : null}
              </View>

              <View style={{width: "85%"}}>
                <Text style={styles.headerText}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder={location ?? undefined}
                  placeholderTextColor={Colors.light.accent}
                  value={location ?? undefined}
                  onChangeText={(v) => {
                    setLocation(v);
                  }}
                  onBlur={() =>
                    setErrors((e) => ({
                      ...e,
                      location: validateLocation(location ?? ""),
                    }))
                  }
                />
                {errors.location ? (
                  <Text style={styles.fieldError}>{errors.location}</Text>
                ) : null}
              </View>

              <View style={{width: "85%"}}>
                <Text style={styles.headerText}>Bio</Text>
                <TextInput
                  style={styles.input}
                  placeholder={bio ?? undefined}
                  placeholderTextColor={Colors.light.accent}
                  value={bio ?? undefined}
                  onChangeText={(v) => {
                    setBio(v);
                  }}
                  onBlur={() =>
                    setErrors((e) => ({
                      ...e,
                      bio: validateBio(bio ?? ""),
                    }))
                  }
                />
                {errors.bio ? (
                  <Text style={styles.fieldError}>{errors.bio}</Text>
                ) : null}
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
    fontFamily: Fonts.regular,
  },
  fieldError: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    width: "100%",
    textAlign: "left",
  },
  available: {
    color: "green",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    width: "100%",
    textAlign: "left",
    fontFamily: Fonts.regular,
  },
  hint: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    width: "100%",
    textAlign: "left",
  },
});