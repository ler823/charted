import { Fonts } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View, Text } from "react-native";
import ListCard from "../(tabs)/(home)/list_card";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

type Props = {
  pins: Pin[];
};

type Pin = {
  id: string;
  name: string | null;
  address: string | null;
  pinIds: number[];
  userIds: number[];
  latitude: number;
  longitude: number;
  user_id?: number | null;
};

export default function ClusterSelect() {
    const { selectid, userIds, name } = useLocalSearchParams();
    const router = useRouter();
    const [clusterPins, setClusterPins] = useState<Pin[]>([]);

    useEffect(() => {
    async function fetchClusterPins() {
        if (!selectid) return;

        const ids = JSON.parse(selectid as string);

        const { data, error } = await supabase
            .from("pins")
            .select("*")
            .in("pin_id", ids);

        if (error) {
            console.log(error.message);
            return;
        }

        const formattedPins: Pin[] = data.map((p: any) => ({
            id: String(p.pin_id),
            name: p.name,
            address: p.address,
            pinIds: [p.pin_id],
            userIds: [p.user_id],
            latitude: p.latitude,
            longitude: p.longitude,
        }));

        setClusterPins(formattedPins);
    }

    fetchClusterPins();
    }, [selectid]);

  return (
    <View>
        <View
            style={{
                marginTop: 45,
                marginHorizontal: 10,
                flexDirection: "row",
                justifyContent: "space-between",
            }}
            >
            <Pressable
                style={styles.backButton}
                onPress={() => {
                router.back();
                }}
            >
                <Ionicons name="chevron-back" size={20} color="#d9d9d9" />
                <Text
                style={{ fontFamily: Fonts.bold, color: "#d9d9d9", fontSize: 16 }}
                >
                Back
                </Text>
            </Pressable>
        </View>
      <View style={styles.spacer} />
      <Text style={{fontFamily: Fonts.bold, color: "#243e36", fontSize: 30, alignSelf: "center", marginBottom: 10}}>
        Select a pin
      </Text>

      <FlatList
        data={clusterPins}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.cards}
            onPress={() =>
              router.push({
                pathname: "/pins/[pinid]",
                params: {
                  pinid: String(item.pinIds?.[0]),
                },
              })
            }
          >
            <ListCard pinId={String(item.pinIds?.[0])} name={item.name ?? undefined} loc={item.address ?? undefined} userIds={item.userIds} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pins in this cluster.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cards: {
    width: "100%",
    alignItems: "center",
  },
  spacer: {
    marginTop: 30,
  },
  listContent: {
    paddingBottom: 265,
  },
  emptyContainer: {
      marginTop: 45,
      alignItems: "center",
    },
    emptyText: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: "#243e36",
    },
    backButton: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
    width: 105,
    height: 40,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
});
