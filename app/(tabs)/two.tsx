import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, Easing, Image} from 'react-native';
import { Text, View } from '../../components/Themed';
import { getTotalMoviesWatchedThisYear, getTotalMoviesWatchedThisWeek, getTotalMoviesWatchedThisMonth } from './index';
import { useFocusEffect } from '@react-navigation/native';
import logo from "../../assets/images/logo.png";

export default function TabTwoScreen() {
  const goalMovies = 365;
  const goalMoviesMonth = 30;
  const goalMoviesWeek = 7;

  const [totalMoviesWatchedThisYear, setTotalMoviesWatchedThisYear] = useState(0);

  const [totalMoviesWatchedThisMonth, setTotalMoviesWatchedThisMonth] = useState(0);

  const [totalMoviesWatchedThisWeek, setTotalMoviesWatchedThisweek] = useState(0);
  const [fadeIn] = useState(new Animated.Value(0));

  useFocusEffect(
    React.useCallback(() => {
      const totalMoviesWatcheYear = getTotalMoviesWatchedThisYear();
      setTotalMoviesWatchedThisYear(totalMoviesWatcheYear);

      const totalMoviesWatchedWeek = getTotalMoviesWatchedThisWeek();
      setTotalMoviesWatchedThisweek(totalMoviesWatchedWeek);

      const totalMoviesWatchedMonth = getTotalMoviesWatchedThisMonth();
      setTotalMoviesWatchedThisMonth(totalMoviesWatchedMonth);

      // Efeito de fade-in
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();

      return () => {
      };
    }, [])
  );

  const completionPercentage = (totalMoviesWatchedThisYear / goalMovies) * 100;
  const completionPercentageMonth = (totalMoviesWatchedThisYear / goalMoviesMonth) * 100;
  const completionPercentageWeek = (totalMoviesWatchedThisYear / goalMoviesWeek) * 100;

  return (
    <View style={styles.container}>
    <Image source={logo} style={styles.logo} />
    <Animated.View style={[styles.content, { opacity: fadeIn }]}>
      <Text style={styles.title}>ESTATÍSTICAS</Text>
      <Text style={styles.subtitle}>Total de filmes assistidos este ano: {totalMoviesWatchedThisYear}</Text>

      {/* ANO */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
      </View>
      <View style={styles.progressBarMeta}>
        <Text style={styles.progressBarMeta}>{totalMoviesWatchedThisYear}/365</Text>
        </View>

        <Text style={styles.subtitle}>Total de filmes assistidos este mes: {totalMoviesWatchedThisMonth}</Text>

       {/* MES */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${completionPercentageMonth}%` }]} />
      </View>
      <View style={styles.progressBarMeta}>
        <Text style={styles.progressBarMeta}>{totalMoviesWatchedThisMonth}/30</Text>
        </View>

        <Text style={styles.subtitle}>Total de filmes assistidos esta semana: {totalMoviesWatchedThisWeek}</Text>

       {/* SEMANA */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${completionPercentageWeek}%` }]} />
      </View>
      <View style={styles.progressBarMeta}>
        <Text style={styles.progressBarMeta}>{totalMoviesWatchedThisWeek}/7</Text>
        </View>

    </Animated.View>
    </View>
  );
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
