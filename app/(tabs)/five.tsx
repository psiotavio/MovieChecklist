import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Animated,
  Easing,
  Image,
  Button,
  Switch,
  Text,
  View,
  TouchableOpacity,
  Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../../contexts/UserContext";
import logo from "../../assets/images/logo.png";
import { isSameWeek, isSameYear, isSameMonth, parse } from "date-fns";
import { useTheme } from "../../constants/temas/ThemeContext";
import { themes } from "../../constants/temas/ThemeColors";

export default function TabFiveScreen() {
  const { setMovies, setRecommendedMovies, setToWatchMovies } = useUser();
  const { theme, toggleTheme } = useTheme();
  const themeName = theme.background === themes.dark.background ? "dark" : "light";

 

  const handleResetMovies = () => {
    Alert.alert(
      "Redefinir Conta", // Título do Alerta
      "Você realmente quer redefinir sua conta e apagar todo conteúdo salvo?", // Mensagem do Alerta
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"), // Ação para o botão Cancelar
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: () => {
            // Aqui você chama as funções para redefinir a conta
            setRecommendedMovies([]);
            setMovies([]);
            setToWatchMovies([]);
            console.log("Conta redefinida");
          },
        },
      ],
      { cancelable: false } // Esta opção impede que o alerta seja fechado ao tocar fora dele
    );
  };
  

  

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={logo} style={styles.logo} />
      <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 24,marginVertical: 36 }}>AJUSTES</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.borderRed }]}
        onPress={handleResetMovies}
      >
        <Text style={{ color: theme.text, fontWeight: 'bold' }}>Redefinir Conta</Text>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
      <Text style={{ color: theme.text, fontWeight: 'bold' }}>Tema Escuro:</Text>
        <Switch
          trackColor={{ false: "red", true: theme.modalBackgroundSecondary }}
          thumbColor={themeName === "dark" ? theme.borderRed : theme.borderRed}
          onValueChange={toggleTheme}
          value={themeName === "dark"}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  switchContainer: {
    gap: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  container: {
    flex: 1,
    paddingTop: 56,
    alignItems: "center",
  },
  logo: {
    alignSelf: "center",
    marginVertical: 16,
    width: 80,
    height: 80,
    marginBottom: 16,
    resizeMode: "contain",
  },
  button: {
    padding: 10,
    borderRadius: 30,
    paddingHorizontal: 10,
    marginTop: 20,
  },
});
