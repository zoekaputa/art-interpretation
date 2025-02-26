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
      let photo = await cameraRef.current.takePictureAsync({ base64: true });
      navigation.navigate("Photo Display Screen", {
        photo,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>artsonix</Text>
      <View style={styles.cameraWrapper}>
        {/* Camera */}
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
          accessibilityLabel="Camera View"
          accessible={true} 
          onCameraReady={() => setIsReady(true)}
        />

        {/* Camera Buttons Toolbar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.centerButton} onPress={takePicture} accessibilityLabel="Take Picture"
          accessible={true} >
            <FontAwesome6 name="circle" size={75} color="white" solid />
          </TouchableOpacity>
        </View>
      </View>
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
    fontStyle: "italic",
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
    boxShadow: '0px 0px 10px 4px rgba(141, 193, 221, 0.50)',
  },
  camera: {
    flex: 1,
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
  textContainer: {
    width: 50,  
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 30,
    fontWeight: "bold",
    color: theme.colors.white,
    textAlign: "center",
    includeFontPadding: false,
  },
});
