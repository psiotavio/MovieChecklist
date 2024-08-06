import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme, ThemeName } from "../constants/temas/ThemeContext"; // Ajuste o caminho conforme necessário
import { useConfiguration } from "../contexts/ConfigurationContext";

const ThemeButton = () => {
  const { theme, setThemeName, themeName } = useTheme(); // Obter também o nome do tema atual

  const [modalVisible, setModalVisible] = useState(false);

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const { language } = useConfiguration();

  const translations = {
    english: {
      changeTheme: "Change Theme",
      light: "Light",
      dark: "Dark",
      green: "Green",
      blue: "Blue",
      orange: "Orange",
      pink: "Pink",
      lightpink: "Light Pink",
      red: "Red",
      dune: "Dune",
      cosmicDusk: "Cosmic Dusk",
      lilacNebula: "Lilac Nebula",
      shadowOfMordor: "Shadow of Mordor",
      darkSide: "Dark Side",
      neonTwilight: "Neon Twilight",
      dracula: "Dracula",
      bladeRunner: "Blade Runner",
      violetWitch: "Violet Witch",
      thanos: "Thanos",
      jediTemple: "Jedi Temple",
      hungerGames: "Hunger Games",
      neoMatrix: "Neo Matrix"
    },
    portuguese: {
      changeTheme: "Mudar Tema",
      light: "Claro",
      dark: "Escuro",
      green: "Verde",
      blue: "Azul",
      orange: "Laranja",
      pink: "Rosa",
      lightpink: "Rosa Claro",
      red: "Vermelho",
      dune: "Duna",
      cosmicDusk: "Poeira Cósmica",
      lilacNebula: "Nébula Lilás",
      shadowOfMordor: "Sombra de Mordor",
      darkSide: "Lado Sombrio",
      neonTwilight: "Crepúsculo Neon",
      dracula: "Drácula",
      bladeRunner: "Blade Runner",
      violetWitch: "Bruxa Violeta",
      thanos: "Thanos",
      jediTemple: "Templo Jedi",
      hungerGames: "Jogos Vorazes",
      neoMatrix: "Neo Matrix"
    },
    spanish: {
      changeTheme: "Cambiar Tema",
      light: "Claro",
      dark: "Oscuro",
      green: "Verde",
      blue: "Azul",
      orange: "Naranja",
      pink: "Rosa",
      lightpink: "Rosa Claro",
      red: "Rojo",
      dune: "Dune",
      cosmicDusk: "Crepúsculo Cósmico",
      lilacNebula: "Nébula Lila",
      shadowOfMordor: "Sombra de Mordor",
      darkSide: "Lado Oscuro",
      neonTwilight: "Crepúsculo Neón",
      dracula: "Drácula",
      bladeRunner: "Blade Runner",
      violetWitch: "Bruja Violeta",
      thanos: "Thanos",
      jediTemple: "Templo Jedi",
      hungerGames: "Juegos del Hambre",
      neoMatrix: "Neo Matrix"
    },
    french: {
      changeTheme: "Changer le thème",
      light: "Clair",
      dark: "Sombre",
      green: "Vert",
      blue: "Bleu",
      orange: "Orange",
      pink: "Rose",
      lightpink: "Rose Clair",
      red: "Rouge",
      dune: "Dune",
      cosmicDusk: "Crépuscule Cosmique",
      lilacNebula: "Nébuleuse Lilas",
      shadowOfMordor: "Ombre de Mordor",
      darkSide: "Côté Obscur",
      neonTwilight: "Crépuscule Néon",
      dracula: "Dracula",
      bladeRunner: "Blade Runner",
      violetWitch: "Sorcière Violette",
      thanos: "Thanos",
      jediTemple: "Temple Jedi",
      hungerGames: "Hunger Games",
      neoMatrix: "Neo Matrix"
    },
    german: {
      changeTheme: "Thema wechseln",
      light: "Hell",
      dark: "Dunkel",
      green: "Grün",
      blue: "Blau",
      orange: "Orange",
      pink: "Rosa",
      lightpink: "Hellrosa",
      red: "Rot",
      dune: "Dune",
      cosmicDusk: "Kosmisches Dämmerlicht",
      lilacNebula: "Lilane Nebel",
      shadowOfMordor: "Schatten von Mordor",
      darkSide: "Dunkle Seite",
      neonTwilight: "Neon Dämmerung",
      dracula: "Dracula",
      bladeRunner: "Blade Runner",
      violetWitch: "Violette Hexe",
      thanos: "Thanos",
      jediTemple: "Jedi-Tempel",
      hungerGames: "Die Tribute von Panem",
      neoMatrix: "Neo Matrix"
    },
    italian: {
      changeTheme: "Cambia tema",
      light: "Chiaro",
      dark: "Scuro",
      green: "Verde",
      blue: "Blu",
      orange: "Arancione",
      pink: "Rosa",
      lightpink: "Rosa Chiaro",
      red: "Rosso",
      dune: "Dune",
      cosmicDusk: "Crepuscolo Cosmico",
      lilacNebula: "Nebulosa Lilla",
      shadowOfMordor: "Ombra di Mordor",
      darkSide: "Lato Oscuro",
      neonTwilight: "Crepuscolo Neon",
      dracula: "Dracula",
      bladeRunner: "Blade Runner",
      violetWitch: "Strega Violetta",
      thanos: "Thanos",
      jediTemple: "Tempio Jedi",
      hungerGames: "Hunger Games",
      neoMatrix: "Neo Matrix"
    },
    chinese: {
      changeTheme: "变更主题",
      light: "明亮",
      dark: "黑暗",
      green: "绿色",
      blue: "蓝色",
      orange: "橙色",
      pink: "粉色",
      lightpink: "浅粉色",
      red: "红色",
      dune: "沙丘",
      cosmicDusk: "宇宙黄昏",
      lilacNebula: "紫丁香星云",
      shadowOfMordor: "魔多之影",
      darkSide: "黑暗面",
      neonTwilight: "霓虹黄昏",
      dracula: "德古拉",
      bladeRunner: "银翼杀手",
      violetWitch: "紫色巫婆",
      thanos: "灭霸",
      jediTemple: "绝地圣殿",
      hungerGames: "饥饿游戏",
      neoMatrix: "黑客帝国"
    },
  };

  const themeNames: ThemeName[] = [
    "light",
    "dark",
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
  ];

  return (
    <View>
      <TouchableOpacity
      key={1}
        style={[styles.themeButton, { backgroundColor: theme.borderRed }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: theme.text, fontWeight: "bold" }}>
          {`${translations[language].changeTheme}: ${translations[language][themeName]}`}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
        key={2}
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: theme.modalBackground,
                borderColor: theme.borderRed,
              },
            ]}
          >
            <ScrollView>
              {themeNames.map((themeName) => (
                <TouchableOpacity
                  key={themeName}
                  style={[
                    styles.dropdownItem,
                    { backgroundColor: theme.modalBackground },
                  ]}
                  onPress={() => {
                    setThemeName(themeName);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.text, borderBottomColor: theme.borderRed },
                    ]}
                  >
                    {capitalizeFirstLetter(translations[language][themeName])}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  themeButton: {
    textAlign: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 30,
    paddingHorizontal: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdown: {
    height: '50%',
    padding: 20,
    width: "80%",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#DDD", // Placeholder border color
    backgroundColor: "#FFF", // Placeholder background color
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 2.5,
    borderBottomColor: "rgba(0,0,0,0.2)",
  },
  dropdownItemText: {
    textAlign: "center",
    fontSize: 18,
  },
});

export default ThemeButton;
