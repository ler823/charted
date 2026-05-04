import { Colors, Fonts } from "@/constants/theme";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";


type Props = {
  isVisible: boolean,
  onClose: () => void,
  setActualHour: ((value: number) => void),
  setActualMinute: ((value: number) => void),
  setActualSuffix: ((value: string) => void)
}

export default function TimePicker({ isVisible, onClose, setActualHour, setActualMinute, setActualSuffix }: Props) {
  const [time, setTime] = useState(new Date(Date.now()));
  const [hour, setHour] = useState((time.getHours() % 12).toString());
  const [minute, setMinute] = useState(time.getMinutes().toString());
  const [suffix, setSuffix] = useState(Number(time.getHours()) - 12 >= 0 ? "PM" : "AM");
  const [saveDisabledHour, setSaveDisabledHour] = useState(false);
  const [saveDisabledMinute, setSaveDisabledMinute] = useState(false);
  const saveDisabled = saveDisabledHour || saveDisabledMinute;
  const onSave = async () => {
    setActualHour(Number(hour));
    setActualMinute(Number(minute));
    setActualSuffix(suffix);
    onClose();
  }
  const validateMinute = async (minute: number) => {
    setMinute(minute.toString())
    if (minute < 0 || minute >= 60) {
      setSaveDisabledMinute(true);
      return false;
    }
    setSaveDisabledMinute(false);
    return true;
  }

  const validateHour = async (hour: number) => {
    setHour(hour.toString())
    if (hour < 1 || hour > 12) {
      setSaveDisabledHour(true)
      return false;
    }
    setSaveDisabledHour(false);
    return true;
  }

  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.titleText}>Enter a time</Text>
            <View style={styles.timeInputRow}>
              <TextInput
                placeholder="12"
                value={hour}
                maxLength={2}
                keyboardType="number-pad"
                textAlign="center"
                selectTextOnFocus={true}
                onChangeText={(value) => validateHour(Number(value))}
                onEndEditing={(e) => hour.length == 1 ? setHour("0" + hour) : setHour(hour)}
                style={[styles.timeInput, saveDisabledHour ? styles.timeInputError : null]} />
              <Text>:</Text>
              <TextInput
                placeholder="00"
                value={minute}
                maxLength={2}
                keyboardType="number-pad"
                textAlign="center"
                selectTextOnFocus={true}
                onChangeText={(value) => validateMinute(Number(value))}
                onEndEditing={(e) => minute.length == 1 ? setMinute("0" + minute) : setMinute(minute)}
                style={[styles.timeInput, saveDisabledMinute ? styles.timeInputError : null]} />
              <Pressable
                onPress={() => setSuffix((prev) => prev == "AM" ? "PM" : "AM")}
                style={styles.timeInput}>
                <Text style={styles.suffixInput}>{suffix}</Text>
              </Pressable>
            </View>
            <View style={styles.errorTextBlock}>
              {saveDisabledHour && !saveDisabledMinute && (
                <Text style={styles.errorText}>Invalid hour</Text>
              )}
              {saveDisabledMinute && !saveDisabledHour && (
                <Text style={styles.errorText}>Invalid minute</Text>
              )}
              {saveDisabledMinute && saveDisabledHour && (
                <Text style={styles.errorText}>Invalid hour and minute</Text>
              )}
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={onClose}
                style={styles.cancelButton}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
              <Pressable
                onPress={onClose}
                style={styles.button}
                disabled={saveDisabled}
                onPressIn={onSave}>
                <Text style={styles.buttonText}>Save</Text>
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
    justifyContent: "space-between",
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
    alignItems: "center",
    justifyContent: "space-evenly"
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
  sectionHeader: {
    margin: 15,
    fontFamily: Fonts.bold,
    fontSize: 16,
    textAlign: "left",
  },
  titleText: {
    margin: 5,
    fontFamily: Fonts.bold,
    fontSize: 16,
    textAlign: "center",
  },
  filterContent: {
    minHeight: "20%",
  },
  avatarRow: {
    flexDirection: "row",
  },
  username: {
    textAlign: "center",
    fontFamily: Fonts.bold,
  },
  avatarStackEnabled: {
    paddingHorizontal: 4,
    paddingBottom: 10,
    opacity: 1
  },
  avatarStackDisabled: {
    paddingHorizontal: 4,
    paddingBottom: 10,
    opacity: 0.3
  },
  listTagView: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  listTagEnabled: {
    opacity: 1
  },
  listTagDisabled: {
    opacity: 0.3
  },
  hourContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hourContentRowDisabled: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    opacity: 0.3
  },
  timePicker: {
    paddingHorizontal: 10,
    backgroundColor: Colors.light.accent,
    fontFamily: Fonts.regular
  },
  timeInputRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  timeInput: {
    backgroundColor: Colors.light.accentLight,
    fontFamily: Fonts.regular,
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    margin: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  timeInputError: {
    borderColor: Colors.light.error,
  },
  suffixInput: {
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  errorText: {
    fontFamily: Fonts.regular,
    color: Colors.light.error,
    textAlign: "center",
  },
  errorTextBlock: {
    marginBottom: 20,
  }
})