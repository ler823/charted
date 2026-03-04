import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Friends() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Friends" }} />
      <Text style={styles.text}>Friends</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
