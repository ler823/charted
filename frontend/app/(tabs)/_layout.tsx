import { useDroppingPin } from "@/context/DroppingPinContext";
import { Ionicons } from "@expo/vector-icons";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Pressable, StyleSheet, View } from "react-native";
import { Colors } from "../../constants/theme";

type TabButtonProps = {
  isFocused?: boolean;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  [key: string]: any;
};

const TabButton = ({ isFocused, icon, ...props }: TabButtonProps) => (
  <Pressable {...props} style={[styles.tabTrigger]}>
    <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
      <Ionicons
        name={icon}
        size={24}
        color={isFocused ? Colors.light.background : "#fff"}
      />
    </View>
  </Pressable>
);

export default function Layout() {
  const { isDroppingPin } = useDroppingPin();
  return (
    <Tabs>
      <TabSlot />
      <TabList style={[styles.tablist, isDroppingPin && { display: "none" }]}>
        <TabTrigger name="home" href="/" asChild>
          <TabButton icon="home" />
        </TabTrigger>
        <TabTrigger name="friends" href="/friends" asChild>
          <TabButton icon="people" />
        </TabTrigger>
        <TabTrigger name="account" href="/account" asChild>
          <TabButton icon="person" />
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
  tabTrigger: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 10,
  },
  iconWrapperActive: {
    backgroundColor: "#fff",
  },
});
