import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, Easing, Image, Button } from 'react-native';
import { Text, View } from '../../components/Themed';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import logo from "../../assets/images/logo.png";
import { isSameWeek, isSameYear, isSameMonth, parse } from 'date-fns';

export default function TabTwoScreen() {
  const { movies, setMovies, recommendedByGenre } = useUser(); // Usando os filmes do contexto

  const goalMovies = 365;
  const goalMoviesMonth = 30;
  const goalMoviesWeek = 7;

  const [totalMoviesWatchedThisYear, setTotalMoviesWatchedThisYear] = useState(0);
  const [totalMoviesWatchedThisMonth, setTotalMoviesWatchedThisMonth] = useState(0);
  const [totalMoviesWatchedThisWeek, setTotalMoviesWatchedThisWeek] = useState(0);
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
    setMovies([]);
  };

  const completionPercentage = Math.min((totalMoviesWatchedThisYear / goalMovies) * 100, 100);
  const completionPercentageMonth = Math.min((totalMoviesWatchedThisMonth / goalMoviesMonth) * 100, 100);
  const completionPercentageWeek = Math.min((totalMoviesWatchedThisWeek / goalMoviesWeek) * 100, 100);

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        <Text style={styles.title}>ESTATÍSTICAS</Text>
        <Text style={styles.subtitle}>Total de filmes assistidos este ano: {totalMoviesWatchedThisYear}</Text>
        {/* Barra de progresso ANO */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
        </View>
        <Text style={styles.progressBarMeta}>{totalMoviesWatchedThisYear}/365</Text>

        <Text style={styles.subtitle}>Total de filmes assistidos este mês: {totalMoviesWatchedThisMonth}</Text>
        {/* Barra de progresso MÊS */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${completionPercentageMonth}%` }]} />
        </View>
        <Text style={styles.progressBarMeta}>{totalMoviesWatchedThisMonth}/30</Text>

        <Text style={styles.subtitle}>Total de filmes assistidos esta semana: {totalMoviesWatchedThisWeek}</Text>
        {/* Barra de progresso SEMANA */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${completionPercentageWeek}%` }]} />
        </View>
        <Text style={styles.progressBarMeta}>{totalMoviesWatchedThisWeek}/7</Text>

        {/* Botão para redefinir os filmes */}
        <Button title="Redefinir Filmes" onPress={handleResetMovies} />
      </Animated.View>
    </View>
  );
}

function getTotalMoviesWatchedThisYear(movies: any[]) {
  const currentYear = new Date().getFullYear();
  return movies.reduce((count: number, movie: { date: string; }) => {
    const movieDate = parse(movie.date, 'dd/MM/yyyy', new Date()); // Convertendo para o formato correto
    return isSameYear(movieDate, new Date(currentYear, 0, 1)) ? count + 1 : count;
  }, 0);
}

function getTotalMoviesWatchedThisWeek(movies: any[]) {
  const now = new Date();
  return movies.reduce((count: number, movie: { date: string; }) => {
    const movieDate = parse(movie.date, 'dd/MM/yyyy', new Date()); // Convertendo para o formato correto
    return isSameWeek(movieDate, now) ? count + 1 : count;
  }, 0);
}

function getTotalMoviesWatchedThisMonth(movies: any[]) {
  const now = new Date();
  return movies.reduce((count: number, movie: { date: string; }) => {
    const movieDate = parse(movie.date, 'dd/MM/yyyy', new Date()); // Convertendo para o formato correto
    return isSameMonth(movieDate, now) ? count + 1 : count;
  }, 0);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
  },
  content: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
  },
  logo:{
    alignSelf: 'center',
    marginVertical: 16,
    width: 80, 
    height: 80, 
    marginBottom: 16,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 50,
  },
  progressBarContainer: {
    marginTop: 20,
    width: '80%',
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarMeta:{
    marginTop: 7,
    fontWeight: 'bold',
    fontSize: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50', 
    borderRadius: 10,
  },
});
