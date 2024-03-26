import React from "react";
import { BottomNavigation } from "react-native-paper";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTheme } from "../../constants/temas/ThemeContext";

import HomeScreen from ".";
import TabThreeScreen from "./three";
import TabFourScreen from "./four";
import TabTwoScreen from "./two";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} {...props} />;
}

export default function TabLayout() {
  const { theme } = useTheme();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'home',
      title: 'Home',
      focusedIcon: 'home',
      unfocusedIcon: 'home-outline',
      color: theme.text,
    },
    {
      key: 'recommendations',
      title: 'Recomendações',
      focusedIcon: 'movie',
      unfocusedIcon: 'movie-outline',
      color: theme.text,
    },
    {
      key: 'lists',
      title: 'Listas',
      focusedIcon: 'format-list-bulleted',
      unfocusedIcon: 'format-list-bulleted-square',
      color: theme.text,
    },
    {
      key: 'profile',
      title: 'Perfil',
      focusedIcon: 'account',
      unfocusedIcon: 'account-outline',
      color: theme.text,
    },
  ]);
  

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    recommendations: TabFourScreen,
    lists: TabThreeScreen,
    profile: TabTwoScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      activeIndicatorStyle={{ backgroundColor: theme.borderRed }}
      activeColor={theme.text}
      inactiveColor={theme.text}
      barStyle={{ backgroundColor: theme.background }}
    />
  );
}
