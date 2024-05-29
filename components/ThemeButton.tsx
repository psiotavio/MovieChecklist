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
        "english": {
          "changeTheme": "Change Theme",
          "light": "Light",
          "dark": "Dark",
          "green": "Green",
          "blue": "Blue",
          "orange": "Orange",
          "pink": "Pink",
          "lightpink": "Light Pink",
          "red": "Red",
          "deepPurple": "Deep Purple"
        },
        "portuguese": {
          "changeTheme": "Mudar Tema",
          "light": "Claro",
          "dark": "Escuro",
          "green": "Verde",
          "blue": "Azul",
          "orange": "Laranja",
          "pink": "Rosa",
          "lightpink": "Rosa Claro",
          "red": "Vermelho",
          "deepPurple": "Roxo Profundo"
        },
        "spanish": {
          "changeTheme": "Cambiar Tema",
          "light": "Claro",
          "dark": "Oscuro",
          "green": "Verde",
          "blue": "Azul",
          "orange": "Naranja",
          "pink": "Rosa",
          "lightpink": "Rosa Claro",
          "red": "Rojo",
          "deepPurple": "Púrpura Profundo"
        },
        "french": {
          "changeTheme": "Changer le thème",
          "light": "Clair",
          "dark": "Sombre",
          "green": "Vert",
          "blue": "Bleu",
          "orange": "Orange",
          "pink": "Rose",
          "lightpink": "Rose Clair",
          "red": "Rouge",
          "deepPurple": "Violet Profond"
        },
        "german": {
          "changeTheme": "Thema wechseln",
          "light": "Hell",
          "dark": "Dunkel",
          "green": "Grün",
          "blue": "Blau",
          "orange": "Orange",
          "pink": "Rosa",
          "lightpink": "Hellrosa",
          "red": "Rot",
          "deepPurple": "Tiefviolett"
        },
        "italian": {
          "changeTheme": "Cambia tema",
          "light": "Chiaro",
          "dark": "Scuro",
          "green": "Verde",
          "blue": "Blu",
          "orange": "Arancione",
          "pink": "Rosa",
          "lightpink": "Rosa Chiaro",
          "red": "Rosso",
          "deepPurple": "Viola Profondo"
        },
        "chinese": {
          "changeTheme": "变更主题",
          "light": "明亮",
          "dark": "黑暗",
          "green": "绿色",
          "blue": "蓝色",
          "orange": "橙色",
          "pink": "粉色",
          "lightpink": "浅粉色",
          "red": "红色",
          "deepPurple": "深紫色"
        }
  };

  const themeNames: ThemeName[] = ['light', 'dark', 'blue', 'orange', 'pink', 'lightpink', 'green', 'deepPurple', 'red'];

  return (
    <View>
      <TouchableOpacity
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
                  <Text style={[
                      styles.dropdownItemText,
                      { color: theme.text, borderBottomColor: theme.borderRed },
                    ]}>
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
    paddingVertical: 17,
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