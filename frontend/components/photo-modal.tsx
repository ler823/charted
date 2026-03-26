import { Colors } from "@/constants/theme";
import React, { PropsWithChildren } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, Text, View } from 'react-native';


type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  onChooseFromLibrary: () => void;
  onDelete: () => void;
}>;

export default function PhotoModal({ isVisible, onClose, onChooseFromLibrary, onDelete }: Props) {
  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <Pressable onPress={Keyboard.dismiss} style={styles.dismissArea}>
            <View style={styles.modalContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Add a new photo</Text>
              </View>
              
              <View style={styles.bottomButtons}>
                <Pressable onPress={onDelete} style={styles.cancelBtn}>
                  <Text style={styles.saveText}>Delete Photo</Text>
                </Pressable>
                <Pressable onPress={onChooseFromLibrary} style={styles.saveBtn}>
                  <Text style={styles.saveText}>Choose from Library</Text>
                </Pressable>
                <Pressable onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
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
    height: '20%',
    width: '90%',
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  dismissArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap"
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center"
  },
  cancelBtn: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 8,
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
    marginVertical: 8,
    marginHorizontal: 8,
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
});
