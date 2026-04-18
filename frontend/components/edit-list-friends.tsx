import FriendListCard from "@/app/(tabs)/(home)/friend_list_card";
import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Pin } from "@/types/types";
import Checkbox from "expo-checkbox";
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, Modal, Pressable, StyleSheet, Text, View } from 'react-native';


type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  listId: string;
  pinsInList: Pin[];
  setPinsToAdd: (value: Pin[]) => void;
}>;

type PinWithPhoto = PropsWithChildren<{
  pinId: string
  name: string,
  address: string,
  photoKey: string | null
  latitude: number,
  longitude: number
}>;

type UserData = {
  userId: number,
  name: string,
  location: string,
  photoKey: string,
}

export default function EditListFriends({ isVisible, onClose, onSave, listId, pinsInList, setPinsToAdd }: Props) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [pins, setPins] = useState<PinWithPhoto[]>();
  const [friends, setFriends] = useState<UserData[]>();
  const [dbSharedUsers, setDbSharedUsers] = useState<number[]>();
  const { profile } = useAuth();

  const addButtonBehavior = async () => {
    onSave();
    const userIdsToAdd = Object.entries(checkedItems).filter(([_, selected]) => selected).map(([item, _]) => Number(item))
    const userId = 4
    const userListAssociationToAdd = userIdsToAdd.map((item) => ({ list_id: listId, creator_id: userId, viewer_id: item }))
    const userIdsToDelete = Object.entries(checkedItems).filter(([userId, selected]) => !selected && dbSharedUsers?.includes(Number(userId))).map(([item, _]) => Number(item))

    const { error: addError } = await supabase
      .from("list_members")
      .insert(userListAssociationToAdd)
    if (addError) {
      Alert.alert("Error", addError.message)
    }
    const { error: deleteError } = await supabase
      .from("list_members")
      .delete()
      .in("viewer_id", userIdsToDelete)
      .eq("list_id", listId)
    if (deleteError) {
      Alert.alert("Error", deleteError.message)
    }
  }

  const getUserFriends = async () => {
    console.log(profile!.user_id);
    const { data, error } = await supabase
      .from("user_relationships1")
      .select(`
      requester:profiles!user_relationships_requester_id_fkey (
      user_id
      ),
      target:profiles!user_relationships_target_id_fkey (
      user_id)
      `)
      .or(`requester_id.eq.${profile!.id},target_id.eq.${profile!.id}`)
      .eq("status", "accepted");
    console.log(data)
    if (error) {
      Alert.alert("Error", error.message);
    }

    const { data: sharedListData, error: sharedListError } = await supabase
      .from("list_members")
      .select(`
        viewer_id
        `)
      .eq("list_id", listId)
    const sharedUsers = sharedListData?.map((item) => item.viewer_id) ?? [];
    setDbSharedUsers(sharedUsers);

    setCheckedItems(prev => {
      const updated = { ...prev };
      sharedUsers.forEach((id) => {
        updated[id] = true;
      });
      return updated;
    });
    const friendIdList = data?.map(({ requester, target }) => requester.user_id == profile!.user_id ? Number(target.user_id) : Number(requester.user_id)) ?? []
    console.log(friendIdList)
    const { data: friendData, error: friendDataError } = await supabase
      .from("users")
      .select(`
        user_id,
        username,
        location,
        profiles (
            avatar_key
        )
        `)
      .in("user_id", friendIdList)
    console.log(friendData)
    if (friendDataError) {
      Alert.alert("Error", friendDataError.message)
    }
    setFriends(friendData?.map((item) => ({ userId: item.user_id, name: item.username, location: item.location, photoKey: item.profiles?.avatar_key ?? "" })))

  }

  useEffect(() => {
    if (isVisible) {
      setCheckedItems({});
      getUserFriends();
    }
  }, [isVisible]);
  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <Pressable onPress={Keyboard.dismiss} style={styles.dismissArea}>
            <View style={styles.modalContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Select Friends to Share This List With</Text>
              </View>
              <View style={styles.inputContainer}>
                <FlatList
                  data={friends}
                  keyExtractor={(item) => item?.userId?.toString()}
                  contentContainerStyle={styles.listContent}
                  renderItem={({ item }) => (
                    <View style={styles.listCheckBoxRow}>
                      <Checkbox
                        color={Colors.light.background}
                        style={styles.checkBox}
                        value={checkedItems[item.userId]}
                        onValueChange={(value) => {
                          setCheckedItems(prev => ({
                            ...prev,
                            [item.userId]: value
                          }));
                        }} />
                      <Pressable
                        style={styles.cards}
                      >
                        <FriendListCard name={item.name} userId={item.userId.toString()} loc={item.location} editList={true} />
                      </Pressable>
                    </View>
                  )}
                />
              </View>
              <View style={styles.bottomButtons}>
                <Pressable onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={addButtonBehavior} style={styles.saveBtn}>
                  <Text style={styles.saveText}>Add</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    //height: "85%",
    flex: 0.75,
    width: "95%",
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  titleContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#000000',
    fontSize: 16,
    fontFamily: Fonts.regular
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
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
  dismissArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: "5%"
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center"
  },
  cancelBtn: {
    // padding: 16,
    height: 40,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    fontFamily: Fonts.bold
  },
  saveBtn: {
    // padding: 16,
    height: 40,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    fontFamily: Fonts.bold
  },
  listContent: {
    paddingBottom: 0,
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
  cards: {
    flex: 1,
  },
});
