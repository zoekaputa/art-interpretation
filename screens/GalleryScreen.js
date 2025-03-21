import React, { useEffect, useState, useCallback } from "react";
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
import { CurrentRenderContext } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";

const GalleryScreen = ({ route, navigation }) => {
  const { bookmarks, loadBookmarks, removeBookmark } = useBookmarks();
  const [isPlaying, setIsPlaying] = useState(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (isPlaying) {
          isPlaying.forEach(async (s) => {
            s.pauseAsync();
          });
        }
      };
    }, [isPlaying])
  );

  useEffect(() => {
    const setAudioMode = async () => {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: 0,
        playsInSilentModeIOS: true,
      });
    };

    setAudioMode();

    loadBookmarks();
  }, []);

  const playAudio = async (item) => {
    console.log(item.descriptionText);
    const audioArray = item.audio;
    try {
      if (!audioArray || audioArray.length === 0) return;

      if (isPlaying) {
        isPlaying.forEach(async (s) => {
          s.pauseAsync();
        });

        console.log(item.id, currentlyPlayingId, item.id == currentlyPlayingId);
        if (item.id == currentlyPlayingId) {
          setCurrentlyPlayingId(null);
        }
      }

      if (item.id != currentlyPlayingId) {
        const newSounds = await Promise.all(
          audioArray.map(async (s) => {
            const status = JSON.parse(s._lastStatusUpdate); // Convert JSON string to object
            const uri = status.uri || null;
            console.log(uri);
            const sound = new Audio.Sound();
            await sound.loadAsync({ uri });
            await sound.setIsLoopingAsync(true);

            sound.playAsync();

            return sound;
          })
        );

        setIsPlaying(newSounds);
        setCurrentlyPlayingId(item.id);
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
            <View style={styles.imageContainer} accessible={true}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                accessibilityLabel={item.descriptionText}
              />
            </View>
            <Text
              style={styles.titleText}
              accessible={true}
              accessibilityLabel={`Title: ${item.name}`}
            >
              {item.name}
            </Text>
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => playAudio(item)}
                accessible={true}
                accessibilityLabel={
                  currentlyPlayingId == item.id
                    ? `pause ${item.name}`
                    : `play ${item.name}`
                }
              >
                <FontAwesome6
                  name={currentlyPlayingId == item.id ? "pause" : "play"}
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
                  accessible={true}
                  accessibilityLabel={`Remove ${item.name} from gallery`}
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
  imageContainer: {
    padding: "10%",
    height: "fit-content",
    alignItems: "center",
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
