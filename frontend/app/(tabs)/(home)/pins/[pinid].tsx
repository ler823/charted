import { StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams } from "expo-router"

export default function PinPage () {
    const { pinid } = useLocalSearchParams();

    return (
        <View>
            <Text>
                Card View! Pin {pinid}
            </Text>
        </View>
    );
}
