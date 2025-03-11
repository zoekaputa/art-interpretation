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
    <View style={styles.container}>
      <View style={styles.galleryHeaderContainer}>
        <Text style={styles.galleryHeader}>my gallery</Text>
      </View>
      <FlatList
        
        data={bookmarks}
        keyExtractor={(item) => item.id.toString()} 
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
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
    </View>
    
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "left",
    backgroundColor: theme.colors.white,
    padding: "5%",
  },
  galleryHeaderContainer:{
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10%",
  }, 
  galleryHeader: {
    fontFamily: theme.fonts.karlaLight,
    fontSize: 25,
    color: theme.colors.darkBlue,
    textShadowColor: theme.colors.lightBlue,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  itemContainer: {
    margin: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
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
