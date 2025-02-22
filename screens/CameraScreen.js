import {
  CameraView,
  useCameraPermissions,
  takePictureAsync,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import theme from "../theme";
import MicButton from "../components/MicButton";

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
      <Text style={styles.logo}>artsonix</Text>
      <View style={styles.cameraWrapper}>
        {/* Camera */}
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
          onCameraReady={() => setIsReady(true)}
        />

        {/* Camera Buttons Toolbar */}
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleFlash}>
          {flash === "auto" ? (
            <View style={styles.textContainer}>
              <Text style={styles.text}>A</Text> 
            </View>
            
          ) : (
            <>
              <FontAwesome6
                name="bolt"
                size={24}
                color={flash === "off" ? theme.colors.white : theme.colors.yellow}
              />
              {flash === "off" && (
                <FontAwesome6
                  style={styles.slash}
                  name="slash"
                  size={24}
                  color={theme.colors.white}
                />
              )}
            </>
          )}
        </TouchableOpacity>
          <TouchableOpacity style={styles.centerButton} onPress={takePicture}>
            <FontAwesome6 name="circle" size={75} color="white" solid />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <FontAwesome6 name="rotate" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Speech to Text Button */}
      <View style={styles.micContainer}>
        <MicButton />
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "start",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: "5%",
    paddingVertical: "5",
  },
  logo: {
    fontFamily: theme.fonts.karlaLight,
    fontSize: 35,
    fontStyle: "italic",
    marginBottom: 10,
    color: theme.colors.darkBlue,
    textShadowColor: theme.colors.lightBlue,
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3, 
  },
  cameraWrapper: {
    width: "100%", 
    height: "75%",
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
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.white,
    borderWidth: 1,
    width: 60,  
    height: 60, 
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
  micContainer: {
    alignItems: "center",
    marginTop: "10%", 
  },
});
