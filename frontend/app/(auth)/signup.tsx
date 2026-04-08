import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    form: "",
  });

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

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, username });

    if (profileError) {
      setErrors((e) => ({
        ...e,
        form: "Failed to save username. Please try again.",
      }));
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        onBlur={() => setErrors((e) => ({ ...e, email: validateEmail(email) }))}
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
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontFamily: "Raleway_700Bold", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 16, fontFamily: "Raleway_700Bold" },
  error: { color: "red", marginBottom: 12, fontSize: 14 },
  fieldError: { color: "red", fontSize: 12, marginBottom: 8, marginLeft: 4 },
  available: { color: "green", fontSize: 12, marginBottom: 8, marginLeft: 4 },
  hint: { color: "#999", fontSize: 12, marginBottom: 8, marginLeft: 4 },
  link: {
    textAlign: "center",
    marginTop: 16,
    color: "#666",
    fontFamily: "Raleway_400Regular",
  },
});
