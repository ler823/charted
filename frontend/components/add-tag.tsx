import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { PropsWithChildren, useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

type listType = {
  name: string;
  privacy: number;
}

type Props = PropsWithChildren<{
  name: string;
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  newEntry: listType;
  setNewEntry: (value: listType) => void;
}>;

export default function AddTagOrList({ name, isVisible, onClose, onSave, newEntry, setNewEntry }: Props) {
  const publicDescription = "All of your friends can view this pin";
  const selectivePrivateDescription = "Only friends you choose can view this list\nYou can choose these friends from the edit list page"
  const privateDescription = "Only you can view this pin";
  const [privacyDescription, setPrivacyDescription] = useState(name == "tag" ? publicDescription : selectivePrivateDescription);
  const [isPrivate, setIsPrivate] = useState(false)
  const [privacy, setPrivacy] = useState(1)

  const togglePrivacy = () => {
    setIsPrivate((previousState) => !previousState);
    setNewEntry({name: newEntry.name, privacy: Number(isPrivate)})
    if (isPrivate) {
      setPrivacyDescription(publicDescription);
    } else {
      setPrivacyDescription(privateDescription);
    }
  };

  const changePrivacy = (value: number) => {
    if (value < 0 || value > 2) {
      return;
    }
    if (value == 0) {
      setPrivacy(0);
      setPrivacyDescription(privateDescription);
      setNewEntry({name: newEntry.name, privacy: 0})
    }
    else if (value == 1) {
      setPrivacy(1);
      setPrivacyDescription(selectivePrivateDescription);
      setNewEntry({name: newEntry.name, privacy: 1});
    }
    else {
      setPrivacy(2);
      setPrivacyDescription(publicDescription);
      setNewEntry({name: newEntry.name, privacy: 2});
    }
  }
  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <Pressable onPress={Keyboard.dismiss} style={styles.dismissArea}>
            <View style={name == "list" ? styles.listModalContent : styles.tagModalContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{"Add a new " + name.toLowerCase()}</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder={"New " + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() + " Name"}
                  placeholderTextColor="#aaaaaa"
                  value={newEntry.name}
                  onChangeText={(text) => setNewEntry({name: text, privacy: privacy})}
                  style={styles.input} />
              </View>
              {name == "tag" && (
                <View>
                  <Text style={styles.title}>Private</Text>
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
              )}
              {name == "list" && (
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
                              backgroundColor: newEntry.privacy == 0 ? Colors.light.accent : Colors.light.background
                            }]}>
                          <Ionicons name="lock-closed" size={24} color="#d9d9d9" />
                        </Pressable>
                        <Pressable
                          onPress={() => changePrivacy(1)}
                          style={[
                            styles.button,
                            {
                              borderRadius: 0,
                              backgroundColor: newEntry.privacy == 1 ? Colors.light.accent : Colors.light.background
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
                              backgroundColor: newEntry.privacy == 2 ? Colors.light.accent : Colors.light.background
                            },]}>
                          <Ionicons name="people" size={24} color="#d9d9d9" />
                        </Pressable>
                      </View>
                      {/* {privacy == 1 && (
                        <Pressable
                          style={styles.button}>
                          <Text
                            style={styles.buttonText}>Edit Friends</Text>
                        </Pressable>
                      )} */}
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
              )}
              <View style={styles.bottomButtons}>
                <Pressable onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={onSave} style={styles.saveBtn}>
                  <Text style={styles.saveText}>Save</Text>
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
  tagModalContent: {
    //height: '30%',
    width: '75%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  listModalContent: {
    width: '95%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  titleContainer: {
    height: '16%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 20,
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
  privacyDescription: {
    flexShrink: 1,
    fontFamily: Fonts.regular,
    marginLeft: 8,
  },
  privacyBackground: {
    flexDirection: "column",
    gap: 8,
    marginTop: 15,
    backgroundColor: Colors.light.accentLight,
    alignItems: "flex-start",
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 15,
  },
  pill: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#243e36",
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
  buttonText: {
    fontFamily: Fonts.bold,
    color: "#d9d9d9",
    fontSize: 16
  },
});
