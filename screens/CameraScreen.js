import {
  CameraView,
  useCameraPermissions,
  takePictureAsync,
} from "expo-camera";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  AccessibilityInfo,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import theme from "../theme";
import { containsArtwork } from "../scripts/gpt-request";

/* This component is the Profile Screen */
const CameraScreen = ({ route, navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("auto");
  const [isReady, setIsReady] = useState(false);
  const [photoDisabled, setPhotoDisabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const cameraRef = useRef(null);

  /*useFocusEffect(
    useCallback(() => {
      const startChecking = () => {
        console.log("setting interval1");
        const intervalId = setInterval(checkContainsArtwork, 5000); // 10 seconds
        setIntervalId(intervalId);
      };

      if (isReady && !intervalId) {
        setTimeout(startChecking);
      }

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
      };
    }, [intervalId])
  );*/

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const startChecking = () => {
      console.log("setting interval2");
      const intervalId = setInterval(checkContainsArtwork, 5000); // 10 seconds
      setIntervalId(intervalId);
    };

    if (!intervalId) {
      // setTimeout(startChecking);
    }
  }, [isReady]);

  useEffect(() => {
    if (!intervalId) {
      return;
    }

    if (photoDisabled) {
      AccessibilityInfo.announceForAccessibility(
        "No artwork detected, you can still use the camera button to take a picture."
      );
    } else {
      AccessibilityInfo.announceForAccessibility(
        "Artwork detected, use the camera button to take a picture."
      );
    }
  }, [photoDisabled]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function checkContainsArtwork() {
    if (!isReady || !cameraRef.current) {
      return;
    }

    let photo = await cameraRef.current.takePictureAsync({ base64: true });

    const contains = await containsArtwork(photo.base64);
    // console.log(contains, contains === "true");
    setPhotoDisabled(!(contains === "true"));
  }

  async function takePicture() {
    if (cameraRef.current) {
      clearInterval(intervalId);
      setIntervalId(null);
      let photo = await cameraRef.current.takePictureAsync({ base64: true });
      navigation.navigate("Photo Display", {
        photo,
      });
    }
  }

  return (
    <View style={styles.container}>
      {/* Modal for first-time opening */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Welcome to Mosaic! Experience realism through sound with Mosaic.
              Simply take a picture of your artwork, and Mosaic will generate a
              detailed description and an immersive soundscape that brings your
              art to life. You can then interact with the art-expert chatbot to
              further explore artwork, which will update your soundscape
              accordingly!
            </Text>
            <Button title="Continue" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Text style={styles.logo}>mosaic</Text>
      <View style={styles.cameraWrapper}>
        {/* Camera */}
        <CameraView
          ref={cameraRef}
          animateShutter={false}
          style={styles.camera}
          facing={facing}
          flash={flash}
          accessibilityLabel="Camera View"
          accessible={true}
          onCameraReady={() => setIsReady(true)}
        />

        {/* Camera Buttons Toolbar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.centerButton}
            onPress={takePicture}
            accessibilityLabel={
              photoDisabled
                ? "Camera Button. No artwork detected, camera disabled."
                : "Camera Button. Artwork detected, take picture."
            }
            accessible={true}
          >
            <FontAwesome6 name="circle" size={75} color="white" solid />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("Gallery")}
        style={styles.galleryButtonContainer}
      >
        <FontAwesome6
          name="images"
          size={32}
          color={theme.colors.darkBlue}
          accessible={true}
          accessibilityLabel={"your gallery"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CameraScreen;

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
    marginBottom: 20,
    color: theme.colors.darkBlue,
    textShadowColor: theme.colors.lightBlue,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cameraWrapper: {
    width: "100%",
    height: "80%",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0px 0px 10px 4px rgba(141, 193, 221, 0.50)",
  },
  camera: {
    flex: 1,
    color: theme.colors.darkBlue,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  centerButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    borderColor: theme.colors.white,
    borderWidth: 1,
    padding: 8,
    borderRadius: 50,
    margin: "auto",
  },
  galleryButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    margin: "10%",
  },
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
});
