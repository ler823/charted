import { Colors, Fonts } from "@/constants/theme";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

const RESEND_COOLDOWN = 60;

type Step = "email" | "code" | "password";

export default function ForgotPasswordScreen() {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async (targetEmail: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail);
    return error;
  };

  const handleSendCode = async () => {
    setEmailError("");
    if (!isValidEmail(email)) {
      setEmailError("Invalid email format.");
      return;
    }
    setLoading(true);
    await supabase.auth.signOut();
    const error = await sendOtp(email);
    setLoading(false);
    if (error) {
      setEmailError("Something went wrong. Please try again.");
      return;
    }
    setStep("code");
    startCooldown();
  };

  const handleVerifyCode = async () => {
    setCodeError("");
    if (code.length !== 6) {
      setCodeError("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });

    if (error) {
      setCodeError(error.message);
      setLoading(false);
      return;
    }
    setStep("password");
    setLoading(false);
  };

  const handleSetPassword = async () => {
    setPasswordError("");
    setConfirmError("");
    if (password.length < 6) {
      setPasswordError("Must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPasswordError(error.message);
      setLoading(false);
      return;
    }
    showToast("Password updated successfully.", "success");
    await supabase.auth.signOut();
    setLoading(false);
    router.replace("/(auth)/login");
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setCodeError("");
    setLoading(true);
    const error = await sendOtp(email);
    setLoading(false);
    if (error) {
      setCodeError("Failed to resend code. Please try again.");
    } else {
      startCooldown();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {step === "email" && (
            <>
              <Text style={styles.title}>Forgot password?</Text>
              <Text style={styles.subtitle}>
                Enter your email. If an account exists, we&apos;ll send you a
                code to reset your password.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter email"
                placeholderTextColor={Colors.light.accent}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {emailError ? (
                <Text style={styles.fieldError}>{emailError}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Back to login</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "code" && (
            <>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{" "}
                <Text style={styles.emailHighlight}>{email}</Text>.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="6-digit code"
                placeholderTextColor={Colors.light.accent}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
              {codeError ? (
                <Text style={styles.fieldError}>{codeError}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0 || loading}
                style={styles.secondaryAction}
              >
                <Text
                  style={[
                    styles.link,
                    resendCooldown > 0 && styles.linkDisabled,
                  ]}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep("email")}>
                <Text style={styles.link}>Wrong email?</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "password" && (
            <>
              <Text style={styles.title}>Set new password</Text>
              <Text style={styles.subtitle}>
                Choose a new password for your account.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="New password"
                placeholderTextColor={Colors.light.accent}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {passwordError ? (
                <Text style={styles.fieldError}>{passwordError}</Text>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.light.accent}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {confirmError ? (
                <Text style={styles.fieldError}>{confirmError}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 10,
    width: "100%",
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.light.accent,
    marginBottom: 24,
    width: "100%",
    textAlign: "left",
    lineHeight: 20,
  },
  emailHighlight: {
    fontFamily: Fonts.bold,
    color: Colors.light.background,
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
  fieldError: {
    color: "red",
    fontSize: 12,
    width: "100%",
    marginBottom: 4,
  },
  secondaryAction: {
    marginTop: 20,
    marginBottom: 4,
  },
  link: {
    textAlign: "center",
    marginTop: 12,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.light.background,
    textDecorationLine: "underline",
  },
  linkDisabled: {
    color: Colors.light.accent,
    textDecorationLine: "none",
  },
});
