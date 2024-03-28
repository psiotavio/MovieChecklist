import React, { useEffect } from 'react';
import { View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router'; 
import { UserProvider } from '../contexts/UserContext';
import { ThemeProvider } from '../constants/temas/ThemeContext';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync(); // Evita que a splash screen desapareça automaticamente.
      if (fontsLoaded) {
        setTimeout(async () => {
          await SplashScreen.hideAsync(); // Esconde a splash screen após 2 segundos.
        }, 2000); // Mantém a splash screen visível por 2 segundos após as fontes serem carregadas.
      }
    }
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Continua mostrando a splash screen nativa até que as fontes estejam carregadas.
  }

  // Depois que as fontes são carregadas e a splash screen é escondida, renderiza o conteúdo do app.
  return (
    <View style={{ flex: 1 }}>
      <UserProvider>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </UserProvider>
    </View>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
