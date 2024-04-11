import React, { useEffect } from "react";
import { Platform, StatusBar, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { UserProvider } from "../contexts/UserContext";
import { ThemeProvider } from "../constants/temas/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  if (!fontsLoaded) {
    return null; // Continua mostrando a splash screen nativa até que as fontes estejam carregadas.
  }

  // Depois que as fontes são carregadas e a splash screen é escondida, renderiza o conteúdo do app.
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="[...missing]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
