import { Fonts } from "@/constants/theme";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";


export default function LoadingPage() {
    return (
        <View style={styles.wholePage}>
            <Text style={styles.loadText}>Loading</Text>
            <ActivityIndicator size="large" color="#243e36" />
        </View>
    )
}

const styles = StyleSheet.create({
    wholePage: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadText: {
      fontSize: 20,
      fontFamily: Fonts.regular_i,
      color: "#243e36",
      marginBottom: 15,
    }
});