import ListCard from "@/app/(tabs)/(home)/list_card";
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

export default function AddPinToList({ isVisible, onClose, onSave, listId, pinsInList, setPinsToAdd }: Props) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [pins, setPins] = useState<PinWithPhoto[]>();
  const { profile } = useAuth();

  const addButtonBehavior = async () => {
    onSave();
    const pinIdsToAdd = Object.entries(checkedItems).filter(([_, selected]) => selected).map(([item, _]) => Number(item))

    const pinsToAdd = (pins ?? []).filter((item) => pinIdsToAdd.includes(item.pinId)).map((item) => ({id: item.pinId, name: item.name, address: item.address, latitude: item.latitude, longitude: item.longitude}))
    setPinsToAdd(pinsToAdd)
    // const pinListAssociation = pinsToAdd.map((item) => ({pin_id: item, list_id: listId}))
    // const { error } = await supabase
    //   .from("pin_lists")
    //   .insert(pinListAssociation)
    // if (error) {
    //   Alert.alert("Error", error.message)
    // }
  }

  const getUserPins = async () => {
    const {data, error} = await supabase
    .from("pins")
    .select(`
      pin_id,
      name,
      address,
      pin_photos(
        photos(
          key),
        cover
      ),
      pin_lists(
        list_id
        ),
      locations(
        latitude,
        longitude
        )
      `)
    .eq("user_id", profile!.user_id)
    .eq("pin_photos.cover", true)
    
    if (error) {
      Alert.alert("Error", error.message);
    }
    let pinsToAdd = data?.map((item) => ({pinId: item.pin_id, name: item.name, address: item.name, photoKey: item.pin_photos?.[0]?.photos?.key ?? null, latitude: item.locations.latitude, longitude: item.locations.longitude}))
    let pinIdsInList = pinsInList.map((item) => item.id)
    pinsToAdd = pinsToAdd?.filter((item) => !pinIdsInList.includes(item.pinId))
    setPins(pinsToAdd)
  }

  useEffect(() => {
  if (isVisible) {
    setCheckedItems({});
    getUserPins();
  }
}, [isVisible]);
  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <Pressable onPress={Keyboard.dismiss} style={styles.dismissArea}>
            <View style={styles.modalContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Add pins to the list</Text>
              </View>
              <View style={styles.inputContainer}>
                <FlatList
                        data={pins}
                        keyExtractor={(item) => item.pinId}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                          <View style={styles.listCheckBoxRow}>
                            <Checkbox 
                            color={Colors.light.background}
                            style={styles.checkBox} 
                            value={checkedItems[item.pinId]} 
                            onValueChange={(value) => {
                              setCheckedItems(prev => ({
                                ...prev,
                                [item.pinId]: value
                              }));
                            }}/>
                            <Pressable
                              style={styles.cards}
                            >
                              <ListCard name={item.name} pinId={item.pinId} loc={item.address} editList={true}/>
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
