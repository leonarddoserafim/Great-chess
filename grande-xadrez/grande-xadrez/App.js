import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
 
import HomeScreen from "./screens/HomeScreen";
import ChessScreen from "./screens/ChessScreen";
 
const Stack = createNativeStackNavigator();
 
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#1f1f1f" },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chess"
          component={ChessScreen}
          options={{ title: "Xadrez" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
