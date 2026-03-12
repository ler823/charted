import { Fonts } from "@/constants/theme";
import { Pin } from "@/types/types";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  pins: Pin[];
  onSelectPin: (pin: Pin) => void;
};

export default function PinCardsView({ pins, onSelectPin }: Props) {
  return (
    <FlatList
      data={pins}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => onSelectPin(item)}>
          <View style={styles.imgPlaceholder}>
            <Text style={styles.imgText}>Image</Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name || "Unnamed Pin"}
          </Text>

          <Text style={styles.cardLoc} numberOfLines={3}>
            {item.address || "No address available"}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pins to display yet.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 170,
    paddingBottom: 24,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#DEE9E0",
    borderRadius: 8,
    padding: 10,
    width: "48%",
    minHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },

  imgPlaceholder: {
    width: "100%",
    height: 110,
    borderRadius: 9,
    backgroundColor: "#cfd8d1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  imgText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#243e36",
  },

  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    marginBottom: 4,
    color: "#000",
  },

  cardLoc: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: "#000",
  },

  emptyContainer: {
    flex: 1,
    marginTop: 40,
    alignItems: "center",
  },

  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: "#243e36",
  },
});