import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import AvatarBorder from "./avatar-with-colored-border";
import TimePicker from "./time-picker";


type Props = {
  isVisible: boolean,
  onClose: () => void,
}

export default function Filter({ isVisible, onClose, }: Props) {
  const { profile } = useAuth();
  const [friends, setFriends] = useState<{ id: number; username: string; enabled: boolean }[]>([]);
  const [lists, setLists] = useState<{ id: number; name: string; enabled: boolean }[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string; enabled: boolean }[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [suffix, setSuffix] = useState<string | null>(null);
  const [mileRadius, setMileRadius] = useState(26);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

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
    //const friendIdList = data?.map(({ requester, target }) => requester.user_id == profile!.user_id ? Number(target.user_id) : Number(requester.user_id)) ?? []
    setFriends(
      data?.map(({ requester, target }) => ({
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
    );
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
    return data.map((list) => ({ id: list.list_id, name: list.name, enabled: false }));
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
    return data.map((tag) => ({ id: tag.tag_id, name: tag.name, enabled: false }));
  }

  useEffect(() => {
    if (isVisible) {
      const getData = async () => {
        await getUserFriends();
        var lists = await getUserLists(profile?.user_id);
        var tags = await getUserTags(profile?.user_id);
        setLists(lists);
        setTags(tags);
      }
      getData();
    }
  }, [isVisible]);

  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.titleText}>Filters</Text>
            <ScrollView style={styles.filterContent}>
              <Text style={styles.sectionHeader}>Friends</Text>
              <View>
                <FlatList
                  horizontal={true}
                  data={friends}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <Pressable style={item.enabled ? styles.avatarStackEnabled : styles.avatarStackDisabled} onPress={() => { item.enabled == true ? item.enabled = false : item.enabled = true; setRefresh((prev) => !prev) }}>
                      <AvatarBorder users_id={item.id} />
                      <Text style={styles.username}>{item.username}</Text>
                    </Pressable>
                  )} />
              </View>
              <View style={styles.separator} />
              <Text style={styles.sectionHeader}>Lists</Text>
              <View style={styles.listTagView}>
                {lists.map((list) => (
                  <Pressable style={list.enabled ? styles.listTagEnabled : styles.listTagDisabled} onPress={() => { list.enabled == true ? list.enabled = false : list.enabled = true; setRefresh((prev) => !prev) }} key={list.id}>
                    <Text>{list.name}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.separator} />
              <Text style={styles.sectionHeader}>Tags</Text>
              <View style={styles.listTagView}>
                {tags.map((tag) => (
                  <Pressable style={tag.enabled ? styles.listTagEnabled : styles.listTagDisabled} onPress={() => { tag.enabled == true ? tag.enabled = false : tag.enabled = true; setRefresh((prev) => !prev) }} key={tag.id}>
                    <Text>{tag.name}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.separator} />
              <Text style={styles.sectionHeader}>Hours</Text>
              <View>
                <View style={styles.hourContentRow}>
                  <Text>Open Now</Text>
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
                  <Text>Open at...</Text>
                  <Pressable
                    onPress={() => { if (!openNow) setTimePickerVisible(true) }}
                    style={styles.hoursButton}>
                    {(hour == null || minute == null || suffix == null) && (
                      <Text>--:--</Text>
                    )}
                    {(hour != null && minute != null && suffix != null) && (
                      <Text>{hour}:{minute} {suffix}</Text>
                    )}
                  </Pressable>
                  {(hour != null && minute != null && suffix != null) && (
                    <Pressable 
                    onPress={() => { setHour(null); setMinute(null); setSuffix(null); }}
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
                  <Text>Radius of search (in miles) {mileRadius}</Text>
                )}
                {mileRadius == 26 && (
                  <Text>Locations of all distances will be returned</Text>
                )}
                <Slider
                  value={mileRadius}
                  minimumValue={1}
                  maximumValue={26}
                  minimumTrackTintColor={Colors.light.accent}
                  maximumTrackTintColor="#536161"
                  onValueChange={(value) => setMileRadius(value)}
                  step={1} />
              </View>
            </ScrollView>
            <View style={styles.bottomButtons}>
              <Pressable onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.button}>
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
    width: '75%',
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
    margin: 20
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
    fontSize: 16
  },
  sectionHeader: {
    margin: 15,
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
  },
  avatarStackEnabled: {
    paddingHorizontal: 4,
    paddingBottom: 10,
    opacity: 1
  },
  avatarStackDisabled: {
    paddingHorizontal: 4,
    paddingBottom: 10,
    opacity: 0.3
  },
  listTagView: {
    flexDirection: "row",
    flexWrap: "wrap",
    margin: 5,
  },
  listTagEnabled: {
    opacity: 1,
    backgroundColor: Colors.light.accent,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 2.5,
  },
  listTagDisabled: {
    opacity: 0.3,
    backgroundColor: Colors.light.accent,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 2.5
  },
  hourContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 5,
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
    padding: 7
  },
  clearButton: {
    backgroundColor: Colors.light.error,
    borderRadius: 8,
    padding: 7,
    marginLeft: 5,
  },
  separator: {
    borderBottomWidth: 1,
  }
})