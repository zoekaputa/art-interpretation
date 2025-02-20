import {
  CameraView,
  useCameraPermissions,
  takePictureAsync,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import theme from "../theme";

/* This component is the Profile Screen */
const CameraScreen = ({ route, navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("auto");
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function takePicture() {
    if (!isReady) {
      return;
    }

    if (cameraRef.current) {
      let photo = await cameraRef.current.takePictureAsync();
      navigation.navigate("Photo Display Screen", {
        photo,
      });
    }
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function toggleFlash() {
    setFlash((current) => {
      switch (current) {
        case "off":
          return "on";
        case "on":
          return "auto";
        case "auto":
          return "off";
      }
    });
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => setIsReady(true)}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleFlash}>
          <FontAwesome6
            name="bolt"
            size={24}
            color={
              flash === "off" ? theme.colors.white : theme.colors.lightPink
            }
          />
          {flash == "off" && (
            <FontAwesome6
              style={styles.slash}
              name="slash"
              size={24}
              color={theme.colors.white}
            />
          )}
          {flash === "auto" && <Text style={styles.text}>A</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.centerButton} onPress={takePicture}>
          <FontAwesome6 name="circle" size={75} color="white" solid />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <FontAwesome6 name="rotate" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    height: "fit-content",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: 20,
    backgroundColor: theme.colors.black,
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  button: {
    height: "flex-end",
    alignItems: "center",
    borderColor: theme.colors.white,
    borderWidth: 1,
    padding: 16,
    borderRadius: 50,
    margin: "auto",
    flexDirection: "row",
    gap: 5,
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
  slash: {
    position: "absolute",
    top: 18,
    left: 15,
    zIndex: 1,
    fontSize: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.lightPink,
  },
});
