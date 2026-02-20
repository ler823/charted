import React from "react";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";

// Initial region: CSULB
const INITIAL_REGION = {
  latitude: 33.7838,
  longitude: -118.1141,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function App() {
  return (
    <View style={styles.container}>
      <MapView initialRegion={INITIAL_REGION} style={styles.map} />
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
});
