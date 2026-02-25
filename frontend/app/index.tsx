import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";

import { Ionicons } from "@expo/vector-icons";

// Initial region: CSULB
const INITIAL_REGION = {
  latitude: 33.7838,
  longitude: -118.1141,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function Home() {
  const [isPicking, setIsPicking] = useState(false);
  return (
    <View style={styles.container}>
      {isPicking && (
        <View style={styles.crosshairContainer} pointerEvents="none">
          <Ionicons name="location-sharp" size={40} color="red" />
        </View>
      )}
      <MapView
        initialRegion={INITIAL_REGION}
        style={styles.map}
        onLongPress={() => setIsPicking(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  crosshairContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -40 }], // center the icon
    zIndex: 10,
  },
});
