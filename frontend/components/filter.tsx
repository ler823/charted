import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AvatarBorder from "./avatar-with-colored-border";


type Props = {
  isVisible: boolean,
  onClose: () => void,
}

export default function Filter({ isVisible, onClose, }: Props) {
  const { profile } = useAuth();
  const [friends, setFriends] = useState<{ id: number; username: string }[]>([]);

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
    console.log(data)
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
      })) ?? []
    );
    console.log(friends)
  }

  useEffect(() => {
    if (isVisible) {
      getUserFriends();
    }
  }, [isVisible]);

  return (
    <View>
      <Modal animationType="fade" transparent={true} visible={isVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.filterContent}>
              <Text style={styles.titleText}>Friends</Text>
              <View>
                <FlatList
                  horizontal={true}
                  data={friends}
                  keyExtractor={(item) => item.toString()}
                  renderItem={({ item }) => (
                  <View>
                    <AvatarBorder users_id={item.id} />
                    <Text>{item.username}</Text>
                  </View>
                  )} />
              </View>
              <Text style={styles.titleText}>Lists</Text>
              <View>

              </View>
              <Text style={styles.titleText}>Tags</Text>
              <View>

              </View>
              <Text style={styles.titleText}>Hours</Text>
              <View>
                <View>
                  <Text>Open Now</Text>
                </View>
                <View>
                  <Text>Open at...</Text>
                </View>
              </View>
              <Text style={styles.titleText}>Distance</Text>
              <View>

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
  titleText: {
    margin: 15,
    fontFamily: Fonts.bold,
    fontSize: 16,
    textAlign: "left",
  },
  filterContent: {
    minHeight: "20%",
  },
  avatarRow: {
    flexDirection: "row",
  }
})