import React from "react";
import { BottomNavigation } from "react-native-paper";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTheme } from "../../constants/temas/ThemeContext";

import HomeScreen from ".";
import TabThreeScreen from "./three";
import TabFourScreen from "./four";
import TabTwoScreen from "./two";
import TabFiveScreen from "./five";



export default function TabLayout() {
  const { theme } = useTheme();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'home',
      title: 'Início',
      focusedIcon: 'home',
      unfocusedIcon: 'home-outline',
    },
    {
      
      key: 'recommendations',
      title: 'Recomendados',
      focusedIcon: 'movie',
      unfocusedIcon: 'movie-outline',
    },
    {
      key: 'lists',
      title: 'Listas',
      focusedIcon: 'format-list-bulleted',
      unfocusedIcon: 'format-list-bulleted-square',
    },
    {
      key: 'profile',
      title: 'Perfil',
      focusedIcon: 'account',
      unfocusedIcon: 'account-outline',
    },
    // {
    //   key: 'cog',
    //   title: 'Ajustes',
    //   focusedIcon: 'cog',
    //   unfocusedIcon: 'cog-outline',
    // },
  ]);
  

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    recommendations: TabThreeScreen,
    lists: TabFourScreen,
    profile: TabTwoScreen,
    // cog: TabFiveScreen
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      activeIndicatorStyle={{ backgroundColor: theme.borderRed }}
      activeColor={theme.text}
      inactiveColor={theme.text}
      barStyle={{ backgroundColor: theme.modalBackground}}
    />
  );
}
