import { Colors, Fonts } from "@/constants/theme";
import React, { PropsWithChildren, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from "react-native-calendars";


type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  onSave: (visitDate: string) => void;
  newVisit: string;
  setNewVisit: (value: string) => void;
}>;

export default function AddVisit({ isVisible, onClose, onSave, newVisit, setNewVisit }: Props) {
    const [date, setDate] = useState(new Date());

    const formattedDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;

    return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Add a new visit</Text>
              </View>
              <TextInput
                    value={date.toDateString()}
                    editable={false}
                    pointerEvents="none"
                    style={styles.input}
              />
              <Calendar
                current={formattedDate}
                onDayPress={(day) => {
                    const [year, month, dayNum] = day.dateString.split("-").map(Number);
                    setDate(new Date(year, month - 1, dayNum));
                }}
                markedDates={{[formattedDate]: { selected: true, selectedColor: Colors.light.background }}}
                theme={{
                    calendarBackground: Colors.light.accentLight,
                    textSectionTitleColor: Colors.light.background,
                    selectedDayBackgroundColor: Colors.light.background,
                    selectedDayTextColor: '#fff',
                    todayTextColor: '#FF6347',
                    dayTextColor: Colors.light.background,
                    monthTextColor: Colors.light.background,
                    arrowColor: Colors.light.background,
                    textDisabledColor: "rgba(36, 62, 54, 0.4)",
                    textDayFontFamily: Fonts.regular,
                    textMonthFontFamily: Fonts.regular,
                    textDayHeaderFontFamily: Fonts.regular,
                }}
                style={styles.calendar}
              />
              <View style={styles.bottomButtons}>
                <Pressable onPress={onClose} 
                  style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={() => {
                      if (!date) {
                        Alert.alert("Missing field", "Please pick a date");
                        return;
                      }
                      setNewVisit(formattedDate);
                      onSave(formattedDate);
                    }} 
                    style={styles.saveBtn}>
                  <Text style={styles.saveText}>Save</Text>
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
    width: 300,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  titleContainer: {
    paddingVertical: 16,
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
  calendar: {
    borderRadius: 12,
    marginVertical: 15,
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
});
