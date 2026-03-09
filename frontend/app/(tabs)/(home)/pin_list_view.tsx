import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ListCard from "./list_card";
import { useRouter } from "expo-router";

export default function PinListView() {
    const router = useRouter()
    // const {cards} = useCards()
    // this is the context that should be set up with the database for viewing card locations. tutorial #22 i think for how to set it up

    return (
        <View>
            <View style={styles.spacer} />
            {/*<FlatList
                // here's the flatlist i believe set up correctly?? it may be easier to just move the list cards into this module and not pass props at all
                data={cards}
                keyExtractor={(item) => item.$id}
                renderItem={({item}) => (
                    <Pressable style={styles.cards} onPress={() => router.push(`/pins/${item.$id}`)}>
                        <ListCard photo={item.photo} name={item.name} loc={item.location}/>
                    </Pressable>
                )}
            />*/}
            <Pressable style={styles.cards} onPress={() => 
                router.push({
                    pathname: "/pins/[pinid]",
                    params: {
                        pinid: 123
                    }})}>
                <ListCard />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    cards: {
        width: "100%",
        alignItems: "center",
    },
    spacer: {
        marginTop: 170,
    }
});