import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Button,
} from "react-native";
import { Audio } from "expo-av";
import { FontAwesome6, Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { requestSound } from "../scripts/request-server";
import { useFocusEffect } from "@react-navigation/native";
import theme from "../theme";
import {
  requestSoundDescriptions,
  createAudioDescription,
  uploadUrlToDevice,
  getAltText,
  getTitle,
} from "../scripts/gpt-request";
import MicButton from "../components/MicButton";
import { useBookmarks } from "./BookmarkContext";
import PauseableTimeout from "../components/PauseableTimeout";

const DisplayPhotoScreen = ({ route, navigation }) => {
  const defaultAudioFiles = [
    require("../assets/1.wav"),
    require("../assets/2.wav"),
    require("../assets/3.wav"),
  ];
  const { addBookmark } = useBookmarks();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sounds, setSounds] = useState(null);
  const [soundDescriptions, setSoundDescriptions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeEllapsed, setTimeEllapsed] = useState(0);
  const [descriptionText, setDescriptionText] = useState(null);
  const [artName, setArtName] = useState(null);
  const [loadingSound, setLoadingSound] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const soundsRef = useRef(sounds);
  soundsRef.current = sounds;

  const handleBookmark = () => {
    const newBookmark = {
      image: route.params.photo.uri,
      descriptionText: descriptionText,
      audio: sounds,
      name: artName,
    };

    console.log("bookmarked");
    addBookmark(newBookmark);
    setIsBookmarked(true);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (loadingSound) {
          loadingSound.pauseAsync();
        }

        if (!sounds) {
          return null;
        }

        sounds.forEach((sound) => {
          if (isPlaying) {
            sound.sound.pauseAsync();
            setIsPlaying(false);
          }
        });
      };
    }, [sounds, isPlaying, loadingSound])
  );

  useEffect(() => {
    const reqSounds = async () => {
      setIsLoading(true);

      const loadingSound = await playLoadingSound();
      setLoadingSound(loadingSound);

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

      const title = await getTitle(route.params.photo.base64);
      setArtName(title);

      const newSounds = await Promise.all(
        descriptions.map(
          async ({ element, volume, loop, interval, fadeIn }, i) => {
            const loadedSound = await reqSound(
              element,
              i,
              fadeIn ? 0 : volume,
              loop,
              interval
            );
            return loadedSound;
          }
        )
      );

      await stopLoadingSound(loadingSound);
      setLoadingSound(null);

      const descriptionAudio = await playDescriptionAudio(
        descText +
          "Mosaic is still generating the audio for your artpiece. Please wait while we compose your soundscape experience."
      );
      descriptionAudio.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
          setSounds(
            newSounds.map((s, i) => {
              return {
                sound: s,
                timeout: null,
                fadeIn: descriptions[i].fadeIn,
                fadeOut: descriptions[i].fadeOut,
                volume: descriptions[i].volume,
              };
            })
          );
        }
      });

      setIsLoading(false);
    };

    reqSounds();
  }, []);

  useEffect(() => {
    if (!sounds) return;

    const updatePostions = async () => {
      await Promise.all(
        sounds.map(async (sound) => {
          await sound.sound.setPositionAsync(timeEllapsed);
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

  const fadeVolumeHelper = async (
    i,
    sound,
    steps,
    volumeStep,
    stepTime,
    from
  ) => {
    setTimeout(async function () {
      await sound.sound.setVolumeAsync(from + i * volumeStep);
      if (i + 1 < steps) {
        await fadeVolumeHelper(i + 1, sound, steps, volumeStep, stepTime, from);
      }
    }, stepTime);
  };

  const fadeVolume = async (sound, from, to, duration) => {
    const steps = 10;
    const stepTime = duration / steps;
    const volumeStep = (to - from) / steps;

    await fadeVolumeHelper(0, sound, steps, volumeStep, stepTime, from);
  };

  const stopLoadingSound = async (loadingSound) => {
    try {
      if (loadingSound) {
        await loadingSound.pauseAsync();
        await loadingSound.unloadAsync();
      }
    } catch (error) {
      console.error("Error stopping loading sound:", error);
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
      return sound;
    } catch (error) {
      console.error(error);
    }
  };

  const requestSoundLocal = async (query) => {
    const response = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${query}&token=${process.env.EXPO_PUBLIC_FREE_SOUND_API_KEY}`
    );
    const data = await response.json();
    const id = data.results[0].id;

    const soundResponse = await fetch(
      `https://freesound.org/apiv2/sounds/${id}/?token=${process.env.EXPO_PUBLIC_FREE_SOUND_API_KEY}`
    );
    const soundData = await soundResponse.json();
    console.log(soundData.previews["preview-hq-mp3"]);
    return soundData.previews["preview-hq-mp3"];
  };

  const reqSound = async (desc, index, volume, loop, interval) => {
    try {
      const soundUrl = await requestSoundLocal(desc);
      console.log(desc, ":", soundUrl);

      const setLoop = loop && interval === 0;

      if (!soundUrl) {
        const sound = new Audio.Sound();
        await sound.loadAsync(defaultAudioFiles[index], {
          shouldPlay: true,
          isLooping: setLoop,
          volume,
        });
        return sound;
      }

      const localFileUri = await uploadUrlToDevice(soundUrl, desc);
      const sound = new Audio.Sound();
      await sound.loadAsync(
        {
          uri: localFileUri,
        },
        { shouldPlay: true }
      );
      await sound.setIsLoopingAsync(setLoop);
      await sound.setVolumeAsync(volume);

      await sound.pauseAsync();

      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate(index, interval));

      return sound;
    } catch (error) {
      setIsModalVisible(true);
      // console.error("Error making sound", error);
    }
  };

  const onPlaybackStatusUpdate = (index, interval) => {
    function playbackFunction(playbackStatus) {
      async function timeoutFunction() {
        await soundsRef.current[index].sound.replayAsync();
        if (soundsRef.current[index].fadeIn) {
          fadeVolume(
            soundsRef.current[index],
            0,
            soundsRef.current[index].volume,
            5000
          );
        }
        soundsRef.current[index].timeout = null;
      }
      setTimeEllapsed(playbackStatus.positionMillis);

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        soundsRef.current[index].timeout = new PauseableTimeout(
          timeoutFunction,
          interval
        );
      }
    }
    return playbackFunction;
  };

  const playSounds = () => {
    if (!sounds) {
      return null;
    }

    sounds.forEach((sound) => {
      if (isPlaying) {
        sound.sound.pauseAsync();
        setIsPlaying(false);

        if (sound.timeout) {
          sound.timeout.pause();
        }
      } else {
        sound.sound.playAsync();
        if (sound.fadeIn) {
          fadeVolume(sound, 0, sound.volume, 5000);
        }
        setIsPlaying(true);

        if (sound.timeout) {
          sound.timeout.play();
        }
      }
    });
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: theme.colors.white }}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.container}>
        <Modal visible={isModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Mosaic cannot complete your request because too many sounds are
                being requested at the moment. Please try again in a moment.
              </Text>
              <Button
                title="Continue"
                onPress={() => setIsModalVisible(false)}
              />
            </View>
          </View>
        </Modal>
        <View
          style={styles.imageContainer}
          accessible={true}
          accessibilityLabel={
            descriptionText ||
            "Image of your artpiece. We are still generating alt text for this image."
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
              <Text
                style={styles.titleText}
                accessible={true}
                accessibilityLabel={`title: ${artName}`}
              >
                {artName}
              </Text>
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
                  playLoadingSound={playLoadingSound}
                  stopLoadingSound={stopLoadingSound}
                  image={route.params.photo.base64}
                  setLoadingSound={setLoadingSound}
                  isPlaying={isPlaying}
                  playSounds={playSounds}
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
            </View>
            <View style={styles.controlsRow}>
              <View style={styles.controlButton}>
                <TouchableOpacity onPress={handleBookmark}>
                  <FontAwesome6
                    name={"bookmark"}
                    size={32}
                    color={theme.colors.darkBlue}
                    accessible={true}
                    accessibilityLabel={
                      isBookmarked ? "Added to Gallery" : "Add to Gallery"
                    }
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.controlButton}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Gallery")}
                >
                  <FontAwesome6
                    name="images"
                    size={32}
                    paddingTop={5}
                    color={theme.colors.darkBlue}
                    accessible={true}
                    accessibilityLabel={"your gallery"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default DisplayPhotoScreen;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
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
    paddingBottom: "10%",
    justifyContent: "center",
    alignItems: "center",
    gap: 55,
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
    width: 53,
    height: 53,
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
  galleryButton: {
    fontFamily: theme.fonts.karlaLight,
    fontSize: 25,
    color: theme.colors.darkBlue,
    textShadowColor: theme.colors.lightBlue,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
