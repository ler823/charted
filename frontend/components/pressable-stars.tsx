import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type Props = {
  rating: number;
  setRating: (rating: number) => void;
};

export const PressableStars = ({ rating, setRating }: Props) => {
  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            color={star <= rating ? "#C2A83E" : "#000000"}
            size={30}
          />
        </Pressable>
      ))}
    </View>
  );
};