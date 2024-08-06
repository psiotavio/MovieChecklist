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
  Linking,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../../contexts/UserContext";
import { isSameWeek, isSameYear, isSameMonth, parse } from "date-fns";
import { useTheme } from "../../constants/temas/ThemeContext";
import { themes } from "../../constants/temas/ThemeColors";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackgroundImage } from "@rneui/base";
import { useConfiguration } from "../../contexts/ConfigurationContext";
import LanguageButton from "../../components/LanguageButton";
import SettingsButton from "../../components/SettingsButton";
import Icon from "react-native-vector-icons/FontAwesome6";
import ThemeButton from "../../components/ThemeButton";
import logoDefault from "../../assets/images/logo.png";
import logoBlue from "../../assets/images/logoBlue.png";
import logoPink from "../../assets/images/logoPink.png";
import logoGreen from "../../assets/images/logoGreen.png";
import logoRed from "../../assets/images/logoRed.png";
import logoOrange from "../../assets/images/logoOrange.png";

import {
  AdEventType,
  BannerAd,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";

//  // ANUNCIOS
let adUnitId: string;


if (Platform.OS === "ios") {
  adUnitId = "ca-app-pub-4303499199669342/6006099901"; // Coloque o ID do iOS aqui
} else if (Platform.OS === "android") {
  adUnitId = "ca-app-pub-4303499199669342/1108657138"; // Coloque o ID do Android aqui
}
// const anuncio = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
//   requestNonPersonalizedAdsOnly: true,
// });

export default function TabTwoScreen() {
  const {
    movies,
    setMovies,
    recommendedByGenre,
    setRecommendedMovies,
    setToWatchMovies,
  } = useUser();
  const { theme, themeName } = useTheme();

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
      translation.RedefinirConta, // Título do Alerta
      translation.ConfirmacaoRedefinir, // Mensagem do Alerta
      [
        {
          text: translation.cancelar,
          style: "cancel",
        },
        {
          text: translation.sim,
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

  const openInstagramProfile = () => {
    Linking.openURL("https://www.instagram.com/watchfolio.app/"); // Substitua 'seuperfil' pelo seu perfil do Instagram
  };

  const openTwitterProfile = () => {
    Linking.openURL("https://x.com/WatchfolioApp"); // Substitua pelo seu perfil no Twitter
  };

  const openThreadsProfile = () => {
    Linking.openURL("https://www.threads.net/@watchfolio.app"); // Substitua pelo seu perfil no Threads
  };

  const openTiktokProfile = () => {
    Linking.openURL("https://www.tiktok.com/@watchfolio?_t=8mSwKKFvXr3&_r=1"); // Substitua pelo seu perfil no TikTok
  };

  const openWebVersion = () => {
    Linking.openURL("https://watchfolio.com.br/"); // Substitua pelo seu perfil no TikTok
  };

  const { translation, language } = useConfiguration();
  const [activeTab, setActiveTab] = useState("configuration"); // 'ratedMovies' ou 'toWatchMovies'

  // Definindo logos para diferentes temas
  const logos = {
    default: logoDefault,
    dark: logoDefault,
    light: logoDefault,
    blue: logoBlue,
    orange: logoOrange,
    pink: logoPink,
    lightpink: logoPink,
    green: logoGreen,
    dune: logoDefault,
    red: logoRed,
    cosmicDusk: logoDefault,
    lilacNebula: logoDefault,
    shadowOfMordor: logoDefault,
    darkSide: logoDefault,
    neonTwilight: logoDefault,
    dracula: logoDefault,
    bladeRunner: logoDefault,
    violetWitch:logoDefault,
    thanos:logoDefault,
    jediTemple:logoDefault,
    hungerGames:logoDefault,
    neoMatrix:logoDefault,
  };

  // Selecionar logo com base no tema atual
  const logo = logos[themeName] || logos.default;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Image source={logo} style={styles.logo} />

      {activeTab === "configuration" ? (
        <View style={styles.StatsPage}>
          <Text style={[styles.title, { color: theme.text }]}>
            {translation.ESTATÍSTICAS}
          </Text>
          <View style={styles.fullcontainer}>
            <ScrollView style={styles.contentScroll}>
              <View style={styles.contentAligner}>
                <View style={styles.content}>
                  <View style={styles.progessBars}>
                    <View style={styles.progessBarStyle}>
                      <Text style={[styles.subtitle, { color: theme.text }]}>
                        {translation.Year} {totalMoviesWatchedThisYear}
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
                        {translation.Month} {totalMoviesWatchedThisMonth}
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
                        {translation.Week} {totalMoviesWatchedThisWeek}
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
                <View
                  style={{
                    justifyContent: "center",
                    alignContent: "center",
                    alignSelf: 'center',
                    alignItems: 'center',
                    margin: 'auto',
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  <BannerAd
                    unitId={adUnitId}
                    size="BANNER"
                    onAdLoaded={() => {}}
                    onAdFailedToLoad={(error) => {
                      console.error("Ad failed to load", error);
                    }}
                    requestOptions={{
                      requestNonPersonalizedAdsOnly: true,
                    }}
                  />
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
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              key={1}
              style={[
                styles.socialMediaButton,
                { backgroundColor: theme.borderRed },
              ]}
              onPress={openInstagramProfile}
            >
              <Icon
                name="instagram"
                size={25}
                color={theme.text}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              key={2}
              style={[
                styles.socialMediaButton,
                { backgroundColor: theme.borderRed },
              ]}
              onPress={openTwitterProfile}
            >
              <Icon
                name="twitter"
                size={25}
                color={theme.text}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              key={3}
              style={[
                styles.socialMediaButton,
                { backgroundColor: theme.borderRed },
              ]}
              onPress={openThreadsProfile}
            >
              <Icon
                name="threads"
                size={25}
                color={theme.text}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              key={4}
              style={[
                styles.socialMediaButton,
                { backgroundColor: theme.borderRed },
              ]}
              onPress={openTiktokProfile}
            >
              <Icon
                name="tiktok"
                size={25}
                color={theme.text}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          <LanguageButton />

          {/* <View style={styles.switchContainer}>
            <Text
              style={{
                color: theme.text,
                fontWeight: "bold",
                marginRight: 10,
              }}
            >
              {translation.tema}
            </Text>
            <Switch
              trackColor={{
                true: theme.modalBackgroundSecondary,
              }}
              thumbColor={
                themeName === "dark" ? theme.borderRed : theme.borderRed
              }
              onValueChange={toggleTheme}
              value={themeName === "dark"}
            />
          </View> */}
          <ThemeButton />

          <TouchableOpacity
            key={5}
            style={[styles.button, { backgroundColor: theme.borderRed }]}
            onPress={openWebVersion}
          >
            <Text style={{ color: theme.text, fontWeight: "bold" }}>
              {translation.VersaoWeb}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            key={6}
            style={[styles.button, { backgroundColor: theme.borderRed }]}
            onPress={handleResetMovies}
          >
            <Text style={{ color: theme.text, fontWeight: "bold" }}>
              {translation.redefinir}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            key={7}
            style={[
              styles.button,
              {
                backgroundColor: theme.background,
                borderColor: theme.borderRed,
                borderWidth: 3,
              },
            ]}
            onPress={() =>
              setActiveTab(
                activeTab === "configuration" ? "stats" : "configuration"
              )
            }
          >
            <Text style={{ color: theme.text, fontWeight: "bold" }}>
              {translation.voltar}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              justifyContent: "center",
              alignContent: "center",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "100%",
            }}
          >
            <BannerAd
              unitId={adUnitId}
              size="BANNER"
              onAdLoaded={() => {}}
              onAdFailedToLoad={(error) => {
                console.error("Ad failed to load", error);
              }}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />

          </View>
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
    right: 30,
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
    minHeight: '80%'
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
  socialMediaButton: {
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    padding: 15,
    borderRadius: 100,
  },
  icon: {
    alignSelf: "center",
    textAlign: "center",
  },
});
