import React, { useState } from "react";
import {
  View,
  Button,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useConfiguration } from "../contexts/ConfigurationContext";
import { useTheme } from "../constants/temas/ThemeContext";

type Language = "english" | "portuguese" | "spanish" | "french" | "german"; // Assegure-se de que este tipo seja importado ou definido aqui se não estiver já

const translations = {
  english: {
    chooseLanguage: "Choose a Language:",
  },
  portuguese: {
    chooseLanguage: "Escolha um Idioma:",
  },
  spanish: {
    chooseLanguage: "Elige un Idioma:",
  },
  french: {
    chooseLanguage: "Choisir une langue:",
  },
  german: {
    chooseLanguage: "Wählen Sie eine Sprache:",
  },
};

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const LanguageButton = () => {
  const { theme } = useTheme();

  const { language, setLanguage } = useConfiguration();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.languageButton, { backgroundColor: theme.borderRed }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: theme.text, fontWeight: "bold" }}>
        {translations[language].chooseLanguage} {capitalizeFirstLetter(language)}
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
              {(
                [
                  "english",
                  "portuguese",
                  "spanish",
                  "french",
                  "german",
                ] as Language[]
              ).map((lang) => (
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
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Add semi-transparent background
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  dropdown: {
    width: "80%",
    padding: 20,
    maxHeight: "60%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
  },
  dropdownItem: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0,0,0,0.2)",
  },
  dropdownItemText: {
    textAlign: "center",
    fontSize: 18,
  },
});

export default LanguageButton;
