import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import { FontAwesome6, Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { requestSound } from "../scripts/request-server";
import theme from "../theme";
import {
  requestSoundDescriptions,
  createAudioDescription,
  uploadUrlToDevice,
  getAltText,
  getTitle,
} from "../scripts/gpt-request";
import MicButton from "../components/MicButton";

const DisplayPhotoScreen = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sounds, setSounds] = useState(null);
  const [soundDescriptions, setSoundDescriptions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeEllapsed, setTimeEllapsed] = useState(0);
  const [descriptionText, setDescriptionText] = useState(null);
  const [artName, setArtName] = useState(null);

  useEffect(() => {
    const reqSounds = async () => {
      setIsLoading(true);

      const loadingSound = await playLoadingSound();

      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: 0,
        playsInSilentModeIOS: true,
      });

      const descriptions = await requestSoundDescriptions(
        route.params.photo.base64
      );

      console.log(descriptions);
      setSoundDescriptions(descriptions);

      const descText = await getAltText(route.params.photo.base64);
      setDescriptionText(descText);
      await playDescriptionAudio(descText + "Mosaic is still generating the audio for your artpiece. Please wait while we compose your soundscape experience.");

      const title = await getTitle(route.params.photo.base64);
      setArtName(title);

      const newSounds = await Promise.all(
        descriptions.map(async (desc) => {
          const sound = await reqSound(desc);
          return sound;
        })
      );

      await stopLoadingSound(loadingSound);

      setSounds(newSounds);

      setIsLoading(false);
    };

    reqSounds();
  }, []);

  useEffect(() => {
    if (!sounds) return;

    const updatePostions = async () => {
      await Promise.all(
        sounds.map(async (sound) => {
          await sound.setPositionAsync(timeEllapsed);
        })
      );

      await playSounds();
    };

    updatePostions();
  }, [sounds]);

  const playLoadingSound = async () => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(require("../assets/loading-sound.mp3"), {
        shouldPlay: true,
        isLooping: true,
        volume: 0.5,
      });
      return sound;
    } catch (error) {
      console.error("Error playing loading sound:", error);
    }
  };

  const stopLoadingSound = async (loadingSound) => {
    try {
      if (loadingSound) {
        await loadingSound.pauseAsync();
        await loadingSound.unloadAsync();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const playDescriptionAudio = async (text) => {
    const audioFile = await createAudioDescription(text);

    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(
        {
          uri: audioFile,
        },
        { shouldPlay: true }
      );

      await sound.playAsync();
    } catch (error) {
      console.error(error);
    }
  };

  const reqSound = async (desc) => {
    const soundUrl = await requestSound(desc);
    console.log(desc, ":", soundUrl);
    const localFileUri = await uploadUrlToDevice(soundUrl);
    const sound = new Audio.Sound();
    await sound.loadAsync(
      {
        uri: localFileUri,
      },
      { shouldPlay: true }
    );
    await sound.setIsLoopingAsync(true);
    const status = await sound.getStatusAsync();
    // setDuration(status.durationMillis);

    await sound.pauseAsync();

    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

    return sound;
  };

  const onPlaybackStatusUpdate = (playbackStatus) => {
    setTimeEllapsed(playbackStatus.positionMillis);
  };

  const playSounds = () => {
    if (!sounds) {
      return null;
    }

    sounds.forEach((sound) => {
      if (isPlaying) {
        sound.pauseAsync();
        setIsPlaying(false);
      } else {
        sound.playAsync();
        setIsPlaying(true);
      }
    });
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: theme.colors.white }}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.container}>
        <View
          style={styles.imageContainer}
          accessible={true}
          accessibilityLabel={
            descriptionText || "Image of your artpiece. We are still generating alt text for this image."
          }
        >
          <Image
            source={{ uri: route.params.photo.uri }}
            style={[styles.image, { resizeMode: "contain" }]}
          />
        </View>
        {isLoading ? (
          <>
            <Text style={styles.directions}>
              Mosaic is generating an audio for your image. 
            </Text>
            <ActivityIndicator
              size="large"
              accessible={true}
              accessibilityLabel="loading"
            />
          </>
        ) : (
          <>
            <View style={styles.titleContainer}>
              {/* Title */}
              <Text style={styles.titleText}>{artName}</Text>
            </View>
            {/* Buttons */}
            <View style={styles.controlsRow}>
              <View style={styles.controlButton}>
                {/* Speech to Text Button */}
                <MicButton
                  descriptions={soundDescriptions}
                  sounds={sounds}
                  setSounds={setSounds}
                  reqSound={reqSound}
                  setSoundDescriptions={setSoundDescriptions}
                  setIsLoading={setIsLoading}
                  image={route.params.photo.base64}
                />
              </View>
              <TouchableOpacity style={styles.playButton} onPress={playSounds}>
                <FontAwesome6
                  name={isPlaying ? "pause" : "play"}
                  size={22}
                  color={theme.colors.darkBlue}
                  left="2"
                />
              </TouchableOpacity>
              <View style={styles.controlButton}>
                <TouchableOpacity>
                  <FontAwesome6
                    name="bookmark"
                    size={32}
                    color={theme.colors.darkBlue}
                    accessible={true}
                    accessibilityLabel="Bookmark Audio"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        {/*route.params.photo.uri*/}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default DisplayPhotoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: "5%",
  },
  imageContainer: {
    width: "100%",
    padding: "10%",
    height: "fit-content",
    alignItems: "center",
  },
  image: {
    height: 300,
    borderRadius: 8,
    width: "90%",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0px 0px 10px 4px rgba(141, 193, 221, 0.50)",
  },
  directions: {
    fontFamily: theme.fonts.karlaSemiBold,
    marginTop: 32,
    textAlign: "center",
    fontSize: 16,
    padding: "5%",
  },
  titleContainer: {
    flexDirection: "row",
    width: "100%",
    padding: "15%",
    margin: "5%",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: theme.fonts.karlaLight,
    fontSize: 25,
  },
  controlsRow: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: "10%",
    justifyContent: "space-between",
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  controlText: {
    position: "absolute",
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.darkBlue,
    top: 20,
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
  micContainer: {
    alignItems: "center",
    marginTop: "5%",
    justifyContent: "center",
  },
});
