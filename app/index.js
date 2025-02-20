import { StyleSheet, Text, TouchableOpacity } from "react-native";
import CameraScreen from "../screens/CameraScreen";
import DisplayPhotoScreen from "../screens/DisplayPhotoScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome6 } from "@expo/vector-icons";
import theme from "../theme";

const Stack = createNativeStackNavigator();

export default function HomeScreen() {
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
          headerTitle: () => <Text style={styles.displayPageTitle}>Photo</Text>,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FontAwesome6
                name="chevron-left"
                size={20}
                color={theme.colors.black}
                style={styles.icon}
              />
            </TouchableOpacity>
          ),
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
