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
import logoDefault from "../../assets/images/logo.png";
import logoBlue from "../../assets/images/logoBlue.png";
import logoPink from "../../assets/images/logoPink.png";
import logoGreen from "../../assets/images/logoGreen.png";
import logoRed from "../../assets/images/logoRed.png";
import logoOrange from "../../assets/images/logoOrange.png";
import { useTheme } from "../../constants/temas/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import { useConfiguration } from "../../contexts/ConfigurationContext";
import ShareImageButton from "../../components/ShareMovieImage/shareMovieImage";
import ImageContainer from "../../components/imageContainer/imageContainer";

// import {
//   AdEventType,
//   BannerAd,
//   InterstitialAd,
//   TestIds,
// } from "react-native-google-mobile-ads";

const { width, height } = Dimensions.get("window");

const isTablet = width >= 768; // Um critério comum para tablets

const BANNER_H = isTablet ? 400 : 250;

let adUnitId: string;

if (Platform.OS === "ios") {
  adUnitId = "ca-app-pub-4303499199669342/6006099901"; // Coloque o ID do iOS aqui
} else if (Platform.OS === "android") {
  adUnitId = "ca-app-pub-4303499199669342/1108657138"; // Coloque o ID do Android aqui
}

type Actor = {
  id: number;
  name: string;
  profilePath?: string; // URL para a foto do perfil do ator, se disponível

  biography?: string;
  birthYear?: string;
  movies?: Movie[];
};

type ActorDetails = {
  id: number;
  name: string;
  biography: string;
  birthYear: string;
  profilePath?: string;
  movies: Movie[];
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
  similarMovies?: Movie[];
  comment: string;
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
    fetchActorDetails,
    addToWatchList,
  } = useUser(); // Adicione toWatchMovies aqui
  const { theme, themeName } = useTheme();

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
    violetWitch: logoDefault,
    thanos: logoDefault,
    jediTemple: logoDefault,
    hungerGames: logoDefault,
    neoMatrix: logoDefault,
  };

  // Selecionar logo com base no tema atual
  const logo = logos[themeName] || logos.default;

  const [showModal, setShowModal] = useState(false);
  const [showModalActor, setShowModalActor] = useState(false); // Estado para controlar a visibilidade do modal
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [showModalMovie, setShowModalMovie] = useState(false);
  const [showModalMovie2, setShowModalMovie2] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const openModal = (movie: Movie) => {
    setSelectedMovieId(movie);
    setIsDetailsLoading(true); // Inicia o loading
    setShowModal(true);

    fetchMovieDetails(movie.id, 0, " ", (movieDetails) => {
      setIsDetailsLoading(false); // Inicia o loading
      setSelectedMovieId(movieDetails);
    });
  };

  const openModalMovie2 = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailsLoading(true); // Inicia o loading
    setShowModalMovie2(true);

    fetchMovieDetails(movie.id, 0, " ", (movieDetails) => {
      setIsDetailsLoading(false); // Inicia o loading
      setSelectedMovie(movieDetails);
    });
  };

  const handleAddToList = () => {
    if (selectedMovie) {
      const toWatch: Movie = {
        id: selectedMovie.id,
        title: selectedMovie.title,
        date: new Date().toLocaleDateString(),
        rating: 0,
        imageUrl: selectedMovie.imageUrl,
        rank: selectedMovie.rank,
        comment: " ",
        streamingPlatforms: selectedMovie.streamingPlatforms, // Adicionado aqui

        genreId: selectedMovie.genreId,
        alternateImageUrl: selectedMovie.alternateImageUrl, // Nova propriedade para o banner do filme
        description: selectedMovie.description, // Descrição do filme
        actors: selectedMovie.actors, // Novo
      };

      // if (counter === 2) {
      //   setTimeout(() => {
      //     if (interstitialLoaded) {
      //       anuncio
      //         .show()
      //         .then(() => {
      //           // Recarregar o anúncio para a próxima exibição
      //           anuncio.load();
      //         })
      //         .catch((error) => {
      //           console.error("Erro ao tentar exibir o anúncio: ", error);
      //         });
      //       // Resetar o estado de carregamento do anúncio
      //       setInterstitialLoaded(false);
      //       setCounter(0);
      //     }
      //   }, 2000); // 2000 milissegundos = 2 segundos
      // }

      addToWatchList(toWatch);
      // setCounter(counter + 1);
      closeModalMovie2();
      setSelectedMovie(null);
    }
  };

  const handleShare = () => {
    if (!selectedMovieId) return; // Certifique-se de que há um filme selecionado

    const message = `>  ${translation.RecommendMovie}\n\n*${selectedMovieId.title}* \n${selectedMovieId.description}

    \nLINK: watchfolio.com.br/movie/${selectedMovieId.id}/?popup=true`;
    Share.share({
      message,
    }).catch((error) => console.error("Error sharing:", error));
  };

  const openModalMovie = (movieId: number, selectedMovieId: Movie) => {
    setSelectedMovieId(null); // Reseta o filme selecionado
    setIsDetailsLoading(true); // Inicia o loading
    setShowModalMovie(true); // Abre o modal

    fetchMovieDetails(
      movieId,
      selectedMovieId?.rating,
      selectedMovieId?.comment!,
      (movieDetails) => {
        setIsDetailsLoading(false); // Inicia o loading
        setSelectedMovieId(movieDetails);
      }
    );
  };

  const closeModalMovie = () => {
    setShowModalMovie(false);
    setSelectedMovieId(null); // Limpa o filme selecionado ao fechar o modal
  };

  const closeModalMovie2 = () => {
    setShowModalMovie2(false);
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
        comment: " ",
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

  const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const moviesSortedByRating = [...movies].sort((a, b) => {
    const ratingDiff = b.rating - a.rating;
    if (ratingDiff === 0) {
      return parseDate(b.date) - parseDate(a.date);
    }
    return ratingDiff;
  });

  const scrollY = useRef(new Animated.Value(0)).current;

  const { translation, language } = useConfiguration();

  const openModalActor = (actorID: number) => {
    setSelectedActor(null); // Reseta o filme selecionado
    setIsDetailsLoading(true); // Inicia o loading
    setShowModalActor(true); // Abre o modal

    // Chamada para fetchMovieDetails sem a verificação de showModal
    fetchActorDetails(actorID, (actorDetails) => {
      setSelectedActor(actorDetails);
      setIsDetailsLoading(false);
    });
  };

  const handlePressItemModalType = (item: any) => {
    setShowModalMovie(false); // Feche o modal atual
    setTimeout(() => {
      fetchMovieDetails(item.id, 0, " ", (movieDetails) => {
        setSelectedMovieId(movieDetails);
        setIsDetailsLoading(false); // Carregamento concluído
        openModalMovie(movieDetails.id, movieDetails);
      });
    }, 300); // Adicione um pequeno atraso para garantir que o modal foi fechado
  };

  const handlePressItemModalType2 = (item: any) => {
    setShowModalMovie2(false); // Feche o modal atual
    setTimeout(() => {
      fetchMovieDetails(item.id, 0, " ", (movieDetails) => {
        setSelectedMovieId(movieDetails);
        setIsDetailsLoading(false); // Carregamento concluído
        openModalMovie2(movieDetails);
      });
    }, 300); // Adicione um pequeno atraso para garantir que o modal foi fechado
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isDetailsLoading) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [isDetailsLoading]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Image source={logo} style={styles.logo} />
      <View style={styles.containerSecondaryy}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            key={1}
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
                  : [styles.tabText, { color: theme.textButtons }]
              }
            >
              {translation.Avaliados}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            key={2}
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
                  ? [styles.tabText, { color: theme.textButtons }]
                  : [styles.tabText, { color: theme.textButtons }]
              }
            >
              {translation.ParaAssistir}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "ratedMovies" ? (
          moviesSortedByRating.length > 0 ? (
            <>
              <Text style={[styles.movieListTitle, { color: theme.text }]}>
                {translation.SeusAvaliados}
              </Text>
              <FlatList
                style={styles.flatlist}
                data={moviesSortedByRating}
                keyExtractor={(movie) => movie.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View style={styles.movieItem}>
                    <TouchableOpacity
                      key={item.id}
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
                        <StarRating rating={item.rating} />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          ) : (
            <Text style={{ color: theme.text, marginTop: 20 }}>
              {translation.SemAvaliados}
            </Text>
          )
        ) : toWatchMovies.length > 0 ? (
          <FlatList
            data={toWatchMovies}
            keyExtractor={(movie) => movie.id.toString()}
            numColumns={isTablet ? 4 : 3}
            initialNumToRender={6} // Ajuste conforme necessário
            maxToRenderPerBatch={5} // Ajuste conforme necessário
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.toWatchmovieItem}>
                <TouchableOpacity
                  key={item.id}
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
            {translation.SemAssistir}
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
                  opacity: fadeAnim,
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
                      <ImageContainer
                        uri={selectedMovieId?.imageUrl!}
                        type={1}
                      />
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
                          key={selectedMovie?.id}
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
                            {translation.compartilhar}
                          </Text>
                        </TouchableHighlight>

                        <TouchableOpacity
                          key={3}
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
                            {translation.removeLista}
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
                        {translation.descricao}{" "}
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
                        {translation.atores}:
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.actorsContainer}
                      >
                        {selectedMovieId?.actors?.map((actor, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              openModalActor(actor.id);
                              setShowModal(false);
                            }}
                          >
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
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={{ marginTop: 30 }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {translation.VocePodeGostar}
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.actorsContainer}
                      >
                        {selectedMovieId?.similarMovies?.map((movie, index) => (
                          <View key={index} style={styles.movieCard}>
                            <TouchableOpacity
                              key={index}
                              onPress={() => {
                                closeModal();
                                handlePressItemModalType(movie);
                              }}
                            >
                              <View
                                style={[
                                  styles.imageShadowContainerMovies,
                                  {
                                    backgroundColor: theme.modalBackground,
                                  },
                                ]}
                              >
                                <Image
                                  source={{ uri: movie.imageUrl }}
                                  style={styles.MovieImage}
                                  resizeMode="cover"
                                />
                              </View>
                            </TouchableOpacity>
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
                      {translation.javiu}
                    </Text>
                    <View style={{ marginBottom: 50 }}>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          key={4}
                          style={[
                            styles.modalButton,
                            { backgroundColor: theme.borderRed },
                          ]}
                          onPress={confirmRemoveMovie}
                        >
                          <Text
                            style={[styles.textStyle, { color: theme.text }]}
                          >
                            {translation.sim}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          key={5}
                          style={[
                            styles.modalButton,
                            { backgroundColor: theme.modalBackgroundSecondary },
                          ]}
                          onPress={closeModal}
                        >
                          <Text
                            style={[styles.textStyle, { color: theme.text }]}
                          >
                            {translation.nao}
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
                  opacity: fadeAnim,
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
                      <ImageContainer
                        uri={selectedMovieId?.imageUrl!}
                        type={3}
                      />
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
                          {selectedMovieId?.rating! !== undefined &&
                            selectedMovieId?.rating! > 0.0 && (
                              <StarRating rating={selectedMovieId?.rating!} />
                            )}
                        </View>

                        <Text
                          style={[styles.modalMovieDate, { color: theme.text }]}
                        >
                          {formatDate(selectedMovieId?.date)}
                        </Text>

                        <TouchableHighlight
                          key={6}
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
                            {translation.compartilhar}
                          </Text>
                        </TouchableHighlight>
                        <ShareImageButton
                          title={selectedMovieId?.title!}
                          imageUrl={selectedMovieId?.imageUrl!}
                          rating={selectedMovieId?.rating!}
                        ></ShareImageButton>
                      </View>
                    </View>

                    {selectedMovieId?.comment! !== undefined &&
                      selectedMovieId?.rating! > 0.0 && (
                        <View
                          style={{
                            marginTop: 20,
                            backgroundColor: "rgba(0,0,0,0.15)",
                            width: "100%",
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: theme.borderBottom
                          }}
                        >
                          <Text
                            style={{
                              color: theme.text,
                              marginVertical: 10,
                              marginHorizontal: 5,
                              textAlign: "justify",
                            }}
                          >
                            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            {translation.comment}{" "}
                            </Text>
                            <Text
                              style={[
                                styles.modalText,
                                { color: theme.text, marginBottom: 30 },
                              ]}
                            >
                              {selectedMovieId?.comment}
                            </Text>
                          </Text>
                        </View>
                      )}

                    <Text
                      style={{
                        color: theme.text,
                        marginTop: 30,
                        textAlign: "justify",
                      }}
                    >
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {translation.descricao}{" "}
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
                        {translation.atores}:
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.actorsContainer}
                      >
                        {selectedMovieId?.actors?.map((actor, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              openModalActor(actor.id);
                              setShowModalMovie(false);
                            }}
                          >
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
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={{ marginTop: 30 }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {translation.VocePodeGostar}
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.actorsContainer}
                      >
                        {selectedMovieId?.similarMovies?.map((movie, index) => (
                          <View key={index} style={styles.movieCard}>
                            <TouchableOpacity
                              key={index + 1}
                              onPress={() => {
                                closeModal();
                                handlePressItemModalType(movie);
                              }}
                            >
                              <View
                                style={[
                                  styles.imageShadowContainerMovies,
                                  {
                                    backgroundColor: theme.modalBackground,
                                  },
                                ]}
                              >
                                <Image
                                  source={{ uri: movie.imageUrl }}
                                  style={styles.MovieImage}
                                  resizeMode="cover"
                                />
                              </View>
                            </TouchableOpacity>
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
                        key={7}
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
                          {translation.Fechar}
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

      <Modal
        animationType="slide"
        visible={showModalActor}
        onRequestClose={() => setShowModalActor(false)}
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
                  opacity: fadeAnim,
                }}
              >
                <View style={styles.modalInfoContent}>
                  <View style={styles.modalActorInfo}>
                    <View style={styles.modalActorTitle}>
                      <View
                        style={[
                          styles.imageActorShadowContainer,
                          { backgroundColor: theme.modalBackground },
                        ]}
                      >
                        <Image
                          style={styles.actorImageDetails}
                          source={{ uri: selectedActor?.profilePath }}
                        />
                      </View>
                      <View style={styles.titleAndDate}>
                        <Text
                          style={[
                            styles.modalMovieTitleText,
                            { color: theme.text },
                          ]}
                        >
                          {selectedActor?.name}
                        </Text>

                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 10,
                            marginVertical: 10,
                            alignItems: "center",
                            alignContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: theme.text,
                              fontWeight: "bold",
                              fontSize: 16,
                            }}
                          >
                            {translation.NasceuEm}
                          </Text>
                          <Text style={[{ color: theme.text }]}>
                            {selectedActor?.birthYear}
                          </Text>
                        </View>

                        <Text
                          style={{
                            color: theme.text,
                            fontWeight: "bold",
                            fontSize: 16,
                          }}
                        >
                          {translation.Biografia}
                        </Text>
                        <Text
                          style={[
                            styles.modalActorBiography,
                            { color: theme.text },
                          ]}
                        >
                          {selectedActor?.biography}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ marginTop: 30 }}>
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {translation.ConhecidoPor}
                    </Text>
                    <ScrollView
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      style={styles.moviesContainer}
                    >
                      {selectedActor?.movies?.map((movie, index) => (
                        <View key={index} style={styles.movieCard}>
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              openModalMovie2(movie);
                              setShowModalActor(false);
                            }}
                          >
                            <View
                              style={[
                                styles.imageShadowContainerMovies,
                                {
                                  backgroundColor: theme.modalBackground,
                                },
                              ]}
                            >
                              <Image
                                source={{ uri: movie.imageUrl }}
                                style={styles.MovieImage}
                                resizeMode="cover"
                              />
                            </View>
                            <Text
                              style={[
                                styles.modalActorsMovies,
                                { color: theme.text },
                              ]}
                            >
                              {movie.title}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View
                  style={{
                    marginBottom: 50,
                    alignSelf: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      ...styles.modalButtons,
                      alignSelf: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TouchableHighlight
                      key={8}
                      style={{
                        ...styles.modalButton,
                        backgroundColor: theme.modalBackgroundSecondary,
                        width: "65%",
                        alignSelf: "center",
                        justifyContent: "center",
                      }}
                      onPress={() => {
                        setShowModalActor(false);
                      }}
                    >
                      <Text style={styles.textStyle}>{translation.Fechar}</Text>
                    </TouchableHighlight>
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
                      // unitId={TestIds.BANNER}
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

      {/* MODAL 2 */}
      <Modal
        animationType="slide"
        visible={showModalMovie2}
        onRequestClose={closeModalMovie2}
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
                  opacity: fadeAnim,
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
                    source={{ uri: selectedMovie?.alternateImageUrl }}
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
                          source={{ uri: selectedMovie?.imageUrl }}
                        />
                      </View>
                      <View style={styles.titleAndDate}>
                        <Text
                          style={[
                            styles.modalMovieTitleText,
                            { color: theme.text },
                          ]}
                        >
                          {selectedMovie?.title}
                        </Text>
                        <Text
                          style={[styles.modalMovieDate, { color: theme.text }]}
                        >
                          {formatDate(selectedMovie?.date)}
                        </Text>

                        <TouchableHighlight
                          key={9}
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
                            {translation.compartilhar}
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
                        {translation.descricao}:{" "}
                      </Text>
                      <Text
                        style={[
                          styles.modalText,
                          {
                            color: theme.text,
                            marginBottom: 30,
                            textAlign: "justify",
                          },
                        ]}
                      >
                        {selectedMovie?.description}
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
                        {translation.atores}:
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.actorsContainer}
                      >
                        {selectedMovie?.actors?.map((actor, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              openModalActor(actor.id);
                              setShowModalMovie2(false);
                            }}
                          >
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
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={{ marginTop: 30 }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        SEMELHANTES:
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.actorsContainer}
                      >
                        {selectedMovieId?.similarMovies?.map((movie, index) => (
                          <View key={index} style={styles.movieCard}>
                            <TouchableOpacity
                              key={index}
                              onPress={() => {
                                closeModal();
                                handlePressItemModalType2(movie);
                              }}
                            >
                              <View
                                style={[
                                  styles.imageShadowContainerMovies,
                                  {
                                    backgroundColor: theme.modalBackground,
                                  },
                                ]}
                              >
                                <Image
                                  source={{ uri: movie.imageUrl }}
                                  style={styles.MovieImage}
                                  resizeMode="cover"
                                />
                              </View>
                            </TouchableOpacity>
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
                      {selectedMovie?.streamingPlatforms
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
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      {translation.AddPrompt}
                    </Text>

                    <View style={styles.modalButtonsContainer}>
                      <TouchableHighlight
                        key={10}
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.borderRed,
                        }}
                        onPress={handleAddToList}
                      >
                        <Text
                          style={[
                            styles.textStyle,
                            { color: theme.textButtons },
                          ]}
                        >
                          {translation.AddToList}
                        </Text>
                      </TouchableHighlight>

                      <TouchableHighlight
                        key={11}
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.modalBackgroundSecondary,
                        }}
                        onPress={() => setShowModalMovie2(false)}
                      >
                        <Text
                          style={[
                            styles.textStyle,
                            { color: theme.textButtons },
                          ]}
                        >
                          {translation.Fechar}
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

  //MODAL ATOR
  modalActorInfo: {},
  modalActorTitle: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginTop: 35,
  },
  imageActorShadowContainer: {
    width: isTablet ? 250 : 200,
    height: isTablet ? 360 : 280,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },
  actorImageDetails: {
    width: isTablet ? 250 : 200,
    height: isTablet ? 360 : 280,
    resizeMode: "cover",
    borderRadius: 10,
  },
  modalActorBiography: {
    fontSize: 14,
    marginTop: 10,
    textAlign: "justify",
  },
  moviesContainer: {
    width: "100%",
  },
  movieCard: {
    padding: 10,
    alignItems: "center",
  },
  imageShadowContainerMovies: {
    width: 120,
    height: 175,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },
  MovieImage: {
    width: 120,
    height: 175,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  modalActorsMovies: {
    width: 110,
    fontSize: 14,
    textAlign: "center",
    flexWrap: "wrap",
  },
});
