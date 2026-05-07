import AddPinToList from "@/components/add-pins-to-list";
import CoverPhotoModal from "@/components/cover-photo-modal";
import EditListFriends from "@/components/edit-list-friends";
import LoadingPage from "@/components/loading-page";
import { Colors, Fonts } from "@/constants/theme";
import { getPhotoUrl } from "@/lib/photo-utils";
import { setPinChanged } from "@/lib/pin_refresh_data";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ListCard from "../(home)/list_card";

type PhotoItem = {
  key: string,
  url: string,
  changed: boolean,
};

export default function EditList() {
  const { listIdToView } = useLocalSearchParams();
  const [pins, setPins] = useState<Pin[]>([]);
  const [dbPins, setDbPins] = useState<Pin[]>([]);
  const [dbListName, setDbListName] = useState("");
  const [listName, setListName] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [addPinToListVisible, setAddPinToListVisible] = useState(false);
  const [coverPhotoModalVisible, setCoverPhotoModalVisible] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [coverPhotoChanged, setCoverPhotoChanged] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoItem | null>(null)
  const publicDescription = "All of your friends can view this list";
  const selectivePrivateDescription = "Only friends you choose can view this list"
  const privateDescription = "Only you can view this list";
  const [privacyDescription, setPrivacyDescription] = useState(selectivePrivateDescription);
  const [pinsToAdd, setPinsToAdd] = useState<Pin[]>([]);
  const [pinsToRemove, setPinsToRemove] = useState<number[]>([]);
  const [privacy, setPrivacy] = useState<number>(1); // 0: fully private, 1: selectively private, 2: all friends
  const [dbPrivacy, setDbPrivacy] = useState<number | null>(null)
  const [coverPhotoKey, setCoverPhotoKey] = useState("")
  const [editFriendsModalVisible, setEditFriendsModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  const changePrivacy = (value: number) => {
    if (value < 0 || value > 2) {
      return;
    }
    if (value == 0) {
      setPrivacy(0);
      setPrivacyDescription(privateDescription);
    }
    else if (value == 1) {
      setPrivacy(1);
      setPrivacyDescription(selectivePrivateDescription);
    }
    else {
      setPrivacy(2);
      setPrivacyDescription(publicDescription);
    }
  }

  const getListInfo = async (listId: any) => {
    const { data, error } = await supabase
      .from("lists")
      .select(`
        name,
        privacy,
        photos (
          key
        )`)
      .eq("list_id", listId)
    setListName(data?.[0].name);
    setDbListName(data?.[0].name);
    setDbPrivacy(data?.[0].privacy);
    setPrivacy(data?.[0].privacy);
    const key = data?.[0].photos?.key ?? ""
    setCoverPhotoKey(key)
    if (key != "") {
      await loadPhotos([key])
    }
  }
  const getListPins = async (listId: any) => {
    const { data, error } = await supabase
      .from("pin_lists")
      .select(`
            pins (
              pin_id,
              name,
              address,
              user_id,
              locations (
                latitude,
                longitude
              )
            )
          `)
      .eq("list_id", Number(listId))
    const pinsInList: Pin[] = data?.map(pin => ({ id: pin.pins.pin_id, name: pin.pins.name, address: pin.pins.address, latitude: pin.pins.locations.latitude, longitude: pin.pins.locations.longitude, user_id: pin.pins.user_id}))
    setPins(pinsInList)
    setDbPins(pinsInList)
  }

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
    if (!result) return;
    const uri = result!.assets[0].uri;
    const processedImage = await processImage(uri);
    setCoverPhotoUrl(processedImage.uri);
    setCoverPhotoChanged(true);
  };

  const handleDeletePhoto = async (key: string, url: string) => {
    if (key == "") {
      //remove from the list
      setCoverPhotoUrl("")
    } else {
      //remove from db
      setCoverPhotoUrl("")
      setPhotoToDelete({ key: key, url: url, changed: true })
    }


    setCoverPhotoUrl("")
    setCoverPhotoModalVisible(false)
  }

  const removeSelectedPins = async () => {
    const pinIdsToRemove = Object.entries(checkedItems).filter(([_, selected]) => selected).map(([item, _]) => Number(item))
    setPinsToRemove(pinIdsToRemove)
  }

  const updateAddedToPinList = async () => {
    if (pinsToAdd.length > 0) {
      setPins((prev) => [...prev, ...pinsToAdd])
    }
    const pinIdsToAdd = pinsToAdd.map((item) => Number(item.id))
    setPinsToRemove((prev) => prev.filter((item) => !pinIdsToAdd.includes(item)))
  }

  const updateRemovedFromPinList = async () => {
    if (pinsToRemove.length > 0) {
      setPins(pins.filter((item) => !pinsToRemove.includes(Number(item.id))))
    }
  }

  const uploadPhoto = async (photoUrl: string) => {
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

    const { error: listPhotoError } = await supabase
      .from("lists")
      .update({
        "cover_photo": data?.photo_id
      })
      .eq("list_id", listIdToView);

    if (listPhotoError) {
      Alert.alert("Error", listPhotoError.message);
    }
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

  const loadPhotos = async (keys: string[]) => {
    let signedUrls = await getPhotoUrl(keys);
    let signedCoverPhotoUrl = signedUrls[0].url;
    let coverPhotoKey = keys[0];
    setCoverPhotoUrl(signedCoverPhotoUrl);
    setCoverPhotoKey(coverPhotoKey);
  };

  const saveChanges = async () => {
    if (photoToDelete != null) {
      // handle deleting a photo from db
      deletePhoto(coverPhotoKey)
    }
    if (coverPhotoChanged) {
      // handle adding a photo to db
      if (coverPhotoKey != "") {
        deletePhoto(coverPhotoKey)
      }
      uploadPhoto(coverPhotoUrl)
    }
    const pinIdsToAdd = pinsToAdd.map((item) => Number(item.id))
    const dbPinIds = dbPins.map((item) => Number(item.id))
    const pinIdsToRemove = pinsToRemove;
    const pinsToAddToDb = pins.filter((item) => !dbPinIds.includes(Number(item.id)) && !pinIdsToRemove.includes(Number(item.id)))
    const pinListAssociationToAdd = pinsToAddToDb.map((item) => ({ pin_id: Number(item.id), list_id: listIdToView }))
    const pinsToDeleteFromDb = pinIdsToRemove.filter((item) => dbPinIds.includes(Number(item)));
    if (pinsToAddToDb.length > 0) {
      const { error: addPinListError } = await supabase
        .from("pin_lists")
        .insert(pinListAssociationToAdd)
      if (addPinListError) {
        Alert.alert("Error", addPinListError.message)
      }
    }
    if (pinsToDeleteFromDb.length > 0) {
      const { error: deletePinListError } = await supabase
        .from("pin_lists")
        .delete()
        .in("pin_id", pinsToDeleteFromDb)
        .eq("list_id", listIdToView)
      if (deletePinListError) {
        Alert.alert("Error", deletePinListError.message)
      }
    }
    if (dbListName != listName) {
      const { error: updateListNameError } = await supabase
        .from("lists")
        .update({ "name": listName })
        .eq("list_id", listIdToView);
      if (updateListNameError) {
        Alert.alert("Error", updateListNameError.message)
      }
    }
    if (dbPrivacy != privacy) {
      const { error: updatePrivacyError } = await supabase
        .from("lists")
        .update({ "privacy": privacy })
        .eq("list_id", listIdToView);
      if (updatePrivacyError) {
        Alert.alert("Error", updatePrivacyError.message);
      }
    }
    router.back()
  }

  const deleteList = async () => {
      Alert.alert(
        "Are you sure you want to delete this list?",
        "This action cannot be undone",
        [
          { text: "Cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              const { error } = await supabase
              .from("lists")
              .delete()
              .eq("list_id", listIdToView);
              if (error) {
                console.log(error.message);
              }
              router.dismissAll();
              router.replace("/lists")
            },
          },
        ],
      );
    };


  useFocusEffect(
    useCallback(() => {
      setPinChanged(true);
    }, [])
  )

  useEffect(() => {
    const loadInfo = async () => {
      await getListPins(listIdToView);
      await getListInfo(listIdToView);
      setLoading(false)
    }
    loadInfo();
  }, []);

  useEffect(() => {
    updateAddedToPinList();
  }, [pinsToAdd]);

  useEffect(() => {
    updateRemovedFromPinList();
  }, [pinsToRemove]);

  if (loading) return <LoadingPage />;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => { router.back() }}>
          <Text
            style={styles.buttonText}
          >
            Cancel
          </Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={saveChanges}>

          <Text
            style={styles.buttonText}>
            Save
          </Text>
        </Pressable>
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
          onDelete={() => handleDeletePhoto(coverPhotoKey, coverPhotoUrl)}
        />
        <View style={styles.fields}>
          <View style={styles.fields}>
            <TextInput
              style={
                styles.input
              }
              placeholder="Name"
              placeholderTextColor="#aaaaaa"
              value={listName}
              onChangeText={setListName}
            />
          </View>
        </View>
      </View>
      {/* <Text ellipsizeMode="tail" style={styles.title}>{listName}</Text> */}
      <View>
        <Text style={styles.title}>Privacy</Text>
        <View style={styles.privacyBackground}>
          <View style={styles.row}>
            <View style={styles.pill}>
              <Pressable
                onPress={() => changePrivacy(0)}
                style={[
                  styles.button,
                  {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    backgroundColor: privacy == 0 ? Colors.light.accent : Colors.light.background
                  }]}>
                <Ionicons name="lock-closed" size={24} color="#d9d9d9" />
              </Pressable>
              <Pressable
                onPress={() => changePrivacy(1)}
                style={[
                  styles.button,
                  {
                    borderRadius: 0,
                    backgroundColor: privacy == 1 ? Colors.light.accent : Colors.light.background
                  },]}>
                <Ionicons name="person-add" size={24} color="#d9d9d9" />
              </Pressable>
              <Pressable
                onPress={() => changePrivacy(2)}
                style={[
                  styles.button,
                  {
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    backgroundColor: privacy == 2 ? Colors.light.accent : Colors.light.background
                  },]}>
                <Ionicons name="people" size={24} color="#d9d9d9" />
              </Pressable>
            </View>
            {privacy == 1 && (
              <View>
                <Pressable
                  style={styles.button}
                  onPress={() => setEditFriendsModalVisible(true)}>
                  <Text
                    style={styles.buttonText}>Edit Friends</Text>
                </Pressable>
                <EditListFriends
                  isVisible={editFriendsModalVisible}
                  onClose={() => setEditFriendsModalVisible(false)}
                  onSave={() => setEditFriendsModalVisible(false)}
                  listId={listIdToView.toString()} />
              </View>
            )}
          </View>
          <View>
            <View>
              <Text style={styles.privacyDescription}>
                {privacyDescription}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.spacer} />
      <FlatList
        data={pins}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={(
          <Text style={styles.text}>You have not added any pins to this list</Text>
        )}
        ListFooterComponent={
          <View style={{ alignSelf: "center" }}>
            <Pressable style={styles.deleteBtn} onPress={deleteList} >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={24}
                color="#d9d9d9"
              />
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.listCheckBoxRow}>
            <Checkbox
              color={Colors.light.background}
              style={styles.checkBox}
              value={checkedItems[item.id]}
              onValueChange={(value) => {
                setCheckedItems(prev => ({
                  ...prev,
                  [item.id]: value
                }));
              }} />
            <Pressable
              style={styles.cards}
            >
              <ListCard name={item.name} pinId={item.id} loc={item.address} editList={true} userIds={[Number(item.user_id)]} />
            </Pressable>
          </View>
        )}
      />
      <Pressable
        style={styles.plusButton}
        onPress={() => setAddPinToListVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={45} color="#d9d9d9" />
      </Pressable>
      <AddPinToList
        isVisible={addPinToListVisible}
        onClose={() => setAddPinToListVisible(false)}
        onSave={() => setAddPinToListVisible(false)}
        listId={listIdToView.toString()}
        pinsInList={pins}
        setPinsToAdd={setPinsToAdd}
      />
      <Pressable
        style={styles.deleteButton}
        onPress={removeSelectedPins}
      >
        <Text
          style={styles.buttonText}>
          Remove Selected Pins from List
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cards: {
    flex: 1,
  },
  spacer: {
    marginTop: 0,
  },
  listContent: {
    paddingBottom: 265,
  },
  title: {
    marginHorizontal: 15,
    fontFamily: Fonts.regular,
    fontSize: 20,
    textAlign: "left"
  },
  button: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    //padding: 16,
    height: 40,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: Colors.light.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    // padding: 16,
    height: 40,
    paddingHorizontal: 16,
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    position: "relative",
    paddingTop: 45,
    paddingRight: 16,
    paddingLeft: 16,
    zIndex: 10,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: "#d9d9d9",
    fontSize: 16
  },
  plusButton: {
    position: "absolute",
    bottom: 115,
    right: 25,
    zIndex: 20,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    backgroundColor: "#243e36",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  listCheckBoxRow: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  checkBox: {
    alignSelf: "center",
    margin: 20,
  },
  deleteButton: {
    position: "absolute",
    bottom: 120,
    left: 15,
    zIndex: 20,
    height: 40,
    //padding: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    backgroundColor: Colors.light.error,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 15,
  },
  shadowWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
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
    justifyContent: "center"
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
  privacyBackground: {
    flexDirection: "column",
    gap: 8,
    margin: 15,
    backgroundColor: Colors.light.accentLight,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  privacyDescription: {
    flexShrink: 1,
    fontFamily: Fonts.regular,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  pill: {
    flexDirection: "row",
  },
  text: {
    margin: 15,
    fontFamily: Fonts.regular,
    fontSize: 16,
    textAlign: "center",
  },
  deleteBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
    //padding: 16,
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
});