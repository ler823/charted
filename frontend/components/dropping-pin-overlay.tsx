import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useDroppingPin } from "@/context/DroppingPinContext";

type Props = {
  coords: {
    latitude: number;
    longitude: number;
  } | null;
};

export default function DroppingPinOverlay({ coords }: Props) {
  const { isDroppingPin, setIsDroppingPin } = useDroppingPin();
  const router = useRouter();

  function handleDropPin() {
    // pin dropping logic here
    setIsDroppingPin(false);
    router.replace("/(tabs)/(home)");
    setTimeout(() => {
      router.push({
        pathname: "/make-pin",
        params: { lat: coords?.latitude, lng: coords?.longitude },
      });

    }, 0)
  }

  return (
    <View style={styles.droppingPinOverlay} pointerEvents="box-none">
      <View style={styles.crosshairContainer}>
        <MaterialCommunityIcons name="crosshairs" size={36} color="black" />
      </View>
      <View style={styles.droppingPinButtons}>
        <Pressable
          style={styles.cancelBtn}
          onPress={() => setIsDroppingPin(false)}
        >
          <Text style={styles.btnText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.dropBtn} onPress={handleDropPin}>
          <Text style={styles.btnText}>Drop Pin</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  droppingPinOverlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  crosshairContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  droppingPinButtons: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    gap: 16,
  },
  cancelBtn: {
    padding: 16,
    backgroundColor: Colors.light.error,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dropBtn: {
    padding: 16,
    backgroundColor: "#243e36",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
});
