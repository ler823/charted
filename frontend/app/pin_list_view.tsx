import React from "react";
import { StyleSheet, View } from "react-native";
import ListCard from "./(tabs)/list_card";

export default function PinListView() {
    return (
        <View style={styles.wholeView}>
            <ListCard />
            <ListCard />
        </View>
    );
}

const styles = StyleSheet.create({
    wholeView: {
        alignItems: 'center',
    },
});