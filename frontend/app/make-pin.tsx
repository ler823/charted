import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MakePin() {
  const router = useRouter();
  const { lat, lng } = useLocalSearchParams<{ lat: string; lng: string }>();
  // const addPin = usePinsStore((state) => state.addPin);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name || !address) {
      Alert.alert("Missing fields", "Please fill in name and address.");
      return;
    }

    const { error } = await supabase.from("locations").insert({
      name,
      address,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    router.replace("/");
  };

  const handlePickPhoto = () => {
    return;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topBar}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.photoInput} onPress={handlePickPhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <MaterialCommunityIcons name="camera-plus" size={28} color="#888" />
          )}
        </Pressable>
        <View style={styles.fields}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            placeholder="Latitude"
            value={lat}
            editable={false}
          />
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            placeholder="Longitude"
            value={lng}
            editable={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cancelBtn: {
    padding: 16,
    backgroundColor: Colors.light.error,
    borderRadius: 999,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveBtn: {
    padding: 16,
    backgroundColor: "#243e36",
    borderRadius: 999,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  photoInput: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  fields: {
    flex: 1,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  inputDisabled: {
    color: "#ccc",
  },
});
