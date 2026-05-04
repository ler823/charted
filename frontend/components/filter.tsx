import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFilterContext } from "@/context/FilterContext";
import { supabase } from "@/lib/supabase";
import { FilterType } from "@/types/types";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import AvatarBorder from "./avatar-with-colored-border";
import TimePicker from "./time-picker";


type Props = {
  isVisible: boolean,
  onClose: () => void,
  exportFilter: (item: FilterType) => void,
}

export default function Filter({ isVisible, onClose, exportFilter }: Props) {
  const { profile } = useAuth();
  const { filterOptions, updateFilterOptions } = useFilterContext();
  const [friends, setFriends] = useState<{ id: number; username: string; enabled: boolean }[]>([]);
  const [lists, setLists] = useState<{ id: number; name: string; enabled: boolean }[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string; enabled: boolean }[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [hour, setHour] = useState<number | null>(null);
  const [minute, setMinute] = useState<number | null>(null);
  const [suffix, setSuffix] = useState<string | null>(null);
  const [mileRadius, setMileRadius] = useState(26);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selfEnabled, setSelfEnabled] = useState(false);

  const getUserFriends = async () => {
    const { data, error } = await supabase
      .from("user_relationships1")
      .select(`
        requester:profiles!user_relationships_requester_id_fkey (
        user_id,
        username
        ),
        target:profiles!user_relationships_target_id_fkey (
        user_id,
        username
        )
        `)
      .or(`requester_id.eq.${profile?.id},target_id.eq.${profile?.id}`)
      .eq("status", "accepted");
    if (error) {
      Alert.alert("Error", error.message);
    }

    var friendsFromDb = data?.map(({ requester, target }) => ({
        id:
          requester.user_id == profile?.user_id
            ? Number(target.user_id)
            : Number(requester.user_id),
        username:
          requester.user_id == profile?.user_id
            ? target.username
            : requester.username,
        enabled: false
      })) ?? []
    const selectedFriends = filterOptions.friends ?? [];
    const preSelectedFriends = friendsFromDb.map((friend) => ({...friend, enabled: selectedFriends.includes(friend.id)}))
    setFriends(preSelectedFriends)
  }

  const getUserLists = async (userId: number) => {
    const { data, error } = await supabase
      .from("lists")
      .select("name, list_id")
      .eq("user_id", userId);
    if (error) {
      console.error("[getUserLists]", error);
      return [];
    }
    const listsFromDb = data.map((list) => ({ id: list.list_id, name: list.name, enabled: false }));
    const selectedLists = filterOptions.lists ?? [];
    const preSelectedLists = listsFromDb.map((list) => ({...list, enabled: selectedLists.includes(list.id)}))
    return preSelectedLists
  }

  const getUserTags = async (userId: number) => {
    const { data, error } = await supabase
      .from("tags")
      .select("name, tag_id")
      .eq("user_id", userId);
    if (error) {
      console.error("[getUserTags]", error);
      return [];
    }
    const tagsFromDb = data.map((tag) => ({ id: tag.tag_id, name: tag.name, enabled: false }));
    const selectedTags = filterOptions.tags ?? [];
    const preSelectedTags = tagsFromDb.map((tag) => ({...tag, enabled: selectedTags.includes(tag.id)}))
    return preSelectedTags
  }

  const clearFilters = async () => {
    setSelfEnabled(false);
    setFriends(friends.map((friend) => ({id: friend.id, username: friend.username, enabled: false})));
    setLists(lists.map((list) => ({id: list.id, name: list.name, enabled: false})));
    setTags(tags.map((tag) => ({id: tag.id, name: tag.name, enabled: false})));
    setOpenNow(false);
    setHour(null);
    setMinute(null);
    setSuffix(null);
    setMileRadius(26);
  }

  const onApply = async () => {
    var friendsToAdd = friends.filter((friend) => friend.enabled).map((friend) => friend.id)
    var listsToAdd = lists.filter((list) => list.enabled).map((list) => list.id)
    var tagsToAdd = tags.filter((tag) => tag.enabled).map((tag) => tag.id)
    var militaryHour = null;
    var time = null;
    if (hour !== null && minute !== null && suffix !== null) {
      militaryHour = suffix == "AM" ? hour : hour! + 12;
      time = militaryHour! * 100 + minute!
    }
    
    updateFilterOptions({
      self: selfEnabled,
      friends: friendsToAdd.length == 0 ? null : friendsToAdd,
      lists: listsToAdd.length == 0 ? null : listsToAdd,
      tags: tagsToAdd.length == 0 ? null : tagsToAdd,
      openNow: openNow,
      time: time,
      hour: hour,
      minute: minute,
      suffix: suffix,
      distance: mileRadius == 26 ? null : mileRadius
    })
    onClose();
  }

  const updateFromContext = async () => {
    setOpenNow(filterOptions.openNow);
    setHour(filterOptions.hour);
    setMinute(filterOptions.minute);
    setSuffix(filterOptions.suffix);
    setMileRadius(filterOptions.distance ?? 26);
  }

  useEffect(() => {
    if (isVisible) {
      const getData = async () => {
        await getUserFriends();
        var lists = await getUserLists(profile?.user_id);
        var tags = await getUserTags(profile?.user_id);
        setLists(lists);
        setTags(tags);
        updateFromContext();
      }
      getData();
    }
  }, [isVisible]);

  useEffect(() => {
    if (openNow) {
      var time = new Date(Date.now());
      setHour(time.getHours() % 12)
      setMinute(time.getMinutes())
      setSuffix(time.getHours() < Number(12) ? "AM" : "PM");
      setHour(time.getHours() % 12);
    }
    else {
      setHour(null);
      setMinute(null);
      setSuffix(null);
    }
  }, [openNow])

  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.titleText}>Filters</Text>
            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            <View style={styles.friendsRow}>
              <View>
                <Text style={styles.sectionHeader}>Me</Text>
                  <Pressable style={selfEnabled ? styles.avatarStackEnabled : styles.avatarStackDisabled} onPress={() => { selfEnabled == true ? setSelfEnabled(false) : setSelfEnabled(true); setRefresh((prev) => !prev) }}>
                    <View style={selfEnabled ? styles.avatarEnabled : null}>
                      <AvatarBorder users_id={profile?.user_id ?? 0} />
                    </View>
                    <Text style={styles.username}>{profile?.username ?? 0}</Text>
                  </Pressable>
              </View>
              <View>
                <Text style={styles.sectionHeader}>Friends</Text>
                <View>
                  <FlatList
                    horizontal={true}
                    data={friends}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <Pressable style={item.enabled ? styles.avatarStackEnabled : styles.avatarStackDisabled} onPress={() => { item.enabled == true ? item.enabled = false : item.enabled = true; setRefresh((prev) => !prev) }}>
                        <View style={item.enabled ? styles.avatarEnabled : null}>
                          <AvatarBorder users_id={item.id} />
                        </View>
                        <Text style={styles.username}>{item.username}</Text>
                      </Pressable>
                    )} />
                </View>
              </View>
            </View>
              <View style={styles.separator} />
              <Text style={styles.sectionHeader}>Lists</Text>
              <View style={styles.listTagView}>
                {lists.length == 0 && (
                  <Text style={styles.emptyListTag}>You have no tags</Text>
                )}
                {lists.map((list) => (
                  <Pressable style={list.enabled ? styles.listTagEnabled : styles.listTagDisabled} onPress={() => { list.enabled == true ? list.enabled = false : list.enabled = true; setRefresh((prev) => !prev) }} key={list.id}>
                    <Text style={styles.regularText}>{list.name}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.separator} />
              <Text style={styles.sectionHeader}>Tags</Text>
              <View style={styles.listTagView}>
                {tags.length == 0 && (
                  <Text style={styles.emptyListTag}>You have no tags</Text>
                )}
                {tags.map((tag) => (
                  <Pressable style={tag.enabled ? styles.listTagEnabled : styles.listTagDisabled} onPress={() => { tag.enabled == true ? tag.enabled = false : tag.enabled = true; setRefresh((prev) => !prev) }} key={tag.id}>
                    <Text style={styles.regularText}>{tag.name}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.separator} />
              <Text style={styles.sectionHeader}>Hours</Text>
              <View>
                <View style={styles.hourContentRow}>
                  <Text style={styles.regularText}>Open Now</Text>
                  <Switch
                    trackColor={{
                      false: Colors.light.text,
                      true: Colors.light.accent,
                    }}
                    thumbColor="#FFF"
                    ios_backgroundColor={Colors.light.text}
                    onValueChange={() => setOpenNow((prev) => !prev)}
                    value={openNow} />
                </View>
                <View style={openNow ? styles.hourContentRowDisabled : styles.hourContentRow}>
                  <Text style={styles.regularText}>Open at...</Text>
                  <Pressable
                    onPress={() => { if (!openNow) setTimePickerVisible(true) }}
                    style={styles.hoursButton}>
                    {(hour == null || minute == null || suffix == null) && (
                      <Text style={styles.regularText}>--:--</Text>
                    )}
                    {(hour != null && minute != null && suffix != null) && (
                      <Text style={styles.regularText}>{hour < 10 ? "0" + hour.toString() : hour}:{minute < 10 ? "0" + minute.toString() : minute} {suffix}</Text>
                    )}
                  </Pressable>
                  {(hour != null && minute != null && suffix != null) && (
                    <Pressable 
                    onPress={() => {if (!openNow) { setHour(null); setMinute(null); setSuffix(null); }}}
                    style={styles.clearButton}>
                      <MaterialIcons name="highlight-remove" size={17} color="white" />
                    </Pressable>
                  )}
                  <TimePicker isVisible={timePickerVisible} onClose={() => setTimePickerVisible(false)} setActualHour={setHour} setActualMinute={setMinute} setActualSuffix={setSuffix} />
                </View>
              </View>
              <View style={styles.separator} />
              <Text style={styles.sectionHeader}>Distance</Text>
              <View>
                {mileRadius < 26 && (
                  <Text style={styles.regularText}>Radius of search (in miles) {mileRadius}</Text>
                )}
                {mileRadius == 26 && (
                  <Text style={styles.regularText}>Locations of all distances will be returned</Text>
                )}
                <Slider
                  value={mileRadius}
                  minimumValue={1}
                  maximumValue={26}
                  minimumTrackTintColor={Colors.light.accent}
                  maximumTrackTintColor="#536161"
                  onValueChange={(value) => setMileRadius(value)}
                  step={1} 
                  style={styles.distanceSlider}/>
              </View>
            </ScrollView>
            <View style={{alignItems: "center"}}>
              <Pressable onPress={clearFilters} style={styles.clearFiltersButton}>
                <Text style={styles.buttonText}>Clear all Filters</Text>
              </Pressable>
            </View>
            <View style={styles.bottomButtons}>
              <Pressable onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onApply} style={styles.button}>
                <Text style={styles.buttonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: '85%',
    maxHeight: '75%',
    justifyContent: "space-between",
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  checkBox: {
    margin: 10,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 20,
    marginTop: 5,
  },
  cancelButton: {
    backgroundColor: Colors.light.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    // padding: 16,
    height: 40,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  button: {
    backgroundColor: "#243e36",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    // padding: 16,
    height: 40,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: "#d9d9d9",
    fontSize: 16,
    textAlign: "center"
  },
  sectionHeader: {
    marginVertical: 15,
    fontFamily: Fonts.bold,
    fontSize: 16,
    textAlign: "left",
  },
  titleText: {
    margin: 15,
    fontFamily: Fonts.bold,
    fontSize: 16,
    textAlign: "center",
  },
  filterContent: {
    minHeight: "20%",
  },
  avatarRow: {
    flexDirection: "row",
  },
  username: {
    textAlign: "center",
    fontFamily: Fonts.bold,
    marginTop: 5,
  },
  avatarStackEnabled: {
    paddingHorizontal: 4,
    paddingBottom: 10,
    opacity: 1,
    
  },
  avatarStackDisabled: {
    paddingHorizontal: 4,
    paddingBottom: 10,
    opacity: 0.3
  },
  listTagView: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  listTagEnabled: {
    opacity: 1,
    backgroundColor: Colors.light.accent,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 2.5,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  listTagDisabled: {
    opacity: 0.3,
    backgroundColor: Colors.light.accent,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 2.5,
    marginVertical: 5,
  },
  hourContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  hourContentRowDisabled: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 5,
    opacity: 0.3
  },
  timePicker: {
    paddingHorizontal: 10,
    backgroundColor: Colors.light.accent,
    fontFamily: Fonts.regular
  },
  hoursButton: {
    backgroundColor: Colors.light.accent,
    marginLeft: "auto",
    borderRadius: 8,
    padding: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  clearButton: {
    backgroundColor: Colors.light.error,
    borderRadius: 8,
    padding: 7,
    marginLeft: 5,
  },
  separator: {
    borderBottomWidth: 1,
    padding: 5,
  },
  clearFiltersButton: {
    backgroundColor: Colors.light.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    borderRadius: 999,
    marginBottom: 10,
    marginTop: 20,
    height: 40,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  distanceSlider: {
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  regularText: {
    fontFamily: Fonts.regular,
  },
  emptyListTag: {
    fontFamily: Fonts.regular,
    color: Colors.light.text,
  },
  avatarEnabled: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  friendsRow: {
    flexDirection: "row",
    gap: 10,
  }
})