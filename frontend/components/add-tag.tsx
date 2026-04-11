import { Colors, Fonts } from "@/constants/theme";
import React, { PropsWithChildren, useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';


type Props = PropsWithChildren<{
  name: string;
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  newEntry: string;
  setNewEntry: (value: string) => void;
}>;

export default function AddTagOrList({ name, isVisible, onClose, onSave, newEntry, setNewEntry }: Props) {
  const publicDescription = "All of your friends can view this pin";
    const privateDescription = "Only you can view this pin";
    const [privacyDescription, setPrivacyDescription] = useState(publicDescription);
  const [isPrivate, setIsPrivate] = useState(false)

  const togglePrivacy = () => {
    setIsPrivate((previousState) => !previousState);
    if (isPrivate) {
      setPrivacyDescription(publicDescription);
    } else {
      setPrivacyDescription(privateDescription);
    }
  };
  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <Pressable onPress={Keyboard.dismiss} style={styles.dismissArea}>
            <View style={styles.modalContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{"Add a new " + name.toLowerCase()}</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder={"New " + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() + " Name"}
                  placeholderTextColor="#aaaaaa"
                  value={newEntry}
                  onChangeText={setNewEntry}
                  style={styles.input} />
              </View>
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
  modalContent: {
    height: '30%',
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
    fontFamily: Fonts.bold
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
});
