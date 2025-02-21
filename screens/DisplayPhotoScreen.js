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
import Slider from "@react-native-community/slider";
import { FontAwesome6 } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { requestSound } from "../scripts/request-server";
import theme from "../theme";
import { requestSoundDescriptions } from "../scripts/gpt-request";

const DisplayPhotoScreen = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sounds, setSounds] = useState(null);
  const [soundDescriptions, setSoundDescriptions] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeEllapsed, setTimeEllapsed] = useState(0);
  const [duration, setDuration] = useState(-1);

  useEffect(() => {
    const reqSounds = async () => {
      setIsLoading(true);

      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true,
        allowsRecordingIOS: true,
        interruptionModeIOS: 0,
        playsInSilentModeIOS: true,
      });
      const descriptions = await requestSoundDescriptions(
        route.params.photo.base64
      );
      setSoundDescriptions(descriptions);

      const newSounds = await Promise.all(
        descriptions.map(async (desc) => {
          const sound = await reqSound(desc);
          return sound;
        })
      );

      setSounds(newSounds);

      setIsLoading(false);
    };

    reqSounds();
  }, []);

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

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: theme.colors.white }}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.screen}>
        {isLoading ? (
          <>
            <Text style={styles.directions}>
              Generating audio for this image...
            </Text>
            <ActivityIndicator size="large" />
          </>
        ) : (
          <>
            <View style={styles.sliderView}>
              <TouchableOpacity style={styles.button} onPress={playSounds}>
                <FontAwesome6
                  name={isPlaying ? "pause" : "play"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
              <Text style={styles.sliderTime}>{timeEllapsed}</Text>
              <Slider
                style={styles.sliderStyle}
                minimumValue={0}
                maximumValue={duration}
                minimumTrackTintColor={theme.colors.lightPink}
                maximumTrackTintColor={theme.colors.lightGray}
                thumbTintColor={theme.colors.lightPink}
                value={timeEllapsed}
              />
              <Text style={styles.sliderTime}>{duration}</Text>
            </View>
          </>
        )}
        <Image source={{ uri: route.params.photo.uri }} style={styles.image} />
        {/*route.params.photo.uri*/}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default DisplayPhotoScreen;

const styles = StyleSheet.create({
  screen: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.lightPink,
    width: 64,
    height: 64,
    padding: 16,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: 500,
    borderRadius: 8,
  },
  directions: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  sliderView: {
    height: "10%",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
  },
  sliderStyle: {
    height: "70%",
    width: "45%",
  },
  sliderTime: {
    fontSize: 15,
    marginLeft: "6%",
    color: theme.colors.black,
  },
});
