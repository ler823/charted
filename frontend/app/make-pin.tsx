import AddPhotoModal from "@/components/add-photo";
import AddTagOrList from "@/components/add-tag";
import AddVisit from "@/components/add-visit";
import CoverPhotoModal from "@/components/cover-photo-modal";
import DeletePhotoModal from "@/components/delete-photo";
import LoadingPage from "@/components/loading-page";
import { PressableStars } from "@/components/pressable-stars";
import { Colors, Fonts } from "@/constants/theme";
import { setPinChanged } from "@/lib/pin_refresh_data";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type PhotoItem = {
  key: string,
  url: string,
  changed: boolean,
};

export async function getPhotoUrl(keys: string[]) {
  const res = await fetch(
    "https://4nm4iifq65.execute-api.us-east-2.amazonaws.com/downloadphotourl",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keys }),
    }
  );

  const { urls } = await res.json();
  return urls;
}

export default function MakePin() {
  const router = useRouter();
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
  const [newTag, setNewTag] = useState("");
  const [newList, setNewList] = useState("");
  const [newListPrivacy, setNewListPrivacy] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const privateDescription = "Only you can view this pin";
  const publicDescription = "All of your friends can view this pin";
  const [privacyDescription, setPrivacyDescription] = useState(publicDescription);
  const [notesHeight, setNotesHeight] = useState(100);
  const [coverPhotoChanged, setCoverPhotoChanged] = useState(false);
  const [coverPhotoModalVisible, setCoverPhotoModalVisible] = useState(false)
  const [addPhotoModalVisible, setAddPhotoModalVisible] = useState(false)
  const [deletePhotoModalVisible, setDeletePhotoModalVisible] = useState(false)
  const [saveUpdateInitiated, setSaveUpdateInitiated] = useState(false)
  const [photoList, setPhotoList] = useState<PhotoItem[]>([]);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoItem | null>(null);
  const [photosToDelete, setPhotosToDelete] = useState<PhotoItem []>([]);
  const scrollRef = React.useRef<KeyboardAwareScrollView>(null);
  let originalName = ""
  let originalAddress = ""
  let originalRating = 0
  let originalNotes = ""
  let originalPrivacy = false
  let inserted_pin_id = 0;

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

  const savePinTags = async () => {
    const { data: tagIds, error: getTagIdsError } = await supabase
      .from("tags")
      .select(`"tag_id"`)
      .in("name", selectedTags);

    if (tagIds === null || getTagIdsError) {
      return;
    }

    const pinTagAssociation = tagIds?.map((tag) => ({
      pin_id: inserted_pin_id,
      tag_id: tag.tag_id,
    }));

    const { error: addToPinTagsError } = await supabase
      .from("pin_tags")
      .insert(pinTagAssociation);

    if (addToPinTagsError) {
      return;
    }

    return;
  };

  const savePinLists = async () => {
    const { data: listIds, error: getListIdsError } = await supabase
      .from("lists")
      .select(`"list_id"`)
      .in("name", selectedLists);

    if (listIds === null || getListIdsError) {
      return;
    }

    const pinListAssociation = listIds?.map((list) => ({
      pin_id: inserted_pin_id,
      list_id: list.list_id,
    }));

    const { error: addToPinTagsError } = await supabase
      .from("pin_lists")
      .insert(pinListAssociation);

    if (addToPinTagsError) {
      return;
    }

    return;
  };

  const createPin = async () => {
    if (saveUpdateInitiated) {
      return;
    }
    setSaveUpdateInitiated(true)
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
    if (nameInvalid || addressInvalid) return; // block submit

    const { data, error } = await supabase.rpc("create_pin", {
      p_address: address,
      p_latitude: Math.round(parseFloat(lat!) * 1e5) / 1e5,
      p_longitude: Math.round(parseFloat(lng!) * 1e5) / 1e5,
      p_pin_name: name,
      p_private: isPrivate,
      p_user_note: notes,
      p_user_rating: rating,
      p_username: "TimTimTim",
    });
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    inserted_pin_id = data;
    await savePinTags();
    await savePinLists();
    await saveVisits(inserted_pin_id);
    if (coverPhotoChanged) {
      await uploadPhoto(coverPhotoUrl, true);
    }
    for (const photo of photoList) {
      if (photo.changed) {
        await uploadPhoto(photo.url, false)
      }
    }
    router.back();
    return;
  };

  const processImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }], // keeps aspect ratio
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result;
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      return result;
    }
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
      setPhotoList((prev) => [...prev, { key: "", url: processedImage.uri, changed: true }]);
    }
  };

  const handleDeletePhoto = async (key: string, url: string, cover: boolean) => {
    if (key == "") {
      //remove from the list
      setPhotoList(photoList.filter((photo) => photo.url != url))
    } else {
      //remove from db
      setPhotoList(photoList.filter((photo) => photo.url != url))
      setPhotosToDelete((prev) => [...prev, { key: key, url: url, changed: true}])
      //deletePhoto(key);
    }

    if (cover) {
      setCoverPhotoUrl("")
      setCoverPhotoKey("")
    }
    setCoverPhotoModalVisible(false)
  }

  const deletePhoto = async (key: string) => {
    setCoverPhotoModalVisible(false);
    // if (coverPhotoUrl == "") {
    //   return;
    // }
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
      }
    );

    const { url } = await res.json();
    if (!url) {
      console.log("No URL returned");
      return;
    }
    const deleteRes = await fetch(url, {
      method: "DELETE"
    })
    if (!deleteRes.ok) {
      console.log("S3 delete failed")
    }
  }

  const uploadPhoto = async (photoUrl: string, cover: boolean) => {
    const imageFile = await fetch(photoUrl)
    const imageFileBlob = await imageFile.blob();
    const res = await fetch('https://4nm4iifq65.execute-api.us-east-2.amazonaws.com/uploadphotourl', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: "image/jpeg",
      }),
    });
    const { uploadUrl, key } = await res.json();

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: imageFileBlob,
    })

    if (!response.ok) {
      console.log("Something went wrong when uploading")
    }
    const { data, error: addPhotoError } = await supabase
      .from("photos")
      .insert({
        key: key
      })
      .select("photo_id")
      .single()

    if (addPhotoError) {
      Alert.alert("Error", addPhotoError.message);
    }

    const { error: pinPhotoError } = await supabase
      .from("pin_photos")
      .insert({
        pin_id: (inserted_pin_id == 0) ? pinId : inserted_pin_id,
        photo_id: data!.photo_id,
        cover: cover,
      })

    if (pinPhotoError) {
      Alert.alert("Error", pinPhotoError.message);
    }
  }

  const loadPhotos = async (keys: string[], cover: boolean) => {
    let signedUrls = await getPhotoUrl(keys);
    if (cover) {
      let signedCoverPhotoUrl = signedUrls[0].url;
      let coverPhotoKey = keys[0]
      setCoverPhotoUrl(signedCoverPhotoUrl);
      setCoverPhotoKey(coverPhotoKey)
    } else {
      setPhotoList(signedUrls)
    }
  };

  const getUserTags = async () => {
    const { data, error } = await supabase
      .from("tags")
      .select(
        `
      tag_id,
      name,
      users!tags_user_id_fkey (
        username
      )
    `,
      )
      .eq("users.username", "TimTimTim");

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    return data.map((tag: { name: string }) => tag.name);
  };

   const getUserLists = async () => {
    const { data, error } = await supabase
      .from("lists")
      .select(
        `
      list_id,
      name,
      users!lists_user_id_fkey (
        username
      )
    `,
      )
      .eq("users.username", "TimTimTim");

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    return data.map((list: { name: string }) => list.name);
  };

  const loadTags = async () => {
    const userTags = await getUserTags();
    if (userTags) setTags(userTags);
  };

  const loadLists = async () => {
    const userLists = await getUserLists();
    if (userLists) setLists(userLists);
  };

  const addTag = async () => {
    if (!newTag) {
      Alert.alert("Missing field", "Please enter a name for the new tag");
      return;
    }
    const { data: userId, error: userIdError } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", "TimTimTim");
    if (userIdError) {
      Alert.alert("Error", userIdError.message);
      return;
    }
    let tagToAdd = {
      user_id: userId[0].user_id,
      name: newTag,
    };

    const { error: addTagError } = await supabase.from("tags").insert(tagToAdd);
    if (addTagError) {
      Alert.alert(
        "This tag has already been added",
        "You have added this tag before",
      );
      return;
    }
    loadTags();
    toggleTag(tagToAdd.name);
    setAddTagVisible(false);
  };

  const addList = async () => {
    if (!newList) {
      Alert.alert("Missing field", "Please enter a name for the new list");
      return;
    }
    const { data: userId, error: userIdError } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", "TimTimTim");
    if (userIdError) {
      Alert.alert("Error", userIdError.message);
      return;
    }
    let listToAdd = {
      user_id: userId[0].user_id,
      name: newList,
    };

    const { error: addListError } = await supabase.from("lists").insert(listToAdd);
    if (addListError) {
      Alert.alert(
        "This list has already been added",
        "You have added a list with this name before",
      );
      return;
    }
    loadLists();
    toggleList(listToAdd.name);
    setAddListVisible(false);
  };

  const getUserVisits = async () => {
    const { data, error } = await supabase
      .from("pin_visits")
      .select(`*`)
      .eq("pin_id", Number(pinId));

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    return data.map(
      (visit: { visit_timestamp: string }) => visit.visit_timestamp,
    );
  };

  const loadVisits = async () => {
    const userVisits = await getUserVisits();
    if (userVisits) setVisits(userVisits);
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

  const cleanupUnusedTags = async () => {
    const { error } = await supabase.rpc("update_tags", {
      p_username: "TimTimTim",
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
  };

  const cleanupUnusedLists = async () => {
    const { error } = await supabase.rpc("update_lists", {
      p_username: "TimTimTim",
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
  };

  const getPinInfo = async () => {
    const { data: pinData, error: pinDataError } = await supabase
      .from("pins")
      .select(
        `
        name,
        user_rating,
        user_note,
        address,
        location_id,
        private`,
      )
      .eq("pin_id", pinId);
    if (pinDataError) {
      Alert.alert("Error", pinDataError.message);
      return;
    }
    if (pinData == null) {
      return;
    }
    const { data: locData, error: locDataError } = await supabase
      .from("locations")
      .select(
        `
        latitude,
        longitude
      `,
      )
      .eq("id", pinData[0].location_id);
    if (locDataError) {
      Alert.alert("Error", locDataError.message);
      return;
    }
    if (locData == null) {
      return;
    }

    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", "TimTimTim");

    if (userDataError) {
      Alert.alert("Error", userDataError.message);
      return;
    }
    if (userData == null) {
      return;
    }

    const { data: tagData, error: tagDataError } = await supabase
      .from("pin_tags")
      .select(
        `
        tags (
          name
        )
      `,
      )
      .eq("pin_id", pinId);
    if (tagDataError) {
      Alert.alert("Error", tagDataError.message);
      return;
    }
    if (tagData == null) {
      return;
    }
    let loadedSelectedTags = tagData.map(
      (data) => (data.tags as unknown as { name: any }).name,
    ); // kinda messy but it turns off the warnings lol

    const { data: listData, error: listDataError } = await supabase
      .from("pin_lists")
      .select(
        `
        lists (
          name
        )
      `,
      )
      .eq("pin_id", pinId);
    if (listDataError) {
      Alert.alert("Error", listDataError.message);
      return;
    }
    if (listData == null) {
      return;
    }
    let loadedSelectedLists = listData.map(
      (data) => (data.lists as unknown as { name: any }).name,
    );

    const { data: visitData, error: visitDataError } = await supabase
      .from("pin_visits")
      .select("*")
      .eq("pin_id", Number(pinId));
    if (visitDataError) {
      Alert.alert("Error", visitDataError.message);
      return;
    }
    let loadedVisits = visitData.map(
      (visit: { visit_timestamp: string }) => visit.visit_timestamp,
    );

    const { data: photoData, error: photoError } = await supabase
      .from("pin_photos")
      .select(`
      photos (
      key
      ),
      cover`)
      .eq("pin_id", Number(pinId))
    const coverPhoto = photoData?.find((photo) => photo.cover);
    const otherPhotosTemp = photoData?.filter((photo) => !photo.cover);
    const otherPhotos: PhotoItem[] = [];
    otherPhotosTemp?.forEach((photo) => {
      otherPhotos.push({
        key: photo.photos.key,
        url: "",
        changed: false
      })
    });
    if (coverPhoto) {
      const coverKey = coverPhoto.photos.key;
      setCoverPhotoKey(coverKey);
      await loadPhotos([coverKey], true);
    }
    if (otherPhotos) {
      const otherKeys = otherPhotos.flatMap((photo) => photo.key)
      await loadPhotos(otherKeys, false)
    }
    setName(pinData[0].name);
    originalName = pinData[0].name;
    setAddress(pinData[0].address);
    originalAddress = pinData[0].address
    setRating(pinData[0].user_rating);
    originalRating = pinData[0].user_rating;
    setNotes(pinData[0].user_note);
    originalNotes = pinData[0].user_note
    setIsPrivate(pinData[0].private);
    originalPrivacy = pinData[0].private;
    setLat(locData[0].latitude.toString() ?? "");
    setLng(locData[0].longitude.toString() ?? "");
    setSelectedTags(loadedSelectedTags);
    setSelectedLists(loadedSelectedLists);
    setVisits(loadedVisits);
    setOriginalVisits(loadedVisits);
  };

  const updatePinTags = async () => {
    const { data: tagIds, error: getTagIdsError } = await supabase
      .from("tags")
      .select(`"tag_id"`)
      .in("name", selectedTags);

    if (getTagIdsError) {
      Alert.alert("Error", getTagIdsError.message);
      return;
    }

    if (tagIds === null) {
      return;
    }

    const { data: tagData, error: tagDataError } = await supabase
      .from("pin_tags")
      .select("tag_id")
      .eq("pin_id", pinId);

    if (tagDataError) {
      Alert.alert("Error", tagDataError.message);
      return;
    }

    if (tagData === null) {
      return;
    }

    let locallySelectedTags = tagIds.map((tag) => tag.tag_id);
    let databaseSelectedTags = tagData.map((tag) => tag.tag_id);

    let deletedTags = databaseSelectedTags.filter(
      (tag_id) => !locallySelectedTags.includes(tag_id),
    );
    let addedTags = locallySelectedTags.filter(
      (tag_id) => !databaseSelectedTags.includes(tag_id),
    );
    if (addedTags.length != 0) {
      const addPinTagAssociation = addedTags.map((tag) => ({
        pin_id: pinId,
        tag_id: tag,
      }));
      const { error: addToPinTagsError } = await supabase
        .from("pin_tags")
        .insert(addPinTagAssociation);

      if (addToPinTagsError) {
        Alert.alert("Error", addToPinTagsError.message);
        return;
      }
    }
    if (deletedTags.length != 0) {
      const { error: deleteFromPinTagsError } = await supabase
        .from("pin_tags")
        .delete()
        .eq("pin_id", pinId)
        .in("tag_id", deletedTags);

      if (deleteFromPinTagsError) {
        Alert.alert("Error", deleteFromPinTagsError.message);
        return;
      }
    }

    return;
  };

  const updatePinLists = async () => {
    const { data: listIds, error: getListIdsError } = await supabase
      .from("lists")
      .select(`"list_id"`)
      .in("name", selectedLists);

    if (getListIdsError) {
      Alert.alert("Error", getListIdsError.message);
      return;
    }

    if (listIds === null) {
      return;
    }

    const { data: listData, error: listDataError } = await supabase
      .from("pin_lists")
      .select("list_id")
      .eq("pin_id", pinId);

    if (listDataError) {
      Alert.alert("Error", listDataError.message);
      return;
    }

    if (listData === null) {
      return;
    }

    let locallySelectedLists = listIds.map((list) => list.list_id);
    let databaseSelectedLists = listData.map((list) => list.list_id);

    let deletedLists = databaseSelectedLists.filter(
      (list_id) => !locallySelectedLists.includes(list_id),
    );
    let addedLists = locallySelectedLists.filter(
      (tag_id) => !databaseSelectedLists.includes(tag_id),
    );
    if (addedLists.length != 0) {
      const addPinListAssociation = addedLists.map((list) => ({
        pin_id: pinId,
        list_id: list,
      }));
      const { error: addToPinListsError } = await supabase
        .from("pin_lists")
        .insert(addPinListAssociation);

      if (addToPinListsError) {
        Alert.alert("Error", addToPinListsError.message);
        return;
      }
    }
    if (deletedLists.length != 0) {
      const { error: deleteFromPinTagsError } = await supabase
        .from("pin_lists")
        .delete()
        .eq("pin_id", pinId)
        .in("list_id", deletedLists);

      if (deleteFromPinTagsError) {
        Alert.alert("Error", deleteFromPinTagsError.message);
        return;
      }
    }

    return;
  };

  const saveVisits = async (pinIdToUse: number) => {
    const newVisits = visits.filter((visit) => !originalVisits.includes(visit));

    if (newVisits.length === 0) return;

    const visitRows = newVisits.map((visit) => ({
      pin_id: pinIdToUse,
      visit_timestamp: visit,
    }));

    const { error } = await supabase.from("pin_visits").insert(visitRows);

    if (error) {
      Alert.alert("Error", error.message);
    }
  };

  const updatePin = async () => {
    if (saveUpdateInitiated) {
      return;
    }
    setSaveUpdateInitiated(true)
    var updateObject = {}
    if (name != originalName) {
      updateObject = { ...updateObject, name: name }
      setPinChanged(true);
    }
    if (address != originalAddress) {
      updateObject = { ...updateObject, address: address }
      setPinChanged(true);
    }
    if (rating != originalRating) {
      updateObject = { ...updateObject, rating: rating }
      setPinChanged(true);
    }
    if (notes != originalNotes) {
      updateObject = { ...updateObject, notes: notes }
      setPinChanged(true);
    }
    if (isPrivate != originalPrivacy) {
      updateObject = { ...updateObject, private: isPrivate }
      setPinChanged(true);
    }
    const { error } = await supabase
      .from("pins")
      .update({
        name: name,
        address: address,
        user_rating: rating,
        user_note: notes,
        private: isPrivate,
      })
      .eq("pin_id", pinId);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    await updatePinTags();
    await updatePinLists();
    await saveVisits(Number(pinId));
    if (coverPhotoChanged) {
      await uploadPhoto(coverPhotoUrl, true);
      setPinChanged(true);
    }
    for (const photo of photoList) {
      if (photo.changed) {
        await uploadPhoto(photo.url, false)
        setPinChanged(true);
      }
    }
    if (photosToDelete.length > 0) {
      for (const photo of photosToDelete) {
        deletePhoto(photo.key)
      }
      setPinChanged(true)
    }
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
            const { error } = await supabase.rpc("delete_pin", {
              p_pin_id: pinId,
            });
            if (error) {
              console.log(error.message);
            }
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

  // This will run on launch
  useEffect(() => {
    const loadData = async () => {
      if (isEdit) {
        // These two are loaded only when pins are edited
        await getPinInfo();
        await loadVisits();
      }
      // These two are loaded for both adding and editing
      await cleanupUnusedTags();
      await loadTags();
      await cleanupUnusedLists();
      await loadLists();
      setDataLoaded(true);
    };
    loadData();
  }, []);

  if (!dataLoaded) {
    return <LoadingPage />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={styles.saveBtn}
          onPress={() => (isEdit ? updatePin() : createPin())}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
      {/* This Pressable wrapper allows us to cancel text input by closing keyboard when clicking outside */}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
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
                      <Image source={{ uri: coverPhotoUrl }} style={styles.photo} transition={500} />
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
                    <TextInput
                      style={[
                        styles.input,
                        nameError ? styles.inputError : null,
                      ]}
                      placeholder="Name"
                      placeholderTextColor="#aaaaaa"
                      value={name}
                      onChangeText={handleNameChange}
                      maxLength={NAME_MAX + 1} // allow one extra so they see the error trigger
                      onFocus={(event) =>
                        scrollRef.current?.scrollToFocusedInput(event.target)
                      }
                    />
                    {nameError ? (
                      <Text style={styles.errorText}>{nameError}</Text>
                    ) : null}

                    <TextInput
                      style={[
                        styles.input,
                        addressError ? styles.inputError : null,
                      ]}
                      placeholder="Address"
                      placeholderTextColor="#aaaaaa"
                      value={address}
                      onChangeText={handleAddressChange}
                      maxLength={ADDRESS_MAX + 1}
                      onFocus={(event) =>
                        scrollRef.current?.scrollToFocusedInput(event.target)
                      }
                    />
                    {addressError ? (
                      <Text style={styles.errorText}>{addressError}</Text>
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
                {tags.length == 0 && (
                <Text style={styles.emptyTagLabel}>You have not created any tags</Text>
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
                    <Text style={styles.tagLabel}>{tag}</Text>
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
                <Text style={styles.emptyTagLabel}>You have not created any lists</Text>
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
                    <Text style={styles.tagLabel}>{list}</Text>
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
                  <Text style={styles.emptyTagLabel}>You have no visits entered</Text>
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
                  <Text style={styles.emptyTagLabel}>You have no photos yet</Text>
                )}
                <FlatList
                  horizontal
                  data={photoList}
                  keyExtractor={(photo) => photo.key || photo.url}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => setPhotoToDelete(item)}>
                      <Image source={{ uri: item.url }} style={styles.photoCarousel} transition={500} />
                    </Pressable>
                  )}
                  ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                />
              </View>
              <AddPhotoModal isVisible={addPhotoModalVisible} onClose={() => setAddPhotoModalVisible(false)} onChooseFromLibrary={() => handleChooseFromLibrary(false)} />
              <DeletePhotoModal isVisible={!!photoToDelete} onClose={() => setPhotoToDelete(null)} onDelete={() => { if (photoToDelete) handleDeletePhoto(photoToDelete.key, photoToDelete.url, false); setPhotoToDelete(null) }} />

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
    top: 50,
    right: 16,
    left: 16,
    zIndex: 10,
  },
  cancelBtn: {
    padding: 16,
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
    padding: 16,
    backgroundColor: "#243e36",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
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
    padding: 16,
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
    borderColor: Colors.light.error, // optional: highlight the border too
  },
  photoCarousel: {
    width: 90,
    height: 90,
    borderRadius: 12
  },
  emptyTagLabel: {
    fontFamily: Fonts.regular,
    paddingVertical: 10,
  }
});
