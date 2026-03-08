import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
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
  const [notes, setNotes] = useState("");
  const TAGS = ["coffee", "pastries", "lunch", "breakfast", "dinner", "busy"];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

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
    /* This Pressable wrapper allows us to cancel text input by closing keyboard when clicking outside */
    <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      {/*  SafeAreaView places elements under the phone's status bar */}
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
              <MaterialCommunityIcons
                name="camera-plus"
                size={28}
                color="#888"
              />
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
        <View>
          <Text style={styles.notesHeading}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Enter notes here"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.notesHeading}>Tags</Text>
        <View style={styles.tagsContainer}>
          {TAGS.map((tag) => (
            <Pressable
              key={tag}
              style={styles.tagRow}
              onPress={() => toggleTag(tag)}
            >
              <View
                style={[
                  styles.checkbox,
                  selectedTags.includes(tag) && styles.checkboxChecked,
                ]}
              >
                {selectedTags.includes(tag) && (
                  <MaterialCommunityIcons name="check" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.tagLabel}>{tag}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </Pressable>
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
    backgroundColor: Colors.light.accentLight,
    fontFamily: Fonts.regular,
  },
  inputDisabled: {
    color: "#ccc",
  },
  notesHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    paddingBottom: 6,
    color: "#243e36",
    fontFamily: Fonts.regular,
  },
  notesInput: {
    height: 100,
    backgroundColor: Colors.light.accentLight,
  },
  tagsContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: Colors.light.accentLight,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "33.33%",
    paddingVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#aaa",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.background,
  },
  tagLabel: {
    fontSize: 15,
    color: "#333",
    textTransform: "capitalize",
  },
});
