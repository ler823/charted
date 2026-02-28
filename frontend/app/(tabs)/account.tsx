// This is an example of what retrieval from supabase looks like. 
// References from https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native 
// With small modifications to fit our needs

import { Text, View, StyleSheet,FlatList } from "react-native";
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

// This is here because typescript needs to know shape of data. basically, needs to match the table in supabase
type User = {
  user_id: number
  username: string
  photo_id: number | null
}

export default function Account() {
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    getUsers()
  }, [])
  async function getUsers() {
    const { data } = await supabase.from('users').select('*')
    setUsers(data ?? []) 
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.username}</Text>
        )}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
})
