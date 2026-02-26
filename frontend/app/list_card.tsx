import { Raleway_400Regular, Raleway_700Bold, useFonts } from "@expo-google-fonts/raleway";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ListCard() {
    const [fontsLoaded] = useFonts({
        Raleway_400Regular,
        Raleway_700Bold,
    });

    if (!fontsLoaded) {
        return null;
        }
    
    return (
          <View style={styles.card}>
              <Image source={require('../assets/images/test_ss_creamery.png')} style={styles.img} />
              <View>
                <Text style={styles.cardTitle}>
                    Seaside Creamery
                </Text>
                <Text style={styles.cardLoc}>
                    0.2 miles away
                </Text>
              </View>
          </View>
    );
}

const styles = StyleSheet.create({
    img: {
        width: 65,
        height: 65,
        resizeMode: 'cover',
        aspectRatio: 1,
    },

    card: {
        backgroundColor: '#DEE9E0',
        padding: 12,
        margin: 5,
        borderRadius: 5,
        height: 80,
        width: '95%',
        flexDirection: 'row',
        alignItems: 'center',

        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 2,

        // Android
        elevation: 4,
    },

    cardTitle: {
        fontFamily: 'Raleway_700Bold',
        fontSize: 16,
        paddingLeft: 7,
        paddingBottom: 1,
    },

    cardLoc: {
        fontFamily: 'Raleway_400Regular',
        fontSize: 12,
        paddingLeft: 7,
    }
});