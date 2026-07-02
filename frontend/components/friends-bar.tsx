import { Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFilterContext } from "@/context/FilterContext";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import AvatarBorder from "./avatar-with-colored-border";

type Friend = { id: number; username: string };

export default function FriendsBar() {
  const { profile } = useAuth();
  const { filterOptions, updateFilterOptions } = useFilterContext();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    if (!profile) return;

    updateFilterOptions({
      self: true,
      friends: null,
      lists: null,
      tags: null,
      openNow: false,
      time: null,
      hour: null,
      minute: null,
      suffix: null,
      distance: null,
    });

    const fetchFriends = async () => {
      const { data, error } = await supabase
        .from("user_relationships1")
        .select(
          `
          requester:profiles!user_relationships_requester_id_fkey (user_id, username),
          target:profiles!user_relationships_target_id_fkey (user_id, username)
        `,
        )
        .or(`requester_id.eq.${profile.id},target_id.eq.${profile.id}`)
        .eq("status", "accepted");

      if (error || !data) return;

      setFriends(
        data.map(({ requester, target }: any) => ({
          id:
            requester.user_id === profile.user_id
              ? Number(target.user_id)
              : Number(requester.user_id),
          username:
            requester.user_id === profile.user_id
              ? target.username
              : requester.username,
        })),
      );
    };

    fetchFriends();
  }, [profile?.user_id]);

  const toggleSelf = () => {
    updateFilterOptions({ ...filterOptions, self: !filterOptions.self });
  };

  const toggleFriend = (id: number) => {
    const current = filterOptions.friends ?? [];
    const next = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    updateFilterOptions({
      ...filterOptions,
      friends: next.length === 0 ? null : next,
    });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <Pressable
        style={filterOptions.self ? styles.itemEnabled : styles.itemDisabled}
        onPress={toggleSelf}
      >
        <AvatarBorder users_id={profile?.user_id ?? 0} size={46} />
        <Text numberOfLines={1} style={styles.username}>You</Text>
      </Pressable>

      {friends.map((friend) => {
        const selected = filterOptions.friends?.includes(friend.id) ?? false;
        return (
          <Pressable
            key={friend.id}
            style={selected ? styles.itemEnabled : styles.itemDisabled}
            onPress={() => toggleFriend(friend.id)}
          >
            <AvatarBorder users_id={friend.id} size={46} />
            <Text numberOfLines={1} style={styles.username}>
              {friend.username}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
  },
  content: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  itemEnabled: {
    paddingHorizontal: 6,
    alignItems: "center",
    opacity: 1,
  },
  itemDisabled: {
    paddingHorizontal: 6,
    alignItems: "center",
    opacity: 0.3,
  },
  username: {
    textAlign: "center",
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: 4,
    maxWidth: 64,
  },
});
