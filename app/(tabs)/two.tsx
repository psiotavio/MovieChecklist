import React, { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";

const anuncio = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});

export default function TabTwoScreen() {

 // ANUNCIOS
 const [interstitialLoaded, setInterstitialLoaded] = useState(false);

 const loadInterstitial = () => {
   const unscubscribeLoaded = anuncio.addAdEventListener(
     AdEventType.LOADED,
     () => {
       console.log("Anúncio carregado.");
       setInterstitialLoaded(true);
     }
   );

   const unscubscribeClosed = anuncio.addAdEventListener(
     AdEventType.CLOSED,
     () => {
       console.log("Anúncio fechado.");
       setInterstitialLoaded(false);
       anuncio.load();
     }
   );

   anuncio.load();

   return () => {
     unscubscribeClosed();
     unscubscribeLoaded();
   };
 };

 useEffect(() => {
   const unsubscribeInterstitialEvents = loadInterstitial();
   return unsubscribeInterstitialEvents;
 }, []);

  
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

  const [totalMoviesWatchedThisYear, setTotalMoviesWatchedThisYear] =
    useState(0);
  const [totalMoviesWatchedThisMonth, setTotalMoviesWatchedThisMonth] =
    useState(0);
  const [totalMoviesWatchedThisWeek, setTotalMoviesWatchedThisWeek] =
    useState(0);

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

            setTimeout(() => {
              if (interstitialLoaded) {
                anuncio.show().then(() => {
                  console.log("Anúncio foi exibido.");
                  // Recarregar o anúncio para a próxima exibição
                  anuncio.load();
                }).catch((error) => {
                  console.error("Erro ao tentar exibir o anúncio: ", error);
                });
                // Resetar o estado de carregamento do anúncio
                setInterstitialLoaded(false);
              }
            }, 1000); // 2000 milissegundos = 2 segundos

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
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Image source={logo} style={styles.logo} />

      <Text style={[styles.title, { color: theme.text }]}>ESTATÍSTICAS</Text>
      <ScrollView style={styles.contentScroll}>
        <View style={styles.contentAligner}>
          <View style={styles.content}>
            <View style={styles.progessBars}>
              <View style={styles.progessBarStyle}>
                <Text style={[styles.subtitle, { color: theme.text }]}>
                  Total de filmes assistidos este ano:{" "}
                  {totalMoviesWatchedThisYear}
                </Text>
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
              </View>

              <View style={styles.progessBarStyle}>
                <Text style={[styles.subtitle, { color: theme.text }]}>
                  Total de filmes assistidos este mês:{" "}
                  {totalMoviesWatchedThisMonth}
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
              </View>

              <View style={styles.progessBarStyle}>
                <Text style={[styles.subtitle, { color: theme.text }]}>
                  Total de filmes assistidos esta semana:{" "}
                  {totalMoviesWatchedThisWeek}
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
              </View>
            </View>

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
    padding: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    height: "100%",
  },

  contentAligner: {
    flex: 1, // Isso permite que o View cresça para ocupar o espaço disponível
    justifyContent: "center", // Centraliza os itens internos do content verticalmente se eles não ocuparem todo o espaço
    alignItems: "center", // Isso centraliza o conteúdo horizontalmente
    padding: 10, // Mantém um padding para o conteúdo não tocar nas bordas
    minHeight: '100%'
  },

  content: {
    padding: 20,
    minHeight: '100%',
    width: "100%", // Você pode ajustar essa largura conforme necessário
    alignItems: "center", // Garante que o conteúdo interno esteja alinhado ao centro
    justifyContent: "space-between", // Centraliza os itens internos do content verticalmente se eles não ocuparem todo o espaço
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
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  progessBarStyle: {
    alignSelf: "center",
    alignItems: "center",
    width: "100%",
  },
  progessBars: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignSelf: "center",
    alignItems: "center",
    width: "100%",
    minHeight: '70%',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
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
  },
});
