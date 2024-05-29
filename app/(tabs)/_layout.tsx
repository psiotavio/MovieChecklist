import React, { useEffect, useState } from "react";
import { BottomNavigation } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useConfiguration } from "../../contexts/ConfigurationContext";
import { useTheme } from "../../constants/temas/ThemeContext";

import HomeScreen from ".";
import TabThreeScreen from "./three";
import TabFourScreen from "./four";
import TabTwoScreen from "./two";

type Route = {
  key: string;
  title: string;
  focusedIcon: string;
  unfocusedIcon: string;
};

export default function TabLayout() {
  const { language } = useConfiguration();
  const { theme, themeName } = useTheme(); 
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([
    { key: "home", title: "Loading...", focusedIcon: "home", unfocusedIcon: "home-outline" },
    { key: "recommendations", title: "Loading...", focusedIcon: "movie", unfocusedIcon: "movie-outline" },
    { key: "lists", title: "Loading...", focusedIcon: "format-list-bulleted", unfocusedIcon: "format-list-bulleted-square" },
    { key: "profile", title: "Loading...", focusedIcon: "account", unfocusedIcon: "account-outline" },
  ]);
  useEffect(() => {
    const translations = {
      english: { inicio: "Home", Listas: "Lists", Paravoce: "For You", Perfil: "Profile" },
      portuguese: { inicio: "Início", Listas: "Listas", Paravoce: "Para você", Perfil: "Perfil" },
      spanish: { inicio: "Inicio", Listas: "Listas", Paravoce: "Para ti", Perfil: "Perfil" },
      french: { inicio: "Accueil", Listas: "Listes", Paravoce: "Pour vous", Perfil: "Profil" },
      german: { inicio: "Startseite", Listas: "Listen", Paravoce: "Für Sie", Perfil: "Profil" },
      italian: { inicio: "Home", Listas: "Liste", Paravoce: "Per te", Perfil: "Profilo" },
      chinese: { inicio: "首页", Listas: "列表", Paravoce: "为你推荐", Perfil: "个人资料" },
    };

    setRoutes([
      { key: "home", title: translations[language].inicio, focusedIcon: "home", unfocusedIcon: "home-outline" },
      { key: "recommendations", title: translations[language].Paravoce, focusedIcon: "movie", unfocusedIcon: "movie-outline" },
      { key: "lists", title: translations[language].Listas, focusedIcon: "format-list-bulleted", unfocusedIcon: "format-list-bulleted-square" },
      { key: "profile", title: translations[language].Perfil, focusedIcon: "account", unfocusedIcon: "account-outline" },
    ]);
  }, [language]);  // Dependência do useEffect

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    recommendations: TabThreeScreen,
    lists: TabFourScreen,
    profile: TabTwoScreen,
  });

  const statusBarStyle = themeName === 'dark' ? 'light' : 'dark';

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        activeIndicatorStyle={{ backgroundColor: theme.borderRed }}
        activeColor={theme.text}
        inactiveColor={theme.text}
        barStyle={{ backgroundColor: theme.modalBackground }}
      />
    </>
  );
}
