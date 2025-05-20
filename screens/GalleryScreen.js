import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import theme from "../theme";
import { FontAwesome6 } from "@expo/vector-icons";
import { useBookmarks } from "./BookmarkContext";
import { useFocusEffect } from "@react-navigation/native";

const GalleryScreen = ({ route, navigation }) => {
  const { bookmarks } = useBookmarks();

  return (
    <View style={styles.container}>
      <View style={styles.galleryHeaderContainer}>
        <Text style={styles.galleryHeader}>gallery</Text>
      </View>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() =>
              navigation.navigate("Photo Display", {
                item,
              })
            }
            accessible={true}
            accessibilityLabel={`expand ${item.name} painting`}
          >
            <View style={styles.imageContainer} accessible={true}>
              <Text
                style={styles.titleText}
                accessible={true}
                accessibilityLabel={`Title: ${item.name}`}
              >
                {item.name}
              </Text>
              <Image
                source={item.image}
                style={styles.image}
                accessibilityLabel={item.descriptionText}
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "left",
    backgroundColor: theme.colors.white,
    padding: "5%",
  },
  galleryHeaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10%",
  },
  galleryHeader: {
    fontFamily: theme.fonts.karlaLight,
    fontSize: 25,
    color: theme.colors.darkBlue,
    textShadowColor: theme.colors.lightBlue,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  itemContainer: {
    margin: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  imageContainer: {
    padding: "10%",
    height: "fit-content",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
  },
  image: {
    width: 150,
    height: 150,
  },
  titleText: {
    fontFamily: theme.fonts.karlaLight,
    fontSize: 20,
    padding: 10,
    width: "70%",
  },
  controlsRow: {
    flexDirection: "row",
    width: "50%",
    paddingHorizontal: "10%",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
