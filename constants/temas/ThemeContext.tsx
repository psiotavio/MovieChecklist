import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { themes, Theme } from './ThemeColors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode; // Define o tipo para as children
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    (async () => {
      const storedThemeName = await AsyncStorage.getItem('themeName');
      if (storedThemeName) {
        setThemeName(storedThemeName as 'light' | 'dark');
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const newThemeName = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newThemeName);
    await AsyncStorage.setItem('themeName', newThemeName);
  };

  const theme = themes[themeName];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar o tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};