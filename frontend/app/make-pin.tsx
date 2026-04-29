import AddPhotoModal from "@/components/add-photo";
import AddTagOrList from "@/components/add-tag";
import AddVisit from "@/components/add-visit";
import CoverPhotoModal from "@/components/cover-photo-modal";
import DeletePhotoModal from "@/components/delete-photo";
import LoadingPage from "@/components/loading-page";
import { PressableStars } from "@/components/pressable-stars";
import { Colors, Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TargetedEvent,
  Text,
  TextInput,
  View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLocation } from "@/hooks/use-location";
import { getPhotoUrl, pickImageAsync, processImage } from "@/lib/photo-utils";
import {
  addList as addListService,
  getUserLists,
  syncPinLists,
} from "@/lib/services/listService";
import {
  checkDuplicateAddress,
  createPin as createPinService,
  deletePin as deletePinService,
  getPinInfo,
  updatePin as updatePinService,
} from "@/lib/services/pinService";
import {
  addTag as addTagService,
  cleanupUnusedTags,
  getUserTags,
  syncPinTags,
} from "@/lib/services/tagService";
import { saveNewVisits } from "@/lib/services/visitService";
import { ListType, PhotoItem } from "@/types/types";

export default function MakePin() {
  const router = useRouter();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const {
    pinId,
    lat: latParam,
    lng: lngParam,
    viewMode,
  } = useLocalSearchParams<{
    pinId?: string;
    lat?: string;
    lng?: string;
    viewMode: string;
  }>();
  const [lat, setLat] = useState(
    (Math.round(parseFloat(latParam!) * 1e5) / 1e5).toString() || "",
  );
  const [lng, setLng] = useState(
    (Math.round(parseFloat(lngParam!) * 1e5) / 1e5).toString() || "",
  );
  const isEdit = pinId != undefined;
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const NAME_MAX = 50;
  const ADDRESS_MAX = 100;
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [duplicateAddressError, setDuplicateAddressError] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [coverPhotoKey, setCoverPhotoKey] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [lists, setLists] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [addTagVisible, setAddTagVisible] = useState(false);
  const [addListVisible, setAddListVisible] = useState(false);
  const [addVisitVisible, setAddVisitVisible] = useState(false);
  const [visits, setVisits] = useState<string[]>([]);
  const [newVisit, setNewVisit] = useState("");
  const [originalVisits, setOriginalVisits] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<ListType>({ name: "", privacy: 1 });
  const [newList, setNewList] = useState<ListType>({ name: "", privacy: 1 });
  const [newListPrivacy, setNewListPrivacy] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const privateDescription = "Only you can view this pin";
  const publicDescription = "All of your friends can view this pin";
  const [privacyDescription, setPrivacyDescription] =
    useState(publicDescription);
  const [notesHeight, setNotesHeight] = useState(100);
  const [coverPhotoChanged, setCoverPhotoChanged] = useState(false);
  const [coverPhotoModalVisible, setCoverPhotoModalVisible] = useState(false);
  const [addPhotoModalVisible, setAddPhotoModalVisible] = useState(false);
  const [deletePhotoModalVisible, setDeletePhotoModalVisible] = useState(false);
  const [saveUpdateInitiated, setSaveUpdateInitiated] = useState(false);
  const [photoList, setPhotoList] = useState<PhotoItem[]>([]);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoItem | null>(null);
  const [photosToDelete, setPhotosToDelete] = useState<PhotoItem[]>([]);
  const scrollRef = React.useRef<KeyboardAwareScrollView>(null);
  const duplicateCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const originalName = useRef("");
  const originalAddress = useRef("");
  const originalRating = useRef(0);
  const originalNotes = useRef("");
  const originalPrivacy = useRef(false);
  const insertedPinId = useRef(0);
  const { userCoords } = useLocation();

  // Debounce duplicate address checks so we don't fire on every keystroke
  useEffect(() => {
    if (duplicateCheckTimer.current) {
      clearTimeout(duplicateCheckTimer.current);
    }
    duplicateCheckTimer.current = setTimeout(async () => {
      if (!profile) return;
      const conflictName = await checkDuplicateAddress(
        profile.user_id,
        address,
        isEdit ? pinId : undefined,
      );
      setDuplicateAddressError(
        conflictName
          ? `You already have this address saved as: ${conflictName}`
          : "",
      );
    }, 400);

    return () => {
      if (duplicateCheckTimer.current) {
        clearTimeout(duplicateCheckTimer.current);
      }
    };
  }, [address]);

  const togglePrivacy = () => {
    setIsPrivate((previousState) => !previousState);
    if (isPrivate) {
      setPrivacyDescription(publicDescription);
    } else {
      setPrivacyDescription(privateDescription);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleList = (list: string) => {
    setSelectedLists((prev) =>
      prev.includes(list) ? prev.filter((t) => t !== list) : [...prev, list],
    );
  };

  const createPin = async () => {
    if (saveUpdateInitiated) return;
    setSaveUpdateInitiated(true);

    const nameInvalid = !name.trim() || name.length > NAME_MAX;
    const addressInvalid = address.length > ADDRESS_MAX;
    if (nameInvalid) {
      setNameError(
        !name.trim()
          ? "Name is required."
          : `Name must be ${NAME_MAX} characters or fewer.`,
      );
    }
    if (addressInvalid) {
      setAddressError(`Address must be ${ADDRESS_MAX} characters or fewer.`);
    }
    if (nameInvalid || addressInvalid) return;

    const { pinId: newPinId, error } = await createPinService({
      address,
      latitude: Math.round(parseFloat(lat!) * 1e5) / 1e5,
      longitude: Math.round(parseFloat(lng!) * 1e5) / 1e5,
      name,
      isPrivate,
      notes,
      rating,
      userId: profile!.user_id,
    });
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    insertedPinId.current = newPinId!;
    await syncPinTags(newPinId!, selectedTags);
    await syncPinLists(newPinId!, selectedLists);
    await saveNewVisits(newPinId!, visits, originalVisits);
    if (coverPhotoChanged) {
      await uploadPhoto(coverPhotoUrl, true);
    }
    for (const photo of photoList) {
      if (photo.changed) {
        await uploadPhoto(photo.url, false);
      }
    }
    showToast("Pin saved!");
    router.back();
  };

  const handleChooseFromLibrary = async (cover: boolean) => {
    const result = await pickImageAsync();
    setCoverPhotoModalVisible(false);
    setAddPhotoModalVisible(false);
    if (!result) return;
    const uri = result!.assets[0].uri;
    const processedImage = await processImage(uri);
    if (cover) {
      setCoverPhotoUrl(processedImage.uri);
      setCoverPhotoChanged(true);
    } else {
      setPhotoList((prev) => [
        ...prev,
        { key: "", url: processedImage.uri, changed: true },
      ]);
    }
  };

  const handleDeletePhoto = async (
    key: string,
    url: string,
    cover: boolean,
  ) => {
    if (key == "") {
      setPhotoList(photoList.filter((photo) => photo.url !== url));
    } else {
      setPhotoList(photoList.filter((photo) => photo.url !== url));
      setPhotosToDelete((prev) => [
        ...prev,
        { key: key, url: url, changed: true },
      ]);
    }

    if (cover) {
      setCoverPhotoUrl("");
      setCoverPhotoKey("");
    }
    setCoverPhotoModalVisible(false);
  };

  const deletePhoto = async (key: string) => {
    setCoverPhotoModalVisible(false);
    const { data, error: deletePhotoError } = await supabase
      .from("photos")
      .delete()
      .eq("key", key)
      .select("photo_id")
      .single();

    if (deletePhotoError) {
      Alert.alert("Error", deletePhotoError.message);
    }

    const res = await fetch(
      "https://4nm4iifq65.execute-api.us-east-2.amazonaws.com/deletephotourl",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: key }),
      },
    );

    const { url } = await res.json();
    if (!url) {
      console.log("No URL returned");
      return;
    }
    const deleteRes = await fetch(url, {
      method: "DELETE",
    });
    if (!deleteRes.ok) {
      console.log("S3 delete failed");
    }
  };

  const uploadPhoto = async (photoUrl: string, cover: boolean) => {
    const imageFile = await fetch(photoUrl);
    const imageFileBlob = await imageFile.blob();
    const res = await fetch(
      "https://4nm4iifq65.execute-api.us-east-2.amazonaws.com/uploadphotourl",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "image/jpeg",
        }),
      },
    );
    const { uploadUrl, key } = await res.json();

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: imageFileBlob,
    });

    if (!response.ok) {
      console.log("Something went wrong when uploading");
    }
    const { data, error: addPhotoError } = await supabase
      .from("photos")
      .insert({
        key: key,
      })
      .select("photo_id")
      .single();

    if (addPhotoError) {
      Alert.alert("Error", addPhotoError.message);
    }

    const { error: pinPhotoError } = await supabase.from("pin_photos").insert({
      pin_id: insertedPinId.current === 0 ? pinId : insertedPinId.current,
      photo_id: data!.photo_id,
      cover: cover,
    });

    if (pinPhotoError) {
      Alert.alert("Error", pinPhotoError.message);
    }
  };

  const loadPhotos = async (keys: string[], cover: boolean) => {
    let signedUrls = await getPhotoUrl(keys);
    if (cover) {
      let signedCoverPhotoUrl = signedUrls[0].url;
      let coverPhotoKey = keys[0];
      setCoverPhotoUrl(signedCoverPhotoUrl);
      setCoverPhotoKey(coverPhotoKey);
    } else {
      setPhotoList(signedUrls);
    }
  };

  const loadTags = async () => {
    if (!profile) return;
    const userTags = await getUserTags(profile.user_id);
    setTags(userTags);
  };

  const loadLists = async () => {
    if (!profile) return;
    const userLists = await getUserLists(profile.user_id);
    setLists(userLists);
  };

  const addTag = async () => {
    if (!newTag.name) {
      Alert.alert("Missing field", "Please enter a name for the new tag");
      return;
    }
    if (!profile) return;
    const error = await addTagService(
      profile.user_id,
      newTag.name,
      newTag.privacy,
    );
    if (error) {
      Alert.alert(
        "This tag has already been added",
        "You have added this tag before",
      );
      return;
    }
    loadTags();
    toggleTag(newTag.name);
    setAddTagVisible(false);
  };

  const addList = async () => {
    if (!newList.name) {
      Alert.alert("Missing field", "Please enter a name for the new list");
      return;
    }
    if (!profile) return;
    const error = await addListService(
      profile.user_id,
      newList.name,
      newList.privacy,
    );
    if (error) {
      Alert.alert(
        "This list has already been added",
        "You have added a list with this name before",
      );
      return;
    }
    loadLists();
    toggleList(newList.name);
    setAddListVisible(false);
  };

  const addVisit = async (visitDate: string) => {
    if (!visitDate) {
      Alert.alert("Missing field", "Please enter a date for the new visit");
      return;
    }
    setVisits((prev) => [...prev, visitDate]);
    setNewVisit("");
    setAddVisitVisible(false);
  };

  const loadPinInfo = async () => {
    if (!pinId) return;
    const { data, error } = await getPinInfo(pinId);
    if (error || !data) {
      Alert.alert("Error", error ?? "Failed to load pin");
      return;
    }

    setName(data.name);
    originalName.current = data.name;
    setAddress(data.address);
    originalAddress.current = data.address;
    setRating(data.rating);
    originalRating.current = data.rating;
    setNotes(data.notes);
    originalNotes.current = data.notes;
    setIsPrivate(data.isPrivate);
    originalPrivacy.current = data.isPrivate;
    setLat(data.latitude.toString());
    setLng(data.longitude.toString());
    setSelectedTags(data.selectedTags);
    setSelectedLists(data.selectedLists);
    setVisits(data.visits);
    setOriginalVisits(data.visits);

    if (data.coverPhotoKey) {
      setCoverPhotoKey(data.coverPhotoKey);
      await loadPhotos([data.coverPhotoKey], true);
    }
    if (data.otherPhotoKeys.length > 0) {
      await loadPhotos(data.otherPhotoKeys, false);
    }
  };

  const updatePin = async () => {
    if (saveUpdateInitiated) return;
    setSaveUpdateInitiated(true);

    const error = await updatePinService(pinId!, {
      name,
      address,
      rating,
      notes,
      isPrivate,
    });
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    await syncPinTags(pinId!, selectedTags);
    await syncPinLists(pinId!, selectedLists);
    await saveNewVisits(Number(pinId), visits, originalVisits);

    if (coverPhotoChanged) {
      await uploadPhoto(coverPhotoUrl, true);
    }
    for (const photo of photoList) {
      if (photo.changed) {
        await uploadPhoto(photo.url, false);
      }
    }
    if (photosToDelete.length > 0) {
      for (const photo of photosToDelete) {
        deletePhoto(photo.key);
      }
    }
    showToast("Pin updated!");
    router.back();
  };

  const deletePin = async () => {
    Alert.alert(
      "Are you sure you want to delete this pin?",
      "This action cannot be undone",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const error = await deletePinService(pinId!);
            if (error) console.error("[deletePin]", error);
            showToast("Pin deleted");
            router.replace({
              pathname: "/(tabs)/(home)",
              params: { viewMode },
            });
          },
        },
      ],
    );
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (text.length > NAME_MAX) {
      setNameError(`Name must be ${NAME_MAX} characters or fewer`);
    } else {
      setNameError("");
    }
  };

  const handleAddressChange = (text: string) => {
    setAddress(text);
    if (text.length > ADDRESS_MAX) {
      setAddressError(`Address must be ${ADDRESS_MAX} characters or fewer`);
    } else {
      setAddressError("");
    }
  };

  const fetchNearestPlace = async () => {
    if (!lat || !lng) return;

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=establishment&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY}`;

    const res = await fetch(url);
    const json = await res.json();

    const nearest = json.results?.[0];
    if (!nearest) return;

    setName(nearest.name ?? "");

    const placeId = nearest.place_id;
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsJson = await detailsRes.json();

    const formatted =
      detailsJson.result?.formatted_address ?? nearest.vicinity ?? "";
    const withoutCountry = formatted
      .replace(/, USA$/, "")
      .replace(/, United States$/, "");
    setAddress(withoutCountry);
  };

  useEffect(() => {
    const loadData = async () => {
      if (isEdit) {
        await loadPinInfo();
      } else {
        fetchNearestPlace();
      }
      if (profile) await cleanupUnusedTags(profile.user_id);
      await loadTags();
      await loadLists();
      setDataLoaded(true);
    };
    loadData();
  }, []);

  if (!dataLoaded) {
    return <LoadingPage />;
  }

  const saveDisabled = !name || !!duplicateAddressError;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[styles.saveBtn, saveDisabled && styles.saveBtnDisabled]}
          onPress={() => {
            if (!saveDisabled) {
              isEdit ? updatePin() : createPin();
            }
          }}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
      {/* This Pressable wrapper allows us to cancel text input by closing keyboard when clicking outside */}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps={"handled"}
        ref={scrollRef}
      >
        <View style={styles.container}>
          <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            {/*  SafeAreaView places elements under the phone's status bar */}
            <SafeAreaView>
              <Stack.Screen
                options={{ headerShown: false, animation: "slide_from_right" }}
              />

              <View>
                <View style={styles.latLngHeader}>
                  <Text style={styles.latLngText}>Pin at</Text>
                  <Text style={styles.latLngText}>
                    ({lat}, {lng})
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.shadowWrapper}>
                  <Pressable
                    style={styles.photoInput}
                    onPress={() => setCoverPhotoModalVisible(true)}
                  >
                    {coverPhotoUrl ? (
                      <Image
                        source={{ uri: coverPhotoUrl }}
                        style={styles.photo}
                        transition={500}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="camera-plus"
                        size={28}
                        color="#888"
                      />
                    )}
                  </Pressable>
                </View>
                <CoverPhotoModal
                  isVisible={coverPhotoModalVisible}
                  onClose={() => setCoverPhotoModalVisible(false)}
                  onChooseFromLibrary={() => handleChooseFromLibrary(true)}
                  onDelete={() => handleDeletePhoto(coverPhotoKey, "", true)}
                />
                <View style={styles.fields}>
                  <View style={styles.fields}>
                    <GooglePlacesAutocomplete
                      placeholder="Name"
                      fetchDetails={true}
                      disableScroll={true}
                      onPress={(data, details = null) => {
                        handleNameChange(data.structured_formatting.main_text);
                        handleAddressChange(details?.formatted_address ?? "");
                      }}
                      query={{
                        key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY,
                        language: "en",
                        types: "establishment",
                        location: userCoords
                          ? `${userCoords.latitude},${userCoords.longitude}`
                          : undefined,
                        radius: 500,
                      }}
                      textInputProps={{
                        placeholderTextColor: "#aaaaaa",
                        value: name,
                        onChangeText: handleNameChange,
                        maxLength: NAME_MAX + 1,
                        onFocus: (event: NativeSyntheticEvent<TargetedEvent>) =>
                          scrollRef.current?.scrollToFocusedInput(event.target),
                        style: [
                          styles.input,
                          nameError ? styles.inputError : null,
                        ],
                      }}
                      styles={addressInputStyles}
                    />
                    {nameError ? (
                      <Text style={styles.errorText}>{nameError}</Text>
                    ) : null}

                    <GooglePlacesAutocomplete
                      placeholder="Address"
                      fetchDetails={true}
                      disableScroll={true}
                      onPress={(data, details = null) => {
                        const address = data.description;
                        handleAddressChange(address);
                      }}
                      query={{
                        key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY,
                        language: "en",
                        types: "address",
                        location: userCoords
                          ? `${userCoords.latitude},${userCoords.longitude}`
                          : undefined,
                        radius: 500,
                      }}
                      listViewDisplayed={false}
                      textInputProps={{
                        placeholderTextColor: "#aaaaaa",
                        value: address,
                        onChangeText: handleAddressChange,
                        maxLength: ADDRESS_MAX + 1,
                        onFocus: (event: NativeSyntheticEvent<TargetedEvent>) =>
                          scrollRef.current?.scrollToFocusedInput(event.target),
                        style: [
                          styles.input,
                          addressError || duplicateAddressError
                            ? styles.inputError
                            : null,
                        ],
                      }}
                      styles={addressInputStyles}
                    />

                    {addressError ? (
                      <Text style={styles.errorText}>{addressError}</Text>
                    ) : null}
                    {duplicateAddressError ? (
                      <Text style={styles.errorText}>
                        {duplicateAddressError}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
              <View style={styles.ratingsPrivacyRow}>
                <View>
                  <Text style={styles.notesHeading}>Rating</Text>
                  <View style={styles.starRow}>
                    <PressableStars rating={rating} setRating={setRating} />
                  </View>
                </View>
              </View>
              <View>
                <Text style={styles.notesHeading}>Private</Text>
                <View style={styles.privacySwitchBackground}>
                  <Switch
                    trackColor={{
                      false: Colors.light.text,
                      true: Colors.light.accent,
                    }}
                    thumbColor="#FFF"
                    ios_backgroundColor={Colors.light.text}
                    onValueChange={togglePrivacy}
                    value={isPrivate}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.privacyDescription}>
                      {privacyDescription}
                    </Text>
                  </View>
                </View>
              </View>
              <View>
                <Text style={styles.notesHeading}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Enter notes here"
                  value={notes}
                  onChangeText={setNotes}
                  multiline={true}
                  scrollEnabled={false}
                  textAlignVertical="top"
                  onFocus={(event) => {
                    scrollRef.current?.scrollToFocusedInput(event.target);
                  }}
                  onContentSizeChange={(event) => {
                    setNotesHeight(event.nativeEvent.contentSize.height);
                  }}
                />
              </View>
              {/* Tags */}
              <View style={styles.tagTitle}>
                <Text style={styles.notesHeading}>Tags</Text>
                <Pressable onPress={() => setAddTagVisible(true)}>
                  <MaterialCommunityIcons
                    name="plus-circle-outline"
                    size={24}
                    color="black"
                    style={styles.addTags}
                  />
                </Pressable>
              </View>

              <View style={styles.tagsContainer}>
                {tags.length === 0 && (
                  <Text style={styles.emptyTagLabel}>
                    You have not created any tags
                  </Text>
                )}
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
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color="#fff"
                        />
                      )}
                    </View>
                    <Text
                      style={styles.tagLabel}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {tag}
                    </Text>
                  </Pressable>
                ))}
                <AddTagOrList
                  name="tag"
                  isVisible={addTagVisible}
                  onClose={() => setAddTagVisible(false)}
                  onSave={addTag}
                  newEntry={newTag}
                  setNewEntry={setNewTag}
                />
              </View>

              {/* Lists */}

              <View style={styles.tagTitle}>
                <Text style={styles.notesHeading}>Lists</Text>
                <Pressable onPress={() => setAddListVisible(true)}>
                  <MaterialCommunityIcons
                    name="plus-circle-outline"
                    size={24}
                    color="black"
                    style={styles.addTags}
                  />
                </Pressable>
              </View>

              <View style={styles.tagsContainer}>
                {lists.length == 0 && (
                  <Text style={styles.emptyTagLabel}>
                    You have not created any lists
                  </Text>
                )}
                {lists.map((list) => (
                  <Pressable
                    key={list}
                    style={styles.tagRow}
                    onPress={() => toggleList(list)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedLists.includes(list) && styles.checkboxChecked,
                      ]}
                    >
                      {selectedLists.includes(list) && (
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color="#fff"
                        />
                      )}
                    </View>
                    <Text
                      style={styles.tagLabel}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {list}
                    </Text>
                  </Pressable>
                ))}
                <AddTagOrList
                  name="list"
                  isVisible={addListVisible}
                  onClose={() => setAddListVisible(false)}
                  onSave={addList}
                  newEntry={newList}
                  setNewEntry={setNewList}
                />
              </View>

              <View style={styles.tagTitle}>
                <Text style={styles.notesHeading}>Visits</Text>
                <Pressable onPress={() => setAddVisitVisible(true)}>
                  <MaterialCommunityIcons
                    name="plus-circle-outline"
                    size={24}
                    color="black"
                    style={styles.addTags}
                  />
                </Pressable>
              </View>
              <View style={[styles.tagsContainer, { minHeight: 100 }]}>
                {visits.length == 0 && (
                  <Text style={styles.emptyTagLabel}>
                    You have no visits entered
                  </Text>
                )}
                <ScrollView>
                  {visits.map((visit) => {
                    const [year, month, day] = visit.split("-").map(Number);
                    const displayDate = `${month}/${day}/${year}`;
                    return (
                      <Text style={styles.tagLabel} key={visit}>
                        {displayDate}
                      </Text>
                    );
                  })}
                </ScrollView>
                <AddVisit
                  isVisible={addVisitVisible}
                  onClose={() => setAddVisitVisible(false)}
                  onSave={addVisit}
                  newVisit={newVisit}
                  setNewVisit={setNewVisit}
                />
              </View>

              <View style={styles.tagTitle}>
                <Text style={styles.notesHeading}>Photos</Text>
                <Pressable onPress={() => setAddPhotoModalVisible(true)}>
                  <MaterialCommunityIcons
                    name="plus-circle-outline"
                    size={24}
                    color="black"
                    style={styles.addTags}
                  />
                </Pressable>
              </View>
              <View style={[styles.tagsContainer, { minHeight: 100 }]}>
                {photoList.length == 0 && (
                  <Text style={styles.emptyTagLabel}>
                    You have no photos yet
                  </Text>
                )}
                <FlatList
                  horizontal
                  data={photoList}
                  keyExtractor={(photo) => photo.key || photo.url}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => setPhotoToDelete(item)}>
                      <Image
                        source={{ uri: item.url }}
                        style={styles.photoCarousel}
                        transition={500}
                      />
                    </Pressable>
                  )}
                  ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                />
              </View>
              <AddPhotoModal
                isVisible={addPhotoModalVisible}
                onClose={() => setAddPhotoModalVisible(false)}
                onChooseFromLibrary={() => handleChooseFromLibrary(false)}
              />
              <DeletePhotoModal
                isVisible={!!photoToDelete}
                onClose={() => setPhotoToDelete(null)}
                onDelete={() => {
                  if (photoToDelete)
                    handleDeletePhoto(
                      photoToDelete.key,
                      photoToDelete.url,
                      false,
                    );
                  setPhotoToDelete(null);
                }}
              />

              {isEdit && (
                <View style={{ alignSelf: "center" }}>
                  <Pressable style={styles.deleteBtn} onPress={deletePin}>
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={24}
                      color="#fff"
                    />
                    <Text style={styles.cancelText}>Delete</Text>
                  </Pressable>
                </View>
              )}
            </SafeAreaView>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const addressInputStyles = {
  container: {
    flex: 0,
    width: "100%",
  },
  textInputContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    margin: 0,
    width: "100%",
  },
  textInput: {
    flex: 1,
    height: undefined,
    borderRadius: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: undefined,
    backgroundColor: "transparent",
    margin: 0,
    width: "100%",
  },
  listView: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 8,
    marginTop: 4,
    position: "absolute",
    zIndex: 100,
    top: "100%",
  },
  row: {
    backgroundColor: "#ffffff",
    padding: 13,
  },
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    position: "absolute",
    top: 45,
    right: 16,
    left: 16,
    zIndex: 10,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.error,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: "#243e36",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: "#888",
    shadowOpacity: 0,
    elevation: 0,
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
    marginTop: 25,
  },
  photoInput: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  fields: {
    zIndex: 10,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    width: "100%",
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
    minHeight: 100,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "33.33%",
    paddingVertical: 6,
    paddingRight: 8,
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
    fontFamily: Fonts.regular,
    flex: 1,
  },
  starRow: {
    flexDirection: "row",
    gap: 5,
    backgroundColor: Colors.light.accentLight,
    alignSelf: "flex-start",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  tagTitle: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  addTags: {
    marginTop: 24,
    paddingBottom: 6,
    paddingLeft: 10,
  },
  shadowWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  deleteBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.error,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
    marginTop: 24,
  },
  ratingsPrivacyRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "flex-start",
  },
  privacySwitchBackground: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.light.accentLight,
    alignSelf: "flex-start",
    alignItems: "center",
    padding: 9.5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  latLngHeader: {
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  latLngText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    flexShrink: 1,
  },
  privacyDescription: {
    flexShrink: 1,
    fontFamily: Fonts.regular,
    marginLeft: 8,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 2,
    marginLeft: 4,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  photoCarousel: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  emptyTagLabel: {
    fontFamily: Fonts.regular,
    paddingVertical: 10,
  },
});
