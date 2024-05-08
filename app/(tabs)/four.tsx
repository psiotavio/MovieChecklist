import React, { useEffect, useRef, useState } from "react";
import { Skeleton } from "@rneui/base";
import {
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Animated,
  Button,
  Platform,
  ScrollView,
  Share,
  Dimensions,
} from "react-native";
import { useUser } from "../../contexts/UserContext"; // Certifique-se de que esta é a importação correta
import StarRating from "../../components/starComponent/starComponent";
import logo from "../../assets/images/logo.png";
import { useTheme } from "../../constants/temas/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import { useConfiguration } from "../../contexts/ConfigurationContext";

// import {
//   AdEventType,
//   BannerAd,
//   InterstitialAd,
//   TestIds,
// } from "react-native-google-mobile-ads";

const { width, height } = Dimensions.get("window");

const isTablet = width >= 768; // Um critério comum para tablets

const BANNER_H = isTablet ? 400 : 250;

// let adUnitId: string;

// if (Platform.OS === 'ios') {
//     adUnitId = "ca-app-pub-1771446730721916/1536500762"; // Coloque o ID do iOS aqui
// } else if (Platform.OS === 'android') {
//     adUnitId = "ca-app-pub-1771446730721916/6230272284"; // Coloque o ID do Android aqui
// }

// const anuncio = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
//   requestNonPersonalizedAdsOnly: true,
// });

type Actor = {
  id: number;
  name: string;
  profilePath?: string; // URL para a foto do perfil do ator, se disponível
};

interface Movie {
  rank?: React.JSX.Element;
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
  streamingPlatforms?: StreamingPlatform[]; // Adicionado aqui
  genreId?: string;
  alternateImageUrl?: string; // Nova propriedade para o banner do filme
  description?: string; // Descrição do filme
  actors?: Actor[]; // Novo
}

type StreamingPlatform = {
  id: number;
  name: string;
  logoPath?: string;
};

export default function TabFourScreen() {
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // // ANUNCIOS
  // const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  // const loadInterstitial = () => {
  //   const unscubscribeLoaded = anuncio.addAdEventListener(
  //     AdEventType.LOADED,
  //     () => {
  //       setInterstitialLoaded(true);
  //     }
  //   );

  //   const unscubscribeClosed = anuncio.addAdEventListener(
  //     AdEventType.CLOSED,
  //     () => {
  //       setInterstitialLoaded(false);
  //       anuncio.load();
  //     }
  //   );

  //   anuncio.load();

  //   return () => {
  //     unscubscribeClosed();
  //     unscubscribeLoaded();
  //   };
  // };

  // useEffect(() => {
  //   const unsubscribeInterstitialEvents = loadInterstitial();
  //   return unsubscribeInterstitialEvents;
  // }, []);

  const [activeTab, setActiveTab] = useState("ratedMovies"); // 'ratedMovies' ou 'toWatchMovies'
  const {
    movies,
    toWatchMovies,
    removeFromWatchList,
    addMovieReview,
    addMovieRecommend,
    fetchMovieDetails,
  } = useUser(); // Adicione toWatchMovies aqui
  const { theme } = useTheme();

  const [showModal, setShowModal] = useState(false);
  const [showModalMovie, setShowModalMovie] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<Movie | null>(null);

  // const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const openModal = (movie: Movie) => {
    setSelectedMovieId(movie);
    setIsDetailsLoading(true); // Inicia o loading
    setShowModal(true);

    fetchMovieDetails(movie.id, 0, (movieDetails) => {
      setIsDetailsLoading(false); // Inicia o loading
      setSelectedMovieId(movieDetails);
    });
  };

  const handleShare = () => {
    if (!selectedMovieId) return; // Certifique-se de que há um filme selecionado

    const message = `>  ${translations[language].recomendo}\n\n*${selectedMovieId.title}* \n${selectedMovieId.description}

    \nLINK: watchfolio.com.br/movie/${selectedMovieId.id}/?popup=true`;
    Share.share({
      message,
    }).catch((error) => console.error("Error sharing:", error));
  };

  const openModalMovie = (movieId: number, selectedMovieId: Movie) => {
    setSelectedMovieId(null); // Reseta o filme selecionado
    setIsDetailsLoading(true); // Inicia o loading
    setShowModalMovie(true); // Abre o modal

    fetchMovieDetails(movieId, selectedMovieId?.rating, (movieDetails) => {
      setIsDetailsLoading(false); // Inicia o loading
      setSelectedMovieId(movieDetails);
    });
  };

  const closeModalMovie = () => {
    setShowModalMovie(false);
    setSelectedMovieId(null); // Limpa o filme selecionado ao fechar o modal
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedMovieId(null); // Limpa o filme selecionado ao fechar o modal
  };

  const confirmRemoveMovie = () => {
    if (selectedMovieId !== null) {
      removeFromWatchList(selectedMovieId.id);

      const movieReview: Movie = {
        id: selectedMovieId.id,
        title: selectedMovieId.title,
        date: new Date().toLocaleDateString(),
        rating: 0,
        imageUrl: selectedMovieId.imageUrl,
        rank: selectedMovieId.rank,
      };

      // setTimeout(() => {
      //   if (interstitialLoaded) {
      //     anuncio
      //       .show()
      //       .then(() => {
      //         // Recarregar o anúncio para a próxima exibição
      //         anuncio.load();
      //       })
      //       .catch((error) => {
      //         console.error("Erro ao tentar exibir o anúncio: ", error);
      //       });
      //     // Resetar o estado de carregamento do anúncio
      //     setInterstitialLoaded(false);
      //   }
      // }, 1000); // 2000 milissegundos = 1 segundos

      addMovieReview(movieReview);

      closeModal();
    }
  };

  const confirmRemoveMovieList = () => {
    if (selectedMovieId !== null) {
      removeFromWatchList(selectedMovieId.id);
      closeModal();
      addMovieRecommend(selectedMovieId);
    }
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();

    return `${year}`;
  };

  const moviesSortedByRating = [...movies].sort((a, b) => b.rating - a.rating);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { language } = useConfiguration();

  const translations = {
    english: {
      Avaliados: "Rated",
      SeusAvaliados: "YOUR RATED MOVIES",
      ParaAssistir: "To Watch",
      SemAssistir:
        "You have no movies in your list. Add a movie to watch later by searching in the Recommendations tab.",
      SemAvaliados: "You have not rated any movie.",
      recomendo: "I recommend this movie:",
      compartilhar: "Share",
      fechar: "Close",
      descricao: "Description",
      atores: "Actors",
      javiu: "Have you watched this movie?",
      removeLista: "Remove from list",
      sim: "Yes",
      nao: "No",
    },
    portuguese: {
      Avaliados: "Avaliados",
      SeusAvaliados: "SEUS FILMES AVALIADOS",
      ParaAssistir: "Para Assistir",
      SemAssistir:
        "Você não tem nenhum filme na lista. Adicione um filme para assistir mais tarde procurando na aba Recomendações.",
      SemAvaliados: "Você não avaliou nenhum filme.",
      recomendo: "Recomendo esse filme:",
      compartilhar: "Compartilhar",
      fechar: "Fechar",
      descricao: "Descrição",
      atores: "Atores",
      javiu: "Já assistiu esse filme?",
      removeLista: "Remover da lista",
      sim: "Sim",
      nao: "Não",
    },
    spanish: {
      Avaliados: "Evaluados",
      SeusAvaliados: "TUS PELÍCULAS EVALUADAS",
      ParaAssistir: "Para Ver",
      SemAssistir:
        "No tienes ninguna película en tu lista. Añade una película para ver más tarde buscando en la pestaña Recomendaciones.",
      SemAvaliados: "No has evaluado ninguna película.",
      recomendo: "Recomiendo esta película:",
      compartilhar: "Compartir",
      fechar: "Cerrar",
      descricao: "Descripción",
      atores: "Actores",
      javiu: "¿Ya viste esta película?",
      removeLista: "Quitar de la lista",
      sim: "Sí",
      nao: "No",
    },
    french: {
      Avaliados: "Évalués",
      SeusAvaliados: "VOS FILMS ÉVALUÉS",
      ParaAssistir: "À Regarder",
      SemAssistir:
        "Vous n'avez aucun film dans votre liste. Ajoutez un film à regarder plus tard en cherchant dans l'onglet Recommandations.",
      SemAvaliados: "Vous n'avez évalué aucun film.",
      recomendo: "Je recommande ce film :",
      compartilhar: "Partager",
      fechar: "Fermer",
      descricao: "Description",
      atores: "Acteurs",
      javiu: "Avez-vous vu ce film ?",
      removeLista: "Retirer de la liste",
      sim: "Oui",
      nao: "Non",
    },
    german: {
      Avaliados: "Bewertet",
      SeusAvaliados: "IHRE BEWERTETEN FILME",
      ParaAssistir: "Zum Anschauen",
      SemAssistir:
        "Sie haben keine Filme auf Ihrer Liste. Fügen Sie einen Film hinzu, den Sie später sehen möchten, indem Sie im Empfehlungen-Tab suchen.",
      SemAvaliados: "Sie haben keinen Film bewertet.",
      recomendo: "Ich empfehle diesen Film:",
      compartilhar: "Teilen",
      fechar: "Schließen",
      descricao: "Beschreibung",
      atores: "Schauspieler",
      javiu: "Haben Sie diesen Film schon gesehen?",
      removeLista: "Von der Liste entfernen",
      sim: "Ja",
      nao: "Nein",
    },
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Image source={logo} style={styles.logo} />
      <View style={styles.containerSecondaryy}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "ratedMovies"
                ? { backgroundColor: theme.borderRed }
                : { backgroundColor: theme.modalBackgroundSecondary },
            ]}
            onPress={() => setActiveTab("ratedMovies")}
          >
            <Text
              style={
                activeTab === "ratedMovies"
                  ? [styles.tabText, { color: theme.textButtons }]
                  : styles.tabText
              }
            >
              {translations[language].Avaliados}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "toWatchMovies"
                ? { backgroundColor: theme.borderRed }
                : { backgroundColor: theme.modalBackgroundSecondary },
            ]}
            onPress={() => setActiveTab("toWatchMovies")}
          >
            <Text
              style={
                activeTab === "toWatchMovies"
                  ? [styles.tabText, { color: theme.text }]
                  : styles.tabText
              }
            >
              {translations[language].ParaAssistir}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "ratedMovies" ? (
          moviesSortedByRating.length > 0 ? (
            <>
              <Text style={[styles.movieListTitle, { color: theme.text }]}>
                {translations[language].SeusAvaliados}
              </Text>
              <FlatList
                style={styles.flatlist}
                data={moviesSortedByRating}
                keyExtractor={(movie) => movie.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View style={styles.movieItem}>
                    <TouchableOpacity
                      style={[
                        styles.movieList,
                        { borderBottomColor: theme.borderBottom },
                      ]}
                      onPress={() => openModalMovie(item.id, item)}
                    >
                      <View style={styles.imageIndex}>
                        <Text style={[styles.itemIndex, { color: theme.text }]}>
                          {index + 1 + "º"}
                        </Text>
                        <View
                          style={[
                            styles.moviesLists,
                            { backgroundColor: theme.background },
                          ]}
                        >
                          <Image
                            style={styles.movieImage}
                            source={{
                              uri: item.imageUrl || "default_image_url",
                            }}
                          />
                        </View>
                      </View>
                      <View style={styles.textRate}>
                        <Text
                          style={[styles.textRateText, { color: theme.text }]}
                        >
                          {item.title}
                        </Text>
                        <StarRating rating={item.rating}></StarRating>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          ) : (
            <Text style={{ color: theme.text, marginTop: 20 }}>
              {translations[language].SemAvaliados}
            </Text>
          )
        ) : toWatchMovies.length > 0 ? (
          <FlatList
            data={toWatchMovies}
            keyExtractor={(movie) => movie.id.toString()}
            numColumns={isTablet ? 4 : 3}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.toWatchmovieItem}>
                <TouchableOpacity
                  style={styles.toWatch}
                  onPress={() => openModal(item)}
                >
                  <View
                    style={[
                      styles.toWatchmoviesLists,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <Image
                      style={styles.toWatchmovieImage}
                      source={{ uri: item.imageUrl || "default_image_url" }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <Text
            style={{
              color: theme.text,
              marginTop: 20,
              paddingHorizontal: 20,
            }}
          >
            {translations[language].SemAssistir}
          </Text>
        )}
      </View>

      {/* MODAL DE PARA ASSISTIR MAIS TARDE  */}

      <Modal
        animationType="slide"
        visible={showModal}
        onRequestClose={closeModal}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainerMovie}>
          {isDetailsLoading ? (
            <View
              style={[
                styles.modalContentMovie,
                { backgroundColor: theme.modalBackground },
              ]}
            >
              <ActivityIndicator
                size="large"
                color={theme.borderRed}
                style={{ alignSelf: "center" }}
              />
            </View>
          ) : (
            <View
              style={[
                styles.modalContentMovie,
                { backgroundColor: theme.modalThemeMode },
              ]}
            >
              <Animated.ScrollView
                style={{
                  flex: 1,
                  width: "100%",
                  backgroundColor: theme.modalBackground,
                }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: true }
                )}
                scrollEventThrottle={16} // Defina a frequência de eventos de rolagem
              >
                <View
                  style={[
                    {
                      display: "flex",
                      flexDirection: "column",
                      height: BANNER_H,
                      backgroundColor: theme.modalBackground,
                    },
                    styles.imageShadowContainerBanner,
                  ]}
                >
                  <Animated.Image
                    style={[
                      styles.movieImageBanner,
                      {
                        width: "100%",
                        flex: 1,
                        height: BANNER_H,
                        transform: [
                          {
                            translateY: scrollY.interpolate({
                              inputRange: [-BANNER_H, 0, BANNER_H],
                              outputRange: [-BANNER_H / 2, 0, 0], // Previne movimento para cima
                            }),
                          },
                          {
                            scale: scrollY.interpolate({
                              inputRange: [-BANNER_H, 0],
                              outputRange: [2, 1], // Permite expansão ao puxar para baixo
                              extrapolateRight: "clamp", // Previne que a escala se ajuste além do especificado
                            }),
                          },
                        ],
                      },
                    ]}
                    source={{ uri: selectedMovieId?.alternateImageUrl }}
                  />
                </View>

                <View style={styles.modalInfoContent}>
                  <View style={styles.modalMovieInfo}>
                    <View style={styles.modalMovieTitle}>
                      <View
                        style={[
                          styles.imageShadowContainer,
                          { backgroundColor: theme.modalBackground },
                        ]}
                      >
                        <Image
                          style={styles.movieImage}
                          source={{ uri: selectedMovieId?.imageUrl }}
                        />
                      </View>
                      <View style={styles.titleAndDate}>
                        <Text
                          style={[
                            styles.modalMovieTitleText,
                            { color: theme.text },
                          ]}
                        >
                          {selectedMovieId?.title}
                        </Text>
                        <Text
                          style={[styles.modalMovieDate, { color: theme.text }]}
                        >
                          {formatDate(selectedMovieId?.date)}
                        </Text>

                        <TouchableHighlight
                          style={{
                            ...styles.modalButton,
                            marginBottom: 10,
                            backgroundColor: "#4caf50", // Cor verde para diferenciar
                          }}
                          onPress={handleShare}
                        >
                          <Text
                            style={{
                              color: theme.textButtons,
                              textAlign: "center",
                            }}
                          >
                            {translations[language].compartilhar}
                          </Text>
                        </TouchableHighlight>

                        <TouchableOpacity
                          style={[
                            styles.modalButton,
                            { backgroundColor: theme.errorColor },
                          ]}
                          onPress={confirmRemoveMovieList}
                        >
                          <Text
                            style={{
                              color: theme.textButtons,
                              textAlign: "center",
                            }}
                          >
                            {translations[language].removeLista}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text
                      style={{
                        color: theme.text,
                        marginTop: 30,
                        textAlign: "justify",
                      }}
                    >
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {translations[language].descricao}{" "}
                      </Text>
                      <Text
                        style={[
                          styles.modalText,
                          { color: theme.text, marginBottom: 30 },
                        ]}
                      >
                        {selectedMovieId?.description}
                      </Text>
                    </Text>

                    <View style={{ marginTop: 30 }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {translations[language].atores}:
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.actorsContainer}
                      >
                        {selectedMovieId?.actors?.map((actor, index) => (
                          <View key={index} style={styles.actorCard}>
                            <View
                              style={[
                                styles.imageShadowContainerActor,
                                { backgroundColor: theme.modalBackground },
                              ]}
                            >
                              <Image
                                source={{ uri: actor.profilePath! }}
                                style={styles.actorImage}
                                resizeMode="cover"
                              />
                            </View>
                            <Text
                              style={[
                                styles.modalMovieTitleTextActors,
                                { color: theme.text },
                              ]}
                            >
                              {actor.name}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginTop: 30,
                      }}
                    >
                      {selectedMovieId?.streamingPlatforms
                        ?.filter((streaming) => streaming.name !== "HBO Max") // Supondo que 'name' seja uma propriedade identificadora
                        .map((streaming, index) => (
                          <Image
                            key={index}
                            source={{ uri: streaming.logoPath }}
                            style={{
                              width: 50, // Defina a largura conforme necessário
                              height: 50, // Defina a altura conforme necessário
                              marginRight: 10, // Espaço à direita de cada imagem
                              borderRadius: 30,
                            }}
                            resizeMode="contain"
                          />
                        ))}
                    </View>
                  </View>

                  <View
                    style={{
                      justifyContent: "center",
                      alignContent: "center",
                      alignItems: "center",
                      paddingVertical: 5,
                      marginVertical: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 18,
                        fontWeight: "bold",
                        paddingTop: 20,
                      }}
                    >
                      {translations[language].javiu}
                    </Text>
                    <View style={{ marginBottom: 50 }}>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={[
                            styles.modalButton,
                            { backgroundColor: theme.borderRed },
                          ]}
                          onPress={confirmRemoveMovie}
                        >
                          <Text style={[styles.textStyle, { color: theme.text }]}>
                            {translations[language].sim}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.modalButton,
                            { backgroundColor: theme.modalBackgroundSecondary },
                          ]}
                          onPress={closeModal}
                        >
                          <Text style={[styles.textStyle, { color: theme.text }]}>
                            {translations[language].nao}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* <BannerAd
                      unitId={adUnitId}
                      size="BANNER"
                      onAdLoaded={() => {}}
                      onAdFailedToLoad={(error) => {
                        console.error("Ad failed to load", error);
                      }}
                      requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                      }}
                    /> */}
                  </View>
                </View>
              </Animated.ScrollView>
            </View>
          )}
        </View>
      </Modal>

      <Modal
        animationType="slide"
        visible={showModalMovie}
        onRequestClose={closeModalMovie}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainerMovie}>
          {isDetailsLoading ? (
            <View
              style={[
                styles.modalContentMovie,
                { backgroundColor: theme.modalBackground },
              ]}
            >
              <ActivityIndicator
                size="large"
                color={theme.borderRed}
                style={{ alignSelf: "center" }}
              />
            </View>
          ) : (
            <View
              style={[
                styles.modalContentMovie,
                { backgroundColor: theme.modalThemeMode },
              ]}
            >
              <Animated.ScrollView
                style={{
                  flex: 1,
                  width: "100%",
                  backgroundColor: theme.modalBackground,
                }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: true }
                )}
                scrollEventThrottle={16} // Defina a frequência de eventos de rolagem
              >
                <View
                  style={[
                    {
                      display: "flex",
                      flexDirection: "column",
                      height: BANNER_H,
                      backgroundColor: theme.modalBackground,
                    },
                    styles.imageShadowContainerBanner,
                  ]}
                >
                  <Animated.Image
                    style={[
                      styles.movieImageBanner,
                      {
                        width: "100%",
                        flex: 1,
                        height: BANNER_H,
                        transform: [
                          {
                            translateY: scrollY.interpolate({
                              inputRange: [-BANNER_H, 0, BANNER_H],
                              outputRange: [-BANNER_H / 2, 0, 0], // Previne movimento para cima
                            }),
                          },
                          {
                            scale: scrollY.interpolate({
                              inputRange: [-BANNER_H, 0],
                              outputRange: [2, 1], // Permite expansão ao puxar para baixo
                              extrapolateRight: "clamp", // Previne que a escala se ajuste além do especificado
                            }),
                          },
                        ],
                      },
                    ]}
                    source={{ uri: selectedMovieId?.alternateImageUrl }}
                  />
                </View>

                <View style={styles.modalInfoContent}>
                  <View style={styles.modalMovieInfo}>
                    <View style={styles.modalMovieTitle}>
                      <View
                        style={[
                          styles.imageShadowContainer,
                          { backgroundColor: theme.modalBackground },
                        ]}
                      >
                        <Image
                          style={styles.movieImage}
                          source={{ uri: selectedMovieId?.imageUrl }}
                        />
                      </View>
                      <View style={styles.titleAndDate}>
                        <Text
                          style={[
                            styles.modalMovieTitleText,
                            { color: theme.text },
                          ]}
                        >
                          {selectedMovieId?.title}
                        </Text>
                        <View style={{ marginBottom: 10 }}>
                          <StarRating
                            rating={selectedMovieId?.rating}
                          ></StarRating>
                        </View>

                        <Text
                          style={[styles.modalMovieDate, { color: theme.text }]}
                        >
                          {formatDate(selectedMovieId?.date)}
                        </Text>

                        <TouchableHighlight
                          style={{
                            ...styles.modalButton,
                            marginBottom: 10,
                            backgroundColor: "#4caf50", // Cor verde para diferenciar
                          }}
                          onPress={handleShare}
                        >
                          <Text
                            style={{
                              color: theme.textButtons,
                              textAlign: "center",
                            }}
                          >
                            {translations[language].compartilhar}
                          </Text>
                        </TouchableHighlight>
                      </View>
                    </View>

                    <Text
                      style={{
                        color: theme.text,
                        marginTop: 30,
                        textAlign: "justify",
                      }}
                    >
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {translations[language].descricao}{" "}
                      </Text>
                      <Text
                        style={[
                          styles.modalText,
                          { color: theme.text, marginBottom: 30 },
                        ]}
                      >
                        {selectedMovieId?.description}
                      </Text>
                    </Text>

                    <View style={{ marginTop: 30 }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {translations[language].atores}:
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.actorsContainer}
                      >
                        {selectedMovieId?.actors?.map((actor, index) => (
                          <View key={index} style={styles.actorCard}>
                            <View
                              style={[
                                styles.imageShadowContainerActor,
                                { backgroundColor: theme.modalBackground },
                              ]}
                            >
                              <Image
                                source={{ uri: actor.profilePath! }}
                                style={styles.actorImage}
                                resizeMode="cover"
                              />
                            </View>
                            <Text
                              style={[
                                styles.modalMovieTitleTextActors,
                                { color: theme.text },
                              ]}
                            >
                              {actor.name}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginTop: 30,
                      }}
                    >
                      {selectedMovieId?.streamingPlatforms
                        ?.filter((streaming) => streaming.name !== "HBO Max") // Supondo que 'name' seja uma propriedade identificadora
                        .map((streaming, index) => (
                          <Image
                            key={index}
                            source={{ uri: streaming.logoPath }}
                            style={{
                              width: 50, // Defina a largura conforme necessário
                              height: 50, // Defina a altura conforme necessário
                              marginRight: 10, // Espaço à direita de cada imagem
                              borderRadius: 30,
                            }}
                            resizeMode="contain"
                          />
                        ))}
                    </View>
                  </View>

                  <View style={styles.modalButtonsContainerAll}>
                    <View style={styles.modalButtonsContainer}>
                      <TouchableHighlight
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.modalBackgroundSecondary,
                        }}
                        onPress={closeModalMovie}
                      >
                        <Text
                          style={[
                            styles.textStyle,
                            { color: theme.textButtons, fontSize: 18 },
                          ]}
                        >
                          {translations[language].fechar}
                        </Text>
                      </TouchableHighlight>
                    </View>
                  </View>

                  <View
                    style={{
                      justifyContent: "center",
                      alignContent: "center",
                      alignItems: "center",
                      paddingVertical: 5,
                      marginVertical: 5,
                    }}
                  >
                    {/* <BannerAd
                      unitId={adUnitId}
                      size="BANNER"
                      onAdLoaded={() => {}}
                      onAdFailedToLoad={(error) => {
                        console.error("Ad failed to load", error);
                      }}
                      requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                      }}
                    /> */}
                  </View>
                </View>
              </Animated.ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  moviesLists: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
    borderRadius: 15,
  },
  textRate: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignSelf: "center",
    width: "100%",
  },
  textRateText: {
    display: "flex",
    flexWrap: "wrap",
    width: "60%",
    fontSize: 20,
    fontWeight: "bold",
  },

  flatlist: {
    paddingVertical: 15,
    width: "100%",
  },
  itemIndex: {
    display: "flex",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  imageIndex: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },
  movieList: {
    width: "90%",
    display: "flex",
    flexDirection: "row",
    gap: 20,
    borderBottomWidth: 2,
  },
  scrollView: {
    width: "100%",
  },
  movieRatingText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center",
  },
  container: {
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  containerSecondary: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  containerSecondaryy: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    height: "50%",
  },
  logo: {
    marginVertical: 10,
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  movieListTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 35,
    marginTop: 20,
    alignSelf: "center",
  },
  movieItem: {
    width: "100%",
    marginBottom: 16,
    alignItems: "center",
    marginRight: 16,
  },
  movieImage: {
    width: isTablet ? 150 : 100,
    height: isTablet ? 230 : 150,
    resizeMode: "cover",
    borderRadius: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginVertical: 30,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  tabText: {
    color: "#fff", // Cor para abas inativas
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff", // Cor para a aba ativa
  },

  toWatch: {
    gap: 20,
  },
  toWatchmovieItem: {
    display: "flex",
    marginBottom: 16,
    alignItems: "center",
    marginHorizontal: 7,
  },
  toWatchmovieImage: {
    width: isTablet ? 150 : 100,
    height: isTablet ? 230 : 150,
    resizeMode: "cover",
    borderRadius: 10,
  },
  toWatchmoviesLists: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
    borderRadius: 15,
  },

  modalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonIcon: {
    padding: 5,
  },
  modalContent: {
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 20,
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

  modalButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 30,
    paddingHorizontal: 35,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 20,
  },

  bannerContainer: {
    height: 250,
    width: "100%",
    position: "relative",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },

  buttonContainer: {
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 30,
  },
  shadowContainer: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },

  // Estilos do modal
  modalContainerMovie: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.60)",
  },
  modalContentMovie: {
    justifyContent: "center",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    width: "100%",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalInfoContent: {
    paddingHorizontal: 20,
  },
  modalMovieInfo: {},
  modalMovieTitle: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  titleAndDate: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  modalMovieTitleText: {
    flexWrap: "wrap",
    fontWeight: "bold",
    fontSize: 18,
    flex: 1,
    marginTop: 10,
  },
  modalMovieDate: {
    flexWrap: "wrap",
    fontSize: 14,
    flex: 1,
  },
  modalMovieTitleTextActors: {
    fontSize: 16,
    textAlign: "left",
    fontStyle: "italic",
    flex: 1,
  },
  modalText: {
    fontSize: 18,
    textAlign: "justify",
  },
  modalButtonsContainer: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    paddingBottom: 10,
    width: "100%",
  },
  modalButtonsContainerAll: {
    flexDirection: "column",
    gap: 10,
    paddingVertical: 20,
    alignItems: "center",
  },
  movieImageBanner: {
    width: "100%",
    flex: 1,
    resizeMode: "cover",
  },

  imageShadowContainer: {
    width: isTablet ? 150 : 100,
    height: isTablet ? 230 : 150,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },

  imageShadowContainerBanner: {
    marginBottom: 30,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },
  imageShadowContainerActor: {
    width: 90,
    height: 125,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },

  actorsContainer: {
    width: "100%",
  },
  actorCard: {
    padding: 10,
    alignItems: "center",
  },
  actorImage: {
    width: 90,
    height: 125,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
});
