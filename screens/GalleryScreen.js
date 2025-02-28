import React, { useEffect } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import theme from "../theme";
import { useBookmarks } from "./BookmarkContext";

const GalleryScreen = ({ route, navigation }) => {
  const { bookmarks, loadBookmarks, removeBookmark } = useBookmarks();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const playAudio = async (audio) => {
    if (!audio) return;
    const sound = new Audio.Sound();
    await sound.loadAsync({ uri: audio.uri });
    await sound.playAsync();
  };


  return (
    <FlatList
  data={bookmarks}
  keyExtractor={(item) => item.id.toString()} 
  renderItem={({ item }) => (
    <View style={{ margin: 10 }}>
      <Image source={{ uri: item.image }} style={{ width: 100, height: 100 }} />
      <Text>{item.name}</Text>
      <TouchableOpacity onPress={() => playAudio(item.audio)}>
        <Text>Play Audio</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeBookmark(item.id)}>
        <Text style={{ color: "red" }}>Delete</Text>
      </TouchableOpacity>
    </View>
  )}
/>
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: "5%",
  },
  itemContainer: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
});
