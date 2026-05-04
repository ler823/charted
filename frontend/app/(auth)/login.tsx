import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 5;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [credentialsError, setCredentialsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setSecondsLeft(0);
        setFailedAttempts(0);
      } else {
        setSecondsLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

  const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const handleLogin = async () => {
    if (isLockedOut) return;

    setEmailError("");
    setCredentialsError("");

    if (!isValidEmail(email)) {
      setEmailError("Incorrect format.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_SECONDS * 1000;
        setLockoutUntil(until);
        setSecondsLeft(LOCKOUT_SECONDS);
        setCredentialsError("");
      } else if (
        error.message.toLowerCase().includes("invalid login credentials")
      ) {
        const attemptsLeft = MAX_ATTEMPTS - newAttempts;
        setCredentialsError(
          `Incorrect email or password. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`,
        );
      } else {
        setEmailError(error.message);
      }
    } else {
      setFailedAttempts(0);
    }
  };

  return (
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
            onPress={() => router.push("/(auth)/forgot-password")}
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
  lockoutBanner: {
    backgroundColor: "#fdecea",
    borderRadius: 8,
    padding: 12,
    width: "100%",
    marginBottom: 8,
  },
  lockoutText: {
    color: "#c0392b",
    fontSize: 13,
    fontFamily: Fonts.regular,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.light.background,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    width: "100%",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
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
  fieldError: {
    color: "red",
    fontSize: 12,
    width: "100%",
    marginBottom: 4,
  },
});
