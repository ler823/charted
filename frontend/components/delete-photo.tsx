import { Colors, Fonts } from "@/constants/theme";
import React, { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';


type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  onDelete: () => void;
}>;

export default function DeletePhotoModal({ isVisible, onClose, onDelete }: Props) {
  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Delete photo</Text>
              </View>
              
              <View style={styles.bottomButtons}>
                <Pressable onPress={onDelete} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Delete</Text>
                </Pressable>
                <Pressable onPress={onClose} style={styles.saveBtn}>
                  <Text style={styles.saveText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: 150,
    width: 400,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  titleContainer: {
    height: 50,
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
    fontFamily: Fonts.regular,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap"
  },
  cancelBtn: {
    padding: 16,
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
    fontFamily: Fonts.bold,
  },
  saveBtn: {
    padding: 16,
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
    fontFamily: Fonts.bold
  },
});
