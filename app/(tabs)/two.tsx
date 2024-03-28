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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../../contexts/UserContext";
import logo from "../../assets/images/logo.png";
import { isSameWeek, isSameYear, isSameMonth, parse } from "date-fns";
import { useTheme } from "../../constants/temas/ThemeContext";
import { themes } from "../../constants/temas/ThemeColors";

export default function TabTwoScreen() {
  const { movies, setMovies, recommendedByGenre, setRecommendedMovies, setToWatchMovies } =
    useUser(); // Usando os filmes do contexto
    const { theme, toggleTheme } = useTheme();
    const themeName = theme.background === themes.dark.background ? 'dark' : 'light';

  const goalMovies = 365;
  const goalMoviesMonth = 30;
  const goalMoviesWeek = 7;

  const [totalMoviesWatchedThisYear, setTotalMoviesWatchedThisYear] =
    useState(0);
  const [totalMoviesWatchedThisMonth, setTotalMoviesWatchedThisMonth] =
    useState(0);
  const [totalMoviesWatchedThisWeek, setTotalMoviesWatchedThisWeek] =
    useState(0);
  const [fadeIn] = useState(new Animated.Value(0));

  useFocusEffect(
    React.useCallback(() => {
      // Atualiza os contadores baseados nos filmes do contexto
      setTotalMoviesWatchedThisYear(getTotalMoviesWatchedThisYear(movies));
      setTotalMoviesWatchedThisWeek(getTotalMoviesWatchedThisWeek(movies));
      setTotalMoviesWatchedThisMonth(getTotalMoviesWatchedThisMonth(movies));

      // Efeito de fade-in
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }, [movies])
  );

  const handleResetMovies = () => {
    setRecommendedMovies([]);
    setMovies([]);
    setToWatchMovies([]);
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={logo} style={styles.logo} />
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        <Text style={[styles.title, { color: theme.text }]}>ESTATÍSTICAS</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Total de filmes assistidos este ano: {totalMoviesWatchedThisYear}
        </Text>
        {/* Barra de progresso ANO */}
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${completionPercentage}%` , backgroundColor: theme.borderRed }]}
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
              { width: `${completionPercentageMonth}%`, backgroundColor: theme.borderRed },
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
              { width: `${completionPercentageWeek}%`, backgroundColor: theme.borderRed },
            ]}
          />
        </View>
        <Text style={[styles.progressBarMeta, { color: theme.text }]}>
          {totalMoviesWatchedThisWeek}/7
        </Text>

        {/* Botão para redefinir os filmes */}
        <Button title="Redefinir Filmes" onPress={handleResetMovies} />

        <View style={styles.switchContainer}>
          <Switch
            trackColor={{ false: "red", true: theme.modalBackgroundSecondary }}
            thumbColor={themeName === "dark" ? theme.borderRed : theme.borderRed}
            onValueChange={toggleTheme}
            value={themeName === "dark"}
          />
        </View>
      </Animated.View>
    </View>
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  container: {
    flex: 1,
    paddingTop: 56,
  },
  content: {
    flex: 1,
    paddingTop: 30,
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
});
