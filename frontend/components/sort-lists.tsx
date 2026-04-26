import { Colors, Fonts } from "@/constants/theme";
import Checkbox from "expo-checkbox";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";


type Props = {
  contentType: string,
  isVisible: boolean,
  onClose: () => void,
  sortChoice: string,
  setSortChoice: (value: string) => void,
  ascending: boolean,
  setAscending: (value: boolean) => void,
}

export default function Sort({ contentType, isVisible, onClose, sortChoice, setSortChoice, ascending, setAscending }: Props) {

  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {contentType == "list" && (
              <Text
                style={styles.text}>Sort Lists</Text>
            )}
            {contentType == "pin" && (
              <Text
                style={styles.text}>Sort Pins in List</Text>
            )}
            {contentType == "friend" && (
              <Text
                style={styles.text}>Sort Friends</Text>
            )}
            <Pressable
              onPress={() => setSortChoice("date")}
              style={styles.buttonRow}>
              <Checkbox
                value={sortChoice === "date"}
                onValueChange={() => setSortChoice("date")}
                style={styles.checkBox}>
              </Checkbox>
              {contentType == "friend" ? (
                <Text>By Date Friended (Default)</Text>
              ) :
              (
                <Text>By Date Created (Default)</Text>
              )
              }
            </Pressable>
            <Pressable
              onPress={() => setSortChoice("name")}
              style={styles.buttonRow}>
              <Checkbox
                value={sortChoice === "name"}
                onValueChange={() => setSortChoice("name")}
                style={styles.checkBox}>
              </Checkbox>
              <Text>By Name</Text>
            </Pressable>
            {contentType === "friend" && (
              <Pressable
                onPress={() => setSortChoice("location")}
                style={styles.buttonRow}
              >
                <Checkbox
                  value={sortChoice === "location"}
                  onValueChange={() => setSortChoice("location")}
                  style={styles.checkBox}
                />
                <Text>By Location</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => setAscending(true)}
              style={styles.buttonRow}>
              <Checkbox
                value={ascending === true}
                onValueChange={() => setAscending(true)}
                style={styles.checkBox}>
              </Checkbox>
              <Text>Ascending (Default)</Text>
            </Pressable>
            <Pressable
              onPress={() => setAscending(false)}
              style={styles.buttonRow}>
              <Checkbox
                value={ascending === false}
                onValueChange={() => setAscending(false)}
                style={styles.checkBox}>
              </Checkbox>
              <Text>Descending</Text>
            </Pressable>
            <View style={styles.bottomButtons}>
              <Pressable
                onPress={onClose}
                style={styles.cancelButton}>
                <Text
                  style={styles.buttonText}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={onClose}
                style={styles.button}>
                <Text
                  style={styles.buttonText}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
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
  buttonRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  checkBox: {
    margin: 10,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 20
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
  text: {
    margin: 15,
    fontFamily: Fonts.regular,
    fontSize: 16,
    textAlign: "center",
  },
})