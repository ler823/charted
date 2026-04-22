import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PlacePrediction = {
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
};

type Props = {
  item: PlacePrediction;
  onPress: (placeId: string) => void;
};

export default function PlaceSuggestionItem({ item, onPress }: Props) {
  return (
    <Pressable style={styles.item} onPress={() => onPress(item.place_id)}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="location-outline"
          size={18}
          color={Colors.light.accent}
        />
      </View>
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {item.structured_formatting.main_text}
        </Text>
        {item.structured_formatting.secondary_text ? (
          <Text style={styles.address} numberOfLines={1}>
            {item.structured_formatting.secondary_text}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.light.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2e4a3e",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#243e36",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.bold,
    color: "#fefbea",
    fontSize: 14,
  },
  address: {
    fontFamily: Fonts.regular ?? Fonts.bold,
    color: Colors.light.accent,
    fontSize: 12,
    marginTop: 1,
  },
});
