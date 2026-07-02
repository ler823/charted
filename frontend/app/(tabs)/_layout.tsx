import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Pressable } from "react-native";

export default function Layout() {
  return (
    <Tabs>
      <TabSlot />
      {/* TabTriggers register screens with the navigator — hidden visually */}
      <TabList style={{ display: "none" }}>
        <TabTrigger name="home" href="/" asChild>
          <Pressable />
        </TabTrigger>
        <TabTrigger name="lists" href="/lists" asChild>
          <Pressable />
        </TabTrigger>
        <TabTrigger name="friends" href="/friends" asChild>
          <Pressable />
        </TabTrigger>
        <TabTrigger name="account" href="/account" asChild>
          <Pressable />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
