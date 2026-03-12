import AddTagOrList from "@/components/add-tag";
import { PressableStars } from "@/components/pressable-stars";
import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const { pinId, lat: latParam, lng: lngParam } = useLocalSearchParams<{ pinId?: string; lat?: string; lng?: string }>();
  const [lat, setLat] = useState(latParam || "");
  const [lng, setLng] = useState(lngParam || "");
  const isEdit = pinId != undefined;
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [modalVisible, setAddTagVisible] = useState(false);
  const [newTag, setNewTag] = useState("");
  let inserted_pin_id = 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const savePinTags = async () => {
    const { data: tagIds, error: getTagIdsError } = await supabase
      .from("tags")
      .select("tag_id")
      .in("name", selectedTags);

    if (tagIds === null || getTagIdsError) {
      return;
    }

    const pinTagAssociation = tagIds?.map(tag => ({
      pin_id: inserted_pin_id,
      tag_id: tag.tag_id
    }))

    const { error: addToPinTagsError } = await supabase
      .from("pin_tags")
      .insert(pinTagAssociation);

    if (addToPinTagsError) {
      return;
    }

    return;
  }

  const createPin = async () => {
    if (!name || !address) {
      Alert.alert("Missing fields", "Please fill in name and address.");
      return;
    }
    const { data, error } = await supabase
      .rpc('create_pin', {
        p_address: address,
        p_latitude: Math.round(parseFloat(lat!) * 1e5) / 1e5,
        p_longitude: Math.round(parseFloat(lng!) * 1e5) / 1e5,
        p_pin_name: name,
        p_user_note: notes,
        p_user_rating: rating,
        p_username: "TimTimTim"
      })
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    savePinTags();
    router.back();
    inserted_pin_id = data;
    return;
  };

  const handlePickPhoto = () => {
    return;
  };

  const getUserTags = async () => {
    const { data, error } = await supabase
      .from("tags")
      .select(`
      tag_id,
      name,
      users!tags_user_id_fkey (
        username
      )
    `)
      .eq("users.username", "TimTimTim");

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    return data.map((tag: { name: string }) => tag.name);
  }

  const loadTags = async () => {
    const userTags = await getUserTags();
    if (userTags) setTags(userTags);
  };

  const addTag = async () => {
    if (!newTag) {
      Alert.alert("Missing field", "Please enter a name for the new tag");
    }
    const { data: userId, error: userIdError } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", "TimTimTim")
    if (userIdError) {
      Alert.alert("Error", userIdError.message);
      return;
    }
    let tagToAdd = {
      user_id: userId[0].user_id,
      name: newTag
    }

    const { error: addTagError } = await supabase
      .from("tags")
      .insert(tagToAdd)
    if (addTagError) {
      Alert.alert("This tag has already been added", "You have added this tag before");
      return;
    }
    loadTags();
    setAddTagVisible(false)
  }

  const cleanupUnusedTags = async () => {
    const { error } = await supabase
      .rpc("update_tags", { p_username: "TimTimTim" });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
  };

  const getPinInfo = async () => {
    const { data: pinData, error: pinDataError } = await supabase
      .from("pins")
      .select(`
        name,
        user_rating,
        user_note,
        address,
        location_id`)
      .eq("pin_id", pinId)
    if (pinDataError) {
      Alert.alert("Error", pinDataError.message);
      return;
    }
    if (pinData == null) {
      return;
    }
    const { data: locData, error: locDataError } = await supabase
      .from("locations")
      .select(`
        latitude,
        longitude
      `)
      .eq("id", pinData[0].location_id)
    if (locDataError) {
      Alert.alert("Error", locDataError.message);
      return;
    }
    if (locData == null) {
      return;
    }
    setName(pinData[0].name)
    setAddress(pinData[0].address)
    setRating(pinData[0].user_rating)
    setNotes(pinData[0].user_note)
    setLat(locData[0].latitude.toString())
    setLng(locData[0].longitude.toString())
  }

  const updatePin = async () => {
    const { error } = await supabase
      .from("pins")
      .update({
        name: name,
        address: address,
        user_rating: rating,
        user_note: notes
      })
      .eq("pin_id", pinId)
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    router.back();
  }

  // This will run on launch
  useEffect(() => {
    if (isEdit) {
      getPinInfo();
    }
    cleanupUnusedTags();
    loadTags();
  }, []);

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
          <Pressable style={styles.saveBtn} onPress={() => isEdit ? updatePin() : createPin()}>
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
              placeholderTextColor="#aaaaaa"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#aaaaaa"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="Latitude"
              placeholderTextColor="#aaaaaa"
              value={lat}
              editable={false}
            />
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="Longitude"
              placeholderTextColor="#aaaaaa"
              value={lng}
              editable={false}
            />
          </View>
        </View>
        <View>
          <Text style={styles.notesHeading}>Rating</Text>
          <View style={styles.starRow}>
            <PressableStars rating={rating} setRating={setRating} />
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
        <View style={styles.tagTitle}>
          <Text style={styles.notesHeading}>Tags</Text>
          <Pressable onPress={() => setAddTagVisible(true)}>
            <MaterialCommunityIcons name="plus-circle-outline" size={24} color="black" style={styles.addTags} />
          </Pressable>
        </View>

        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
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
          <AddTagOrList isVisible={modalVisible} onClose={() => setAddTagVisible(false)} onSave={addTag} newTag={newTag} setNewTag={setNewTag} />
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
  starRow: {
    flexDirection: "row",
    gap: 5,
    marginVertical: 10,
  },
  tagTitle: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  addTags: {
    marginTop: 24,
    paddingBottom: 6,
    paddingLeft: 10
  }
});
