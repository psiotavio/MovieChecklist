import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'english' | 'portuguese' | 'spanish' | 'french' | 'german';

interface ConfigurationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const defaultState = {
  language: 'portuguese' as Language,
  setLanguage: () => {}
};

const ConfigurationContext = createContext<ConfigurationContextType>(defaultState);

export const useConfiguration = () => useContext(ConfigurationContext);

interface ConfigurationProviderProps {
  children: ReactNode;
}

export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('english');

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        setLanguage(storedLanguage as Language);
      }
    };

    loadLanguage();
  }, []);

  const handleSetLanguage = async (language: Language) => {
    await AsyncStorage.setItem('language', language);
    setLanguage(language);
  };

  return (
    <ConfigurationContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </ConfigurationContext.Provider>
  );
};
