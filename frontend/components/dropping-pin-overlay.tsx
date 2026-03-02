import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useDroppingPin } from "@/context/DroppingPinContext";

export default function DroppingPinOverlay() {
  const { isDroppingPin, setIsDroppingPin } = useDroppingPin();
  const handleDropPin = () => {
    // pin dropping logic here
    setIsDroppingPin(false);
  };
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
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dropBtn: {
    padding: 16,
    backgroundColor: "#243e36",
    borderRadius: 999,
  },
});
