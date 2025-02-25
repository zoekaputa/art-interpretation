import React, { useRef, useState, useReducer, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Button,
  Text,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { Audio } from "expo-av";
import theme from "../theme"; // Ensure this path is correct
import { getTranscription } from "../scripts/gpt-request";

const MicButton = () => {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

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

  async function stopRecording() {
    try {
      await recording.stopAndUnloadAsync();
      // You are now recording!
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const setPerm = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    };

    setPerm();
  }, []);

  if (!permissionResponse || permissionResponse.status !== "granted") {
    // Camera permissions are not granted yet.
    const reqPerm = async () => {
      await requestPermission();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    };
    return (
      <View>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the mic
        </Text>
        <Button onPress={reqPerm} title="grant permission" />
      </View>
    );
  }

  const startPulsing = async () => {
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

  const stopPulsing = async () => {
    await stopRecording();
    setIsRecording(false);
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);
    const audioFile = await recording.getURI();
    getTranscription(audioFile);
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
        <FontAwesome6 name="microphone" size={30} color="#AAD2F7" />
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
    borderColor: theme.colors.lightBlue,
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
