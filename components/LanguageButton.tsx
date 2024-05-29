import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useConfiguration } from "../contexts/ConfigurationContext";
import { useTheme } from "../constants/temas/ThemeContext";

type Language = "english" | "portuguese" | "spanish" | "french" | "german" | "italian" | "chinese";

const translations = {
  english: {
    chooseLanguage: "Choose a Language:",
    english: "English",
    portuguese: "Portuguese",
    spanish: "Spanish",
    french: "French",
    german: "German",
    italian: "Italian",
    chinese: "Chinese",
  },
  portuguese: {
    chooseLanguage: "Escolha um Idioma:",
    english: "Inglês",
    portuguese: "Português",
    spanish: "Espanhol",
    french: "Francês",
    german: "Alemão",
    italian: "Italiano",
    chinese: "Chinês",
  },
  spanish: {
    chooseLanguage: "Elige un Idioma:",
    english: "Inglés",
    portuguese: "Portugués",
    spanish: "Español",
    french: "Francés",
    german: "Alemán",
    italian: "Italiano",
    chinese: "Chino",
  },
  french: {
    chooseLanguage: "Choisir une langue:",
    english: "Anglais",
    portuguese: "Portugais",
    spanish: "Espagnol",
    french: "Français",
    german: "Allemand",
    italian: "Italien",
    chinese: "Chinois",
  },
  german: {
    chooseLanguage: "Wählen Sie eine Sprache:",
    english: "Englisch",
    portuguese: "Portugiesisch",
    spanish: "Spanisch",
    french: "Französisch",
    german: "Deutsch",
    italian: "Italienisch",
    chinese: "Chinesisch",
  },
  italian: {
    chooseLanguage: "Scegli una lingua:",
    english: "Inglese",
    portuguese: "Portoghese",
    spanish: "Spagnolo",
    french: "Francese",
    german: "Tedesco",
    italian: "Italiano",
    chinese: "Cinese",
  },
  chinese: {
    chooseLanguage: "选择一种语言：",
    english: "英语",
    portuguese: "葡萄牙语",
    spanish: "西班牙语",
    french: "法语",
    german: "德语",
    italian: "意大利语",
    chinese: "中文",
  },
};

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const LanguageButton = () => {
  const { theme } = useTheme();

  const {language, setLanguage } = useConfiguration();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.languageButton, { backgroundColor: theme.borderRed }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: theme.text, fontWeight: "bold" }}>
        {translations[language].chooseLanguage} {translations[language][language]}
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
              {(["english", "portuguese", "spanish", "french", "german", "italian", "chinese"] as Language[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.dropdownItem,
                    { backgroundColor: theme.modalBackground },
                  ]}
                  onPress={() => {
                    setLanguage(lang);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.text, borderBottomColor: theme.borderRed },
                    ]}
                  >
                    {translations[language][lang]}
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  languageButton: {
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
    width: "80%",
    paddingVertical: 20,
    maxHeight: "60%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
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

export default LanguageButton;
