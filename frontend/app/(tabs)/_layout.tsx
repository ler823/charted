import { Ionicons } from "@expo/vector-icons";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Pressable, StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";

import { useDroppingPin } from "@/context/DroppingPinContext";

export default function Layout() {
  const { isDroppingPin } = useDroppingPin();
  return (
    <Tabs>
      <TabSlot />
      <TabList style={[styles.tablist, isDroppingPin && { display: "none" }]}>
        <TabTrigger name="home" href="/" style={styles.tabTrigger} asChild>
          <Pressable>
            <Ionicons name="home" size={24} color="#fff" />
          </Pressable>
        </TabTrigger>
        <TabTrigger
          name="friends"
          href="/friends"
          style={styles.tabTrigger}
          asChild
        >
          <Pressable>
            <Ionicons name="people" size={24} color="#fff" />
          </Pressable>
        </TabTrigger>
        <TabTrigger
          name="account"
          href="/account"
          style={styles.tabTrigger}
          asChild
        >
          <Pressable>
            <Ionicons name="person" size={24} color="#fff" />
          </Pressable>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tablist: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  tabTrigger: { paddingHorizontal: 20, paddingBottom: 8 },
  icon: { color: "red" },
});
