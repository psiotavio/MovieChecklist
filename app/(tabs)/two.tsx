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
  Button,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../../contexts/UserContext";
import logo from "../../assets/images/logo.png";
import { isSameWeek, isSameYear, isSameMonth, parse } from "date-fns";
import { useTheme } from "../../constants/temas/ThemeContext";
import { themes } from "../../constants/temas/ThemeColors";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackgroundImage } from "@rneui/base";
import { useConfiguration } from "../../contexts/ConfigurationContext";
import LanguageButton from "../../components/LanguageButton";
import SettingsButton from "../../components/SettingsButton";

// import {
//   AdEventType,
//   InterstitialAd,
//   TestIds,
// } from "react-native-google-mobile-ads";

// const anuncio = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
//   requestNonPersonalizedAdsOnly: true,
// });

export default function TabTwoScreen() {
  //  // ANUNCIOS
  //  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  //  const loadInterstitial = () => {
  //    const unscubscribeLoaded = anuncio.addAdEventListener(
  //      AdEventType.LOADED,
  //      () => {
  //        setInterstitialLoaded(true);
  //      }
  //    );

  //    const unscubscribeClosed = anuncio.addAdEventListener(
  //      AdEventType.CLOSED,
  //      () => {
  //        setInterstitialLoaded(false);
  //        anuncio.load();
  //      }
  //    );

  //    anuncio.load();

  //    return () => {
  //      unscubscribeClosed();
  //      unscubscribeLoaded();
  //    };
  //  };

  //  useEffect(() => {
  //    const unsubscribeInterstitialEvents = loadInterstitial();
  //    return unsubscribeInterstitialEvents;
  //  }, []);

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
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: () => {
            // Aqui você chama as funções para redefinir a conta

            // setTimeout(() => {
            //   if (interstitialLoaded) {
            //     anuncio.show().then(() => {
            //       // Recarregar o anúncio para a próxima exibição
            //       anuncio.load();
            //     }).catch((error) => {
            //       console.error("Erro ao tentar exibir o anúncio: ", error);
            //     });
            //     // Resetar o estado de carregamento do anúncio
            //     setInterstitialLoaded(false);
            //   }
            // }, 1000); // 2000 milissegundos = 2 segundos

            setRecommendedMovies([]);
            setMovies([]);
            setToWatchMovies([]);
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

  const { language } = useConfiguration();

  const translations = {
    english: {
      ESTATÍSTICAS: "STATISTICS",
      Year: "Total movies watched this year:",
      Month: "Total movies watched this month:",
      Week: "Total movies watched this week:",
      redefinir: "Reset Account",
      tema: "Dark Theme",
      voltar: "Back"
    },
    portuguese: {
      ESTATÍSTICAS: "ESTATÍSTICAS",
      Year: "Total de filmes assistidos este ano:",
      Month: "Total de filmes assistidos este ano:",
      Week: "Total de filmes assistidos esta semana:",
      redefinir: "Redefinir Conta",
      tema: "Tema Escuro",
      voltar: "Voltar"
    },
    spanish: {
      ESTATÍSTICAS: "ESTADÍSTICAS",
      Year: "Total de películas vistas este año:",
      Month: "Total de películas vistas este mes:",
      Week: "Total de películas vistas esta semana:",
      redefinir: "Restablecer Cuenta",
      tema: "Tema Oscuro",
      voltar: "Volver"
    },
    french: {
      ESTATÍSTICAS: "STATISTIQUES",
      Year: "Total de films regardés cette année:",
      Month: "Total de films regardés ce mois-ci:",
      Week: "Total de films regardés cette semaine:",
      redefinir: "Réinitialiser le Compte",
      tema: "Thème Sombre",
      voltar: "Retour"
    },
    german: {
      ESTATÍSTICAS: "STATISTIKEN",
      Year: "Gesamtzahl der in diesem Jahr gesehenen Film:",
      Month: "Gesamtzahl der in diesem Monat gesehenen Film:",
      Week: "Gesamtzahl der in dieser Woche gesehenen Film:",
      redefinir: "Konto zurücksetzen",
      tema: "Dunkles Thema",
      voltar: "Zurück"
    },
  };

  const [activeTab, setActiveTab] = useState("configuration"); // 'ratedMovies' ou 'toWatchMovies'

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Image source={logo} style={styles.logo} />

      {activeTab === "configuration" ? (
        <View style={styles.StatsPage}>
          <Text style={[styles.title, { color: theme.text }]}>
            {translations[language].ESTATÍSTICAS}
          </Text>
          <View style={styles.fullcontainer}>
            <ScrollView style={styles.contentScroll}>
              <View style={styles.contentAligner}>
                <View style={styles.content}>
                  <View style={styles.progessBars}>
                    <View style={styles.progessBarStyle}>
                      <Text style={[styles.subtitle, { color: theme.text }]}>
                        {translations[language].Year}{" "}
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
                      <Text
                        style={[styles.progressBarMeta, { color: theme.text }]}
                      >
                        {totalMoviesWatchedThisYear}/365
                      </Text>
                    </View>

                    <View style={styles.progessBarStyle}>
                      <Text style={[styles.subtitle, { color: theme.text }]}>
                        {translations[language].Month}{" "}
                        {totalMoviesWatchedThisMonth}
                      </Text>
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
                      <Text
                        style={[styles.progressBarMeta, { color: theme.text }]}
                      >
                        {totalMoviesWatchedThisMonth}/30
                      </Text>
                    </View>

                    <View style={styles.progessBarStyle}>
                      <Text style={[styles.subtitle, { color: theme.text }]}>
                        {translations[language].Week}{" "}
                        {totalMoviesWatchedThisWeek}
                      </Text>
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
                      <Text
                        style={[styles.progressBarMeta, { color: theme.text }]}
                      >
                        {totalMoviesWatchedThisWeek}/7
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
          <View style={styles.settingsContainer}>
            <SettingsButton
              onPress={() =>
                setActiveTab(
                  activeTab === "configuration" ? "stats" : "configuration"
                )
              }
            />
          </View>
        </View>
      ) : (
        <View style={styles.settingsPage}>
          <LanguageButton />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.borderRed }]}
            onPress={handleResetMovies}
          >
            <Text style={{ color: theme.text, fontWeight: "bold" }}>
            {translations[language].redefinir}
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
              {translations[language].tema}
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

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.borderRed }]}
            onPress={() =>
              setActiveTab(
                activeTab === "configuration" ? "stats" : "configuration"
              )
            }
          >
            <Text style={{ color: theme.text, fontWeight: "bold" }}>
            {translations[language].voltar}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  settingsPage: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    width: "70%",
  },
  StatsPage: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    width: "100%",
  },

  settingsContainer: {
    position: "absolute",
    top: -100,
    right: 30
  },

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
    alignItems: "center",
    justifyContent: "flex-start",
  },

  contentAligner: {
    justifyContent: "center", // Centraliza os itens internos do content verticalmente se eles não ocuparem todo o espaço
    alignItems: "center", // Isso centraliza o conteúdo horizontalmente
    padding: 10, // Mantém um padding para o conteúdo não tocar nas bordas
    minHeight: "80%",
  },

  content: {
    padding: 20,
    minHeight: "100%",
    width: "100%", // Você pode ajustar essa largura conforme necessário
    alignItems: "center", // Garante que o conteúdo interno esteja alinhado ao centro
    justifyContent: "space-between", // Centraliza os itens internos do content verticalmente se eles não ocuparem todo o espaço
  },

  contentScroll: {
    height: "100%",
  },

  fullcontainer: {
    height: "90%",
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignSelf: "center",
    alignItems: "center",
    width: "100%",
    minHeight: "70%",
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
    textAlign: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 30,
    paddingHorizontal: 10,
  },
});
