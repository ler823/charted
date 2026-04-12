import { Colors, Fonts } from "@/constants/theme";
import {
  pickImageAsync,
  processImage,
  uploadImageToS3,
} from "@/lib/photo-utils";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? "" : "Invalid email format";
};

const validateUsername = (username: string) => {
  if (username.length === 0) return "Username is required";
  if (username.length > 20) return "Username must be 20 characters or less";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Letters, numbers, and underscores only";
  return "";
};

const validatePasswords = (password: string, confirmPassword: string) => {
  if (password.length < 6)
    return { password: "Must be at least 6 characters", confirmPassword: "" };
  if (password !== confirmPassword)
    return { password: "", confirmPassword: "Passwords don't match" };
  return { password: "", confirmPassword: "" };
};

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    form: "",
  });

  const handlePickAvatar = async () => {
    const result = await pickImageAsync();
    if (!result) return;
    const processed = await processImage(result.assets[0].uri);
    setAvatarUri(processed.uri);
  };

  const checkUsernameAvailability = async (value: string) => {
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

  const handleSignup = async () => {
    const emailError = validateEmail(email);
    const usernameError = validateUsername(username);
    const { password: passwordError, confirmPassword: confirmError } =
      validatePasswords(password, confirmPassword);

    setErrors({
      email: emailError,
      username: usernameError,
      password: passwordError,
      confirmPassword: confirmError,
      form: "",
    });

    if (emailError || usernameError || passwordError || confirmError) return;
    if (!usernameAvailable) return;

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setErrors((e) => ({
        ...e,
        form: signUpError?.message ?? "Something went wrong",
      }));
      setLoading(false);
      return;
    }

    // Upload avatar if one was picked
    let avatarKey: string | null = null;
    if (avatarUri) {
      avatarKey = await uploadImageToS3(avatarUri);
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, username, avatar_key: avatarKey });

    if (profileError) {
      setErrors((e) => ({
        ...e,
        form: "Failed to save profile. Please try again.",
      }));
      setLoading(false);
      return;
    }

    setLoading(false);
    // onAuthStateChange fires → _layout.tsx re-routes automatically
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Create account</Text>

          {errors.form ? (
            <Text style={styles.formError}>{errors.form}</Text>
          ) : null}

          {/* Avatar picker */}
          <Pressable onPress={handlePickAvatar} style={styles.avatarContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                transition={300}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={28}
                  color="#6a8f6a"
                />
              </View>
            )}
            <Text style={styles.changePhotoText}>
              {avatarUri ? "Change photo" : "Add profile photo"}
            </Text>
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onBlur={() =>
              setErrors((e) => ({ ...e, email: validateEmail(email) }))
            }
          />
          {errors.email ? (
            <Text style={styles.fieldError}>{errors.email}</Text>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Username"
            autoCapitalize="none"
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

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {errors.password ? (
            <Text style={styles.fieldError}>{errors.password}</Text>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => {
              const { confirmPassword: err } = validatePasswords(
                password,
                confirmPassword,
              );
              setErrors((e) => ({ ...e, confirmPassword: err }));
            }}
          />
          {errors.confirmPassword ? (
            <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>
              Already have an account?{" "}
              <Text style={styles.linkUnderline}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.light.background,
    marginBottom: 24,
    width: "100%",
    textAlign: "left",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#e4ede4",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.light.background,
    fontFamily: Fonts.regular,
    textDecorationLine: "underline",
  },
  input: {
    backgroundColor: "#e4ede4",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.background,
    marginBottom: 4,
    width: "100%",
  },
  button: {
    backgroundColor: Colors.light.background,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    width: "100%",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
  formError: {
    color: "red",
    marginBottom: 12,
    fontSize: 14,
    width: "100%",
    textAlign: "left",
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
  },
  hint: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    width: "100%",
    textAlign: "left",
  },
  link: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.light.background,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  linkUnderline: {
    textDecorationLine: "underline",
    color: Colors.light.background,
    fontFamily: Fonts.bold,
  },
});
