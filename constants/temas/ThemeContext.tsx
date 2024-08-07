import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { themes, Theme } from "./ThemeColors";
import AsyncStorage from "@react-native-async-storage/async-storage";

//  'blue' | 'orange' | 'pink' | 'lightpink' | 'green' |  'red' |

export type ThemeName =
  | "light"
  | "dark"
  | "dune"
  | "cosmicDusk"
  | "lilacNebula"
  | "shadowOfMordor"
  | "darkSide"
  | "neonTwilight"
  | "dracula"
  | "bladeRunner"
  | "violetWitch"
  | "thanos"
  | "jediTemple"
  | "hungerGames"
  | "neoMatrix";

type ThemeContextType = {
  theme: Theme;
  setThemeName: (themeName: ThemeName) => void;
  themeName: ThemeName;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>("dark");

  useEffect(() => {
    (async () => {
      const storedThemeName = await AsyncStorage.getItem("themeName");
      if (
        storedThemeName &&
        [
          "light",
          "dark",
          // "blue",
          // "orange",
          // "pink",
          // "lightpink",
          // "green",
          // "red",
          "dune",
          "cosmicDusk",
          "lilacNebula",
          "shadowOfMordor",
          "darkSide",
          "neonTwilight",
          "dracula",
          "bladeRunner",
          "violetWitch",
          "thanos",
          "jediTemple",
          "hungerGames",
          "neoMatrix",
        ].includes(storedThemeName)
      ) {
        setThemeName(storedThemeName as ThemeName);
      }
    })();
  }, []);

  const theme = themes[themeName]; // Assegura que o tema é retirado do objeto de temas

  useEffect(() => {
    AsyncStorage.setItem("themeName", themeName);
  }, [themeName]);

  const value = { theme, setThemeName, themeName };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Hook para usar o tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
