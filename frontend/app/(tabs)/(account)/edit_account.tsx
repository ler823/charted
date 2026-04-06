import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function EditAccount() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Edit Account" }} />
      <Text style={styles.text}>Edit Account</Text>
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