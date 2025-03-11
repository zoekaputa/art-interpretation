import React, { useEffect, useState } from "react";
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
import { FontAwesome6 } from "@expo/vector-icons";
import { useBookmarks } from "./BookmarkContext";

const GalleryScreen = ({ route, navigation }) => {
  const { bookmarks, loadBookmarks, removeBookmark } = useBookmarks();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const playAudio = async (audioArray) => {
    try {
      if (!audioArray || audioArray.length === 0) return;
  
      for (const s of audioArray) {
        const status = JSON.parse(s._lastStatusUpdate); // Convert JSON string to object
        const uri = status.uri || null; 
        console.log(uri)
        const sound = new Audio.Sound();
        await sound.loadAsync({ uri });

        if (isPlaying) {
          sound.pauseAsync();
          setIsPlaying(false);
        } else {
          sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
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
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />
            <Text style={styles.titleText}>{item.name}</Text>
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.playButton} onPress={() => playAudio(item.audio)}>
                  <FontAwesome6
                    name={isPlaying ? "pause" : "play"}
                    size={22}
                    color={theme.colors.darkBlue}
                    left="2"
                  />
                </TouchableOpacity>
              <TouchableOpacity onPress={() => removeBookmark(item.id)}>
                <FontAwesome6
                    name={"trash-can"}
                    size={32}
                    color={"red"}
                  />
              </TouchableOpacity>
            </View>
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
  galleryHeaderContainer: {
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
  },
  image: {
    width: 150,
    height: 150,
    marginRight: 10,
  },
  titleText: {
    fontFamily: theme.fonts.karlaLight,
    fontSize: 20,
    padding: 10,
  },
  controlsRow: {
    flexDirection: "row",
    width: "50%",
    paddingHorizontal: "10%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: theme.colors.darkBlue,
    marginHorizontal: "1%",
  },
  deleteButton: {
    marginLeft: 10,
  },
});
