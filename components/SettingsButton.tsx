import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/temas/ThemeContext";

interface SettingsButtonProps {
  onPress: () => void; // Definição do tipo para a função onPress
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onPress }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsButton}>
      <Ionicons name="cog" size={35} color={theme.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    padding: 10,
  },
});

export default SettingsButton;
