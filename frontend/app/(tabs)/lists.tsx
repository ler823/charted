import { Fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ListCard from "./(home)/list_card";


export default function Lists() {
  const [lists, setLists] = useState<string[]>([])
  const getUserLists = async () => {
    const { data, error } = await supabase
      .from("lists")
      .select(
        `
        list_id,
        name,
        users!lists_user_id_fkey (
          username
        )
      `,
      )
      .eq("users.username", "TimTimTim");

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setLists(data.map((list: { name: string }) => list.name))
    return data.map((list: { name: string }) => list.name);
  };
  useEffect(() => {
    getUserLists();
  }, [])
  return (
    <SafeAreaView>
      <Text style={styles.title}>My Lists</Text>
      <View style={styles.spacer} />

      <FlatList
        data={lists}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.cards}
            onPress={(item) => {
              
            }}
          >
            <ListCard name={item} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cards: {
    width: "100%",
    alignItems: "center",
  },
  spacer: {
    marginTop: 0,
  },
  listContent: {
    paddingBottom: 265,
  },
  title: {
    margin: 20,
    fontFamily: Fonts.bold,
    fontSize: 20,
  }
});
