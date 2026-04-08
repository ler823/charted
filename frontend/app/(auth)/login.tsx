import { Colors, Fonts } from "@/constants/theme";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        onPress={() => {}}
        style={styles.forgotPasswordContainer}
      >
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
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
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 8,
  },
  forgotPassword: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    textDecorationLine: "underline",
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
  link: {
    textAlign: "center",
    marginTop: 20,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  linkUnderline: {
    textDecorationLine: "underline",
    color: Colors.light.background,
    fontFamily: Fonts.bold,
  },
});
