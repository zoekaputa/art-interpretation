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
} from "../scripts/gpt-request";
import MicButton from "../components/MicButton";

const DisplayPhotoScreen = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sounds, setSounds] = useState(null);
  const [soundDescriptions, setSoundDescriptions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeEllapsed, setTimeEllapsed] = useState(0);
  const [duration, setDuration] = useState(-1);
  const descriptionText = !soundDescriptions
    ? null
    : `In the foreground of the art, there is ${soundDescriptions[0]}. In the middle-ground, there is ${soundDescriptions[1]}. And the background has ${soundDescriptions[2]}.`;

  useEffect(() => {
    const reqSounds = async () => {
      setIsLoading(true);

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

      const descText = `In the foreground of the art, there is ${descriptions[0]}. In the middle-ground, there is ${descriptions[1]}. And the background has ${descriptions[2]}.`;
      await playDescriptionAudio(descText);

      const newSounds = await Promise.all(
        descriptions.map(async (desc) => {
          const sound = await reqSound(desc);
          return sound;
        })
      );

      setSounds(newSounds);

      setIsLoading(false);
    };

    // reqSounds();
  }, []);

  useEffect(() => {
    if (!sounds) return;

    const updatePostions = async () => {
      await Promise.all(
        sounds.map(async (sound) => {
          await sound.setPositionAsync(timeEllapsed);
        })
      );
    };

    updatePostions();
  }, [sounds]);

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
    const sound = new Audio.Sound();
    await sound.loadAsync(
      {
        uri: soundUrl,
      },
      { shouldPlay: true }
    );
    await sound.setIsLoopingAsync(true);
    const status = await sound.getStatusAsync();
    setDuration(status.durationMillis);

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

  const formatTime = (milliseconds) => {
    if (milliseconds < 0 || isNaN(milliseconds)) return "0:00";
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const seekTo = async (value) => {
    if (!sounds) return;

    // Seek all sounds to the selected position
    await Promise.all(
      sounds.map(async (sound) => {
        await sound.setPositionAsync(value);
      })
    );

    setTimeEllapsed(value); // Update the displayed time
  };

  const rewind5 = async () => {
    if (!sounds) return;

    await Promise.all(
      sounds.map(async (sound) => {
        const status = await sound.getStatusAsync();
        const newPosition = Math.max(0, status.positionMillis - 5000); // Move back 5 seconds
        await sound.setPositionAsync(newPosition);
        setTimeEllapsed(newPosition); // Update the displayed time
      })
    );
  };

  const forward5 = async () => {
    if (!sounds) return;

    await Promise.all(
      sounds.map(async (sound) => {
        const status = await sound.getStatusAsync();
        const newPosition = Math.min(
          status.durationMillis,
          status.positionMillis + 5000
        ); // Move forward 5 seconds
        await sound.setPositionAsync(newPosition);
        setTimeEllapsed(newPosition); // Update the displayed time
      })
    );
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: theme.colors.white }}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.container}>
        <Text style={styles.logo}>artsonix</Text>
        <View
          style={styles.imageContainer}
          accessible={true}
          accessibilityLabel={
            descriptionText || "Still generating alt text for this image."
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
              Artsonix is generating an audio for your image. The audio will be
              provided in three layers: the foreground, middleground, and
              background.
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
              <Text style={styles.titleText}>Artpiece Name</Text>
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
  logo: {
    fontFamily: theme.fonts.karlaLight,
    fontSize: 35,
    fontStyle: "italic",
    marginBottom: "15%",
    color: theme.colors.darkBlue,
    textShadowColor: theme.colors.lightBlue,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  imageContainer: {
    width: "80%",
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
