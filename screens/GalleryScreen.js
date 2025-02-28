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

const GalleryScreen = ({ route, navigation }) => {

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: theme.colors.white }}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.container}>
        
      </View>
    </KeyboardAwareScrollView>
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: "5%",
  },
});
