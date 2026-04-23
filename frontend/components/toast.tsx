import { Colors, Fonts } from "@/constants/theme";
import { useToast } from "@/context/ToastContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Toast() {
  const { toast, hideToast } = useToast();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: toast.visible ? 0 : -100,
        duration: toast.visible ? 300 : 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: toast.visible ? 1 : 0,
        duration: toast.visible ? 300 : 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [toast.visible]);

  const insets = useSafeAreaInsets();

  const bgColor =
    toast.type === "error" ? Colors.light.error : Colors.light.background;

  const icon =
    toast.type === "success"
      ? "check-circle-outline"
      : toast.type === "error"
        ? "alert-circle-outline"
        : "information-outline";

  return (
    <Animated.View
      pointerEvents={toast.visible ? "auto" : "none"}
      style={[
        styles.container,
        { top: insets.top + 12, backgroundColor: bgColor },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={20} color="#fff" />
      <Text style={styles.message}>{toast.message}</Text>
      <Pressable onPress={hideToast} hitSlop={8}>
        <MaterialCommunityIcons name="close" size={18} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  message: {
    flex: 1,
    color: "#fff",
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
});
