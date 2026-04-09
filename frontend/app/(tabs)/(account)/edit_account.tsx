import { useAuth } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Account() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Account" }} />
      <Text style={styles.text}>Account</Text>
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
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
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
  },
});
