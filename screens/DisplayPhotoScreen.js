import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  View,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import theme from "../theme";

const DisplayPhotoScreen = ({ route, navigation }) => {
  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: theme.colors.white }}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.screen}>
        <Image source={{ uri: route.params.photo.uri }} style={styles.image} />
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
  image: {
    height: 500,
    borderRadius: 8,
  },
});
