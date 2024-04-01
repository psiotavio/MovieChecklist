import React from "react";
import { BottomNavigation } from "react-native-paper";
import { useTheme } from "../../constants/temas/ThemeContext";

import HomeScreen from ".";
import TabThreeScreen from "./three";
import TabFourScreen from "./four";
import TabTwoScreen from "./two";
import { StatusBar } from "expo-status-bar";

export default function TabLayout() {
  const { theme, themeName } = useTheme(); 
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: "home",
      title: "Início",
      focusedIcon: "home",
      unfocusedIcon: "home-outline",
    },
    {
      key: "recommendations",
      title: "Para você",
      focusedIcon: "movie",
      unfocusedIcon: "movie-outline",
    },
    {
      key: "lists",
      title: "Listas",
      focusedIcon: "format-list-bulleted",
      unfocusedIcon: "format-list-bulleted-square",
    },
    {
      key: "profile",
      title: "Perfil",
      focusedIcon: "account",
      unfocusedIcon: "account-outline",
    },
 
  ]);

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
