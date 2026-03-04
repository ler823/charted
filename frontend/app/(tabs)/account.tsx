
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Account() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Account" }} />
      <Text style={styles.text}>Account</Text>
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
