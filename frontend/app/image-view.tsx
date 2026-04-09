import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";


export default function ImageViewer() {
  const { uri } = useLocalSearchParams();
  return (
    <>
      <View style={styles.topBar}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Back</Text>
        </Pressable>
      </View>
      <View style={{flex: 1}}>
        <Image source={{uri: uri}} style={styles.photo} contentFit="contain"  />
      </View>
    </>
  )
}
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    position: "absolute",
    top: 50,
    right: 16,
    left: 16,
    zIndex: 10,
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
  },
  photo: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  }
})
