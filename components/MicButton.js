import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Animated, Easing } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import theme from "../theme"; // Ensure this path is correct

const MicButton = () => {
  const [isRecording, setIsRecording] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const startPulsing = () => {
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

  const stopPulsing = () => {
    setIsRecording(false);
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);
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
        onPressIn={startPulsing}
        onPressOut={stopPulsing}
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
