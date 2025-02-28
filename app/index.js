import { StyleSheet, Text, TouchableOpacity } from "react-native";
import GalleryScreen from "../screens/GalleryScreen";
import CameraScreen from "../screens/CameraScreen";
import DisplayPhotoScreen from "../screens/DisplayPhotoScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome6 } from "@expo/vector-icons";
import { useFonts, Karla_300Light, Karla_400Regular, Karla_600SemiBold, Karla_700Bold_Italic } from "@expo-google-fonts/karla";
import theme from "../theme";

const Stack = createNativeStackNavigator();

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    KarlaLight: Karla_300Light,
    KarlaRegular: Karla_400Regular,
    KarlaSemiBold: Karla_600SemiBold,
    KarlaBoldItalic: Karla_700Bold_Italic,
  });

  return (
    <Stack.Navigator initialRouteName="Camera Screen">
      <Stack.Screen
        name="Camera Screen"
        component={CameraScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="Photo Display Screen"
        component={DisplayPhotoScreen}
        options={({ navigation }) => ({
          headerTitle: "",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FontAwesome6
                name="chevron-left"
                size={32}
                color={theme.colors.black}
                style={styles.icon}
                accessible={true}
                accessibilityLabel="Back to Camera"
              /> 
            </TouchableOpacity>
          ),
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent", elevation: 0, shadowOpacity: 0 },
        })}
      />
      <Stack.Screen
        name="Gallery Screen"
        component={GalleryScreen}
        options={({ navigation }) => ({
          headerTitle: "",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FontAwesome6
                name="chevron-left"
                size={32}
                color={theme.colors.black}
                style={styles.icon}
                accessible={true}
                accessibilityLabel="Back to Camera"
              /> 
            </TouchableOpacity>
          ),
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent", elevation: 0, shadowOpacity: 0 },
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  displayPageTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  icon: {
    marginRight: 10,
  },
});
