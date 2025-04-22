import React, { useRef, useState, useReducer, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Button,
  Text,
  Modal,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { Audio } from "expo-av";
import theme from "../theme"; // Ensure this path is correct
import {
  getTranscription,
  requestSoundDescriptionUpdate,
  createAudioDescription,
  isAffiramtive,
} from "../scripts/gpt-request";

const MicButton = ({
  descriptions,
  sounds,
  setSounds,
  reqSound,
  setSoundDescriptions,
  setIsLoading,
  image,
  playLoadingSound,
  stopLoadingSound,
  setLoadingSound,
  isPlaying,
  playSounds,
}) => {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [proposedSounds, setProposedSounds] = useState(null);
  const [proposedDescriptions, setProposedDescriptions] = useState(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log("p:", proposedSounds);
  }, [proposedSounds]);

  async function startRecording() {
    const recording = new Audio.Recording();
    try {
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      setRecording(recording);
    } catch (error) {
      console.error(error);
    }
  }

  const playResponseAudio = async (text) => {
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

  async function stopRecording() {
    try {
      await recording.stopAndUnloadAsync();
      // You are now recording!
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!permissionResponse || permissionResponse.status !== "granted") {
      setShowPermissionModal(true);
    }
  }, [permissionResponse]);

  const requestMicPermission = async () => {
    await requestPermission();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    if (permissionResponse?.status === "granted") {
      setShowPermissionModal(false);
    }
  };

  if (!permissionResponse || permissionResponse.status !== "granted") {
    return (
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ textAlign: "center", marginBottom: 10 }}>
              We need your permission to use the microphone.
            </Text>
            <Button onPress={requestMicPermission} title="Grant Permission" />
          </View>
        </View>
      </Modal>
    );
  }

  const startPulsing = async () => {
    if (isPlaying) {
      await playSounds();
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
    });

    await startRecording();
    setIsRecording(true);

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 2,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  const verifyWithUser = async (transcription) => {
    const yes = await isAffiramtive(transcription);
    if (yes) {
      const messageSound = await playResponseAudio(
        "Okay, I will make that change."
      );

      await new Promise((resolve, reject) => {
        messageSound.setOnPlaybackStatusUpdate((status) => {
          if (status.positionMillis > status.durationMillis * 0.8) {
            console.log("Done playing");

            setSounds(proposedSounds);
            setSoundDescriptions(proposedDescriptions);
            resolve(true);
          }
        });
      });

      await stopLoadingSound(loadingSound);
      setLoadingSound(null);

      setIsLoading(false);
    }
    setProposedSounds(null);
    setProposedDescriptions(null);
  };

  const stopPulsing = async () => {
    setIsLoading(true);
    await stopRecording();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const loadingSound = await playLoadingSound();
    setLoadingSound(loadingSound);

    setIsRecording(false);
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);
    const audioFile = await recording.getURI();
    const transcription = await getTranscription(audioFile);

    console.log(proposedSounds);
    if (proposedSounds) {
      verifyWithUser(transcription);
      return;
    }

    const response = await requestSoundDescriptionUpdate(
      descriptions,
      transcription,
      image
    );

    try {
      let haveSoundsChanged = false;

      const newSounds = await Promise.all(
        response.elements.map(async (desc, i) => {
          const old = i >= descriptions.length ? null : descriptions[i];

          if (!desc) {
            haveSoundsChanged = true;
            return null;
          } else if (!old) {
            haveSoundsChanged = true;
            await sounds[i].sound.unloadAsync();
            return await reqSound(
              desc.element,
              i,
              desc.fadeIn ? 0 : desc.volume,
              desc.loop,
              desc.interval
            );
          } else if (
            desc.element === old.element &&
            desc.volume === old.volume &&
            desc.loop === old.loop &&
            desc.interval === old.interval &&
            desc.fadeIn === old.fadeIn &&
            desc.fadeOut === old.fadeOut
          ) {
            return sounds[i].sound;
          } else {
            haveSoundsChanged = true;
            await sounds[i].sound.unloadAsync();
            return await reqSound(
              desc.element,
              i,
              desc.fadeIn ? 0 : desc.volume,
              desc.loop,
              desc.interval
            );
          }
        })
      );

      const wrappedSounds = newSounds.map((s, i) => {
        return {
          sound: s,
          timeout: null,
          fadeIn: response.elements[i] ? response.elements[i].fadeIn : null,
          fadeOut: response.elements[i] ? response.elements[i].fadeOut : null,
          volume: response.elements[i] ? response.elements[i].volume : null,
        };
      });

      const filteredSounds = wrappedSounds.filter(
        (item) => item.sound !== null
      );

      if (haveSoundsChanged) {
        console.log(filteredSounds);
        setProposedSounds(filteredSounds);
        setProposedDescriptions(response.descriptions);
      }

      const messageSound = await playResponseAudio(response.message);

      await stopLoadingSound(loadingSound);
      setLoadingSound(null);

      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.micContainer}>
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseCircle,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        />
      )}
      <TouchableOpacity
        style={styles.micButton}
        onPress={isRecording ? stopPulsing : startPulsing}
        activeOpacity={0.5}
      >
        <FontAwesome6
          name="microphone"
          size={30}
          color={theme.colors.darkBlue}
          accessible={true}
          accessibilityLabel="Microphone button. What more would you like to know about the painting? Click to start recording. Click again to stop recording."
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  micContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.white,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderColor: theme.colors.darkBlue,
    borderWidth: 2,
    shadowColor: "rgba(141, 193, 221, 0.5)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  pulseCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: "rgba(170, 210, 247, 0.5)",
  },
};

export default MicButton;
