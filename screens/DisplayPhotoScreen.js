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
import { FontAwesome6, Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { requestSound } from "../scripts/request-server";
import theme from "../theme";
import { requestSoundDescriptions } from "../scripts/gpt-request";
import MicButton from "../components/MicButton";


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

    // reqSounds();
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
        const newPosition = Math.min(status.durationMillis, status.positionMillis + 5000); // Move forward 5 seconds
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
        {isLoading ? (
          <>
            <Text style={styles.logo}>artsonix</Text>
            <Text style={styles.directions}>
              Generating audio for this image...
            </Text>
            <ActivityIndicator size="large" />
          </>
        ) : (
          <>
            <Text style={styles.logo}>artsonix</Text>
            <Image source={{ uri: route.params.photo.uri }}  style={[styles.image, { resizeMode: "contain" }]}  />
            <View style={styles.titleContainer}>
              {/* Title */}
              <Text style={styles.titleText}>Artpiece Name</Text>
              {/* Bookmark Button on the Right */}
              <TouchableOpacity>
                <FontAwesome6 name="bookmark" size={24} color={theme.colors.darkBlue} />
              </TouchableOpacity>
            </View>
            <View style={styles.sliderContainer}>
              {/* Time and Slider */}
              <View style={styles.timeRow}>
                <Text style={styles.sliderTime}>{formatTime(timeEllapsed)}</Text>
                <Slider
                  style={styles.sliderStyle}
                  minimumValue={0}
                  maximumValue={duration}
                  minimumTrackTintColor={theme.colors.lightBlue}
                  maximumTrackTintColor={theme.colors.lightGray}
                  thumbImage={require("../assets/images/medium-thumb.png")}
                  value={timeEllapsed}
                  onValueChange={seekTo} 
                />
                <Text style={styles.sliderTime}>{formatTime(duration)}</Text>
              </View>

              {/* Playback Controls */}
              <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.controlButton} onPress={rewind5}>
                  <Feather name="rotate-ccw" size={35} color={theme.colors.darkBlue}/>
                  <Text style={styles.controlText}>5</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.playButton} onPress={playSounds}>
                  <FontAwesome6 name={isPlaying ? "pause" : "play"} size={22} color={theme.colors.darkBlue} left="2"/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton} onPress={forward5}>
                  <Feather name="rotate-cw" size={35} color={theme.colors.darkBlue} />
                  <Text style={styles.controlText}>5</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Speech to Text Button */}
            <View style={styles.micContainer}>
              <MicButton />
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
    marginBottom: 20,
    color: theme.colors.darkBlue,
    textShadowColor: theme.colors.lightBlue,
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3, 
  },
  image: {
    height: 400,
    borderRadius: 8,
    width: "90%", 
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: '0px 0px 10px 4px rgba(141, 193, 221, 0.50)',
  },
  directions: {
    fontFamily: theme.fonts.karlaSemiBold,
    textAlign: "center",
    fontSize: 16,
    padding: "5%",
  },
  titleContainer:{
    flexDirection: "row",
    width: "90%",
    padding: "2%",
    marginTop: 10,
    justifyContent: "space-between",
  },
  titleText:{
    fontFamily: theme.fonts.karlaLight,
    fontSize: 25,
  },
  sliderContainer: {
    alignItems: "center",
    width: "100%",
    padding: "2%",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    justifyContent: "space-between",
  },
  sliderStyle: {
    flex: 1,
    marginHorizontal: 10,
  },
  sliderTime: {
    fontSize: 14,
    color: theme.colors.darkBlue,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
