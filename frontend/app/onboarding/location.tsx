import { useLocation } from "@/hooks/use-location";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LocationPrimerScreen() {
  const { requestPermission, fetchLocation } = useLocation();

  const handleAllow = async () => {
    const granted = await requestPermission();
    if (granted) {
      await fetchLocation(); // grab coords immediately while we have momentum
    }
    router.replace("/(tabs)/(home)"); // always proceed regardless
  };

  const handleSkip = () => {
    router.replace("/(tabs)/(home)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.headline}>Find whats near you</Text>
      <Text style={styles.body}>
        Allow location access to discover nearby businesses, parks, and places
        without manually searching.
      </Text>

      <View style={styles.benefits}>
        {[
          "🔍  Search results ranked by distance",
          "🗺️  See what's around you instantly",
          "⚡  Faster, more relevant suggestions",
        ].map((item) => (
          <Text key={item} style={styles.benefit}>
            {item}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleAllow}>
        <Text style={styles.primaryBtnText}>Enable location</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip}>
        <Text style={styles.skipText}>Not right now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  icon: { fontSize: 64, marginBottom: 24 },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  body: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 32 },
  benefits: { alignSelf: "stretch", marginBottom: 40, gap: 12 },
  benefit: { fontSize: 15, color: "#333" },
  primaryBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  skipText: { color: "#888", fontSize: 15 },
});
