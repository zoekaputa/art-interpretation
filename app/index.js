import { StyleSheet, Text, TouchableOpacity } from "react-native";
import GalleryScreen from "../screens/GalleryScreen";
import CameraScreen from "../screens/CameraScreen";
import DisplayPhotoScreen from "../screens/DisplayPhotoScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome6 } from "@expo/vector-icons";
import {
  useFonts,
  Karla_300Light,
  Karla_400Regular,
  Karla_600SemiBold,
  Karla_700Bold_Italic,
} from "@expo-google-fonts/karla";
import theme from "../theme";
import { BookmarkProvider } from "../screens/BookmarkContext";

const Stack = createNativeStackNavigator();

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    KarlaLight: Karla_300Light,
    KarlaRegular: Karla_400Regular,
    KarlaSemiBold: Karla_600SemiBold,
    KarlaBoldItalic: Karla_700Bold_Italic,
  });

  return (
    <BookmarkProvider>
      <Stack.Navigator initialRouteName="Gallery">
        {/* Photo Display Screen */}
        <Stack.Screen
          name="Photo Display"
          component={DisplayPhotoScreen}
          options={({ navigation }) => {
            // Get the previous route name
            const previousRoute =
              navigation.getState()?.routes?.slice(-2, -1)[0]?.name ||
              "Previous Page";

            return {
              headerTitle: "",
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <FontAwesome6
                    name="chevron-left"
                    size={32}
                    color={theme.colors.black}
                    style={styles.icon}
                    accessible={true}
                    accessibilityLabel={`Back to ${previousRoute}`}
                  />
                </TouchableOpacity>
              ),
              headerTransparent: true,
              headerStyle: {
                backgroundColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,
              },
            };
          }}
        />

        {/* Gallery Screen */}
        <Stack.Screen
          name="Gallery"
          component={GalleryScreen}
          options={({ navigation }) => {
            // Get the previous route name
            const previousRoute =
              navigation.getState()?.routes?.slice(-2, -1)[0]?.name ||
              "Previous Page";

            return {
              headerTitle: "",
              headerTransparent: true,
              headerStyle: {
                backgroundColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,
              },
            };
          }}
        />
      </Stack.Navigator>
    </BookmarkProvider>
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
