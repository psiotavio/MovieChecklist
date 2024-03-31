import React, { useState } from "react";
import {
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../../contexts/UserContext";
import logo from "../../assets/images/logo.png";
import { isSameWeek, isSameYear, isSameMonth, parse } from "date-fns";
import { useTheme } from "../../constants/temas/ThemeContext";
import { themes } from "../../constants/temas/ThemeColors";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function TabTwoScreen() {
  const {
    movies,
    setMovies,
    recommendedByGenre,
    setRecommendedMovies,
    setToWatchMovies,
  } = useUser();
  const { theme, toggleTheme } = useTheme();
  const themeName =
    theme.background === themes.dark.background ? "dark" : "light";

  const goalMovies = 365;
  const goalMoviesMonth = 30;
  const goalMoviesWeek = 7;

  const [totalMoviesWatchedThisYear, setTotalMoviesWatchedThisYear] = useState(0);
  const [totalMoviesWatchedThisMonth, setTotalMoviesWatchedThisMonth] = useState(0);
  const [totalMoviesWatchedThisWeek, setTotalMoviesWatchedThisWeek] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setTotalMoviesWatchedThisYear(getTotalMoviesWatchedThisYear(movies));
      setTotalMoviesWatchedThisWeek(getTotalMoviesWatchedThisWeek(movies));
      setTotalMoviesWatchedThisMonth(getTotalMoviesWatchedThisMonth(movies));
    }, [movies])
  );

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

  const completionPercentage = Math.min(
    (totalMoviesWatchedThisYear / goalMovies) * 100,
    100
  );
  const completionPercentageMonth = Math.min(
    (totalMoviesWatchedThisMonth / goalMoviesMonth) * 100,
    100
  );
  const completionPercentageWeek = Math.min(
    (totalMoviesWatchedThisWeek / goalMoviesWeek) * 100,
    100
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background}]}>
      <Image source={logo} style={styles.logo} />
      <ScrollView style={styles.contentScroll}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            ESTATÍSTICAS
          </Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Total de filmes assistidos este ano: {totalMoviesWatchedThisYear}
          </Text>
          {/* Barra de progresso ANO */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${completionPercentage}%`,
                  backgroundColor: theme.borderRed,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressBarMeta, { color: theme.text }]}>
            {totalMoviesWatchedThisYear}/365
          </Text>

          <Text style={[styles.subtitle, { color: theme.text }]}>
            Total de filmes assistidos este mês: {totalMoviesWatchedThisMonth}
          </Text>
          {/* Barra de progresso MÊS */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${completionPercentageMonth}%`,
                  backgroundColor: theme.borderRed,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressBarMeta, { color: theme.text }]}>
            {totalMoviesWatchedThisMonth}/30
          </Text>

          <Text style={[styles.subtitle, { color: theme.text }]}>
            Total de filmes assistidos esta semana: {totalMoviesWatchedThisWeek}
          </Text>
          {/* Barra de progresso SEMANA */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${completionPercentageWeek}%`,
                  backgroundColor: theme.borderRed,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressBarMeta, { color: theme.text }]}>
            {totalMoviesWatchedThisWeek}/7
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.borderRed }]}
              onPress={handleResetMovies}
            >
              <Text style={{ color: theme.text, fontWeight: "bold" }}>
                Redefinir Conta
              </Text>
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "bold",
                  marginRight: 10,
                }}
              >
                Tema Escuro:
              </Text>
              <Switch
                trackColor={{
                  false: "red",
                  true: theme.modalBackgroundSecondary,
                }}
                thumbColor={
                  themeName === "dark" ? theme.borderRed : theme.borderRed
                }
                onValueChange={toggleTheme}
                value={themeName === "dark"}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTotalMoviesWatchedThisYear(movies: any[]) {
  const currentYear = new Date().getFullYear();
  return movies.reduce((count: number, movie: { date: string }) => {
    const movieDate = parse(movie.date, "dd/MM/yyyy", new Date()); // Convertendo para o formato correto
    return isSameYear(movieDate, new Date(currentYear, 0, 1))
      ? count + 1
      : count;
  }, 0);
}

function getTotalMoviesWatchedThisWeek(movies: any[]) {
  const now = new Date();
  return movies.reduce((count: number, movie: { date: string }) => {
    const movieDate = parse(movie.date, "dd/MM/yyyy", new Date()); // Convertendo para o formato correto
    return isSameWeek(movieDate, now) ? count + 1 : count;
  }, 0);
}

function getTotalMoviesWatchedThisMonth(movies: any[]) {
  const now = new Date();
  return movies.reduce((count: number, movie: { date: string }) => {
    const movieDate = parse(movie.date, "dd/MM/yyyy", new Date()); // Convertendo para o formato correto
    return isSameMonth(movieDate, now) ? count + 1 : count;
  }, 0);
}

const styles = StyleSheet.create({
  buttonsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 60,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  container: {
  },
  content: {
    paddingTop: 30,
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    display: "flex",
  },
  contentScroll: {
  },
  logo: {
    marginBottom: 30,
    alignSelf: "center",
    marginVertical: 10,
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 50,
  },
  progressBarContainer: {
    marginTop: 20,
    width: "80%",
    height: 20,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarMeta: {
    marginTop: 7,
    fontWeight: "bold",
    fontSize: 24,
  },
  progressBar: {
    height: "100%",
    borderRadius: 10,
  },
  button: {
    padding: 10,
    borderRadius: 30,
    paddingHorizontal: 10,
    marginTop: 20,
  },
});
