import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  View,
  Button,
  Animated,
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import logo from "../../assets/images/logo.png";
import { useTheme } from "../../constants/temas/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";

// import {
//   AdEventType,
//   InterstitialAd,
//   TestIds,
//   BannerAd,
// } from "react-native-google-mobile-ads";

const BANNER_H = 250;

// const anuncio = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
//   requestNonPersonalizedAdsOnly: true,
// });

// const adUnitId = __DEV__ ? TestIds.BANNER : "your-ad-unit-id-here";

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

export default function TabThreeScreen() {

  // // ANUNCIOS
  // const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  // const [counter, setCounter] = useState(0);

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

  const {
    recommendedMovies,
    recommendedByGenre,
    addToWatchList,
    removeFromRecommendedMovies,
    fetchMovieDetails,
  } = useUser(); // Supondo que `addToWatchList` é o método do contexto
  const [selectedGenre, setSelectedGenre] = useState("Recomendado para você");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado para controlar a visibilidade do modal
  const [genres, setGenres] = useState(["Recomendado para você"]);
  const { theme } = useTheme();
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

  const [selectedPlatform, setSelectedPlatform] = useState("Todos");
  const platforms = [
    "Todos",
    "Max",
    "Amazon Prime Video",
    "Netflix",
    "Star Plus",
    "Disney Plus",
    "Apple TV Plus",
  ];

  const getFilteredMovies = () => {
    let allMovies = [];
  
    // Combine os filmes recomendados e os populares para o gênero selecionado
    if (selectedGenre === "Recomendado para você") {
      allMovies = [...recommendedMovies];
    } else {
      allMovies = [...(recommendedByGenre[selectedGenre] || []), ...recommendedMovies];
    }
  
    // Remove duplicatas baseado no ID do filme
    allMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());
  
    // Filtro por plataforma, se necessário
    if (selectedPlatform !== "Todos") {
      allMovies = allMovies.filter(movie =>
        movie.streamingPlatforms?.some(platform => platform.name === selectedPlatform)
      );
    }
  
    return allMovies;
  };
  
  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();

    return `${year}`;
  };

  useEffect(() => {
    if (Object.keys(recommendedByGenre).length) {
      setGenres(["Recomendado para você", ...Object.keys(recommendedByGenre)]);
    }
  }, [recommendedByGenre]);

  useEffect(() => {
    const moviesToCheck =
      selectedGenre === "Recomendado para você"
        ? recommendedMovies
        : recommendedByGenre[selectedGenre];
    setIsLoading(!moviesToCheck || moviesToCheck.length === 0);
  }, [recommendedMovies, selectedGenre]);

  const openModal = (movieId: number) => {
    setSelectedMovie(null); // Reseta o filme selecionado
    setIsDetailsLoading(true); // Inicia o loading
    setShowModal(true); // Abre o modal
  
    // Chamada para fetchMovieDetails sem a verificação de showModal
    fetchMovieDetails(movieId, 0, (movieDetails) => {
      setSelectedMovie(movieDetails);
      setIsDetailsLoading(false);
    });
  };
  

  useEffect(() => {}, [selectedMovie]);

  const handleAddToList = () => {
    if (selectedMovie) {
      const toWatch: Movie = {
        id: selectedMovie.id,
        title: selectedMovie.title,
        date: new Date().toLocaleDateString(),
        rating: 0,
        imageUrl: selectedMovie.imageUrl,
        rank: selectedMovie.rank,

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

      removeFromRecommendedMovies(selectedMovie.id);
      addToWatchList(toWatch);
      // setCounter(counter + 1);
      closeModal();
      setSelectedMovie(null);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setShowModal(false);
  };

  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Image source={logo} style={styles.logo} />
      <TouchableOpacity
        style={[styles.dropdownButton, { borderColor: theme.borderRed }]}
        onPress={() => setShowDropdown(true)}
      >
        <Text style={[styles.dropdownButtonText, { color: theme.text }]}>
          {selectedGenre}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.dropdownButton, { borderColor: theme.borderRed }]}
        onPress={() => setShowPlatformDropdown(true)} // Use um novo estado para controlar a visibilidade do dropdown de plataformas
      >
        <Text style={[styles.dropdownButtonText, { color: theme.text }]}>
          {selectedPlatform === "Todos"
            ? "Todas as Plataformas"
            : selectedPlatform}
        </Text>
      </TouchableOpacity>

      {/* Modal para Seleção de Plataforma */}
      <Modal
        visible={showPlatformDropdown} // Este é o novo estado para controle do dropdown de plataformas
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowPlatformDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPressOut={() => setShowPlatformDropdown(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: theme.modalBackground,
                borderColor: theme.borderRed,
              },
            ]}
          >
            <ScrollView>
              {platforms.map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.dropdownItem,
                    { backgroundColor: theme.modalBackground },
                  ]}
                  onPress={() => {
                    if (platform === "Todos") {
                      setSelectedPlatform("Todos");
                    } else {
                      // Aqui você precisaria encontrar o objeto de plataforma correspondente
                      // Isso é apenas um exemplo e precisa ser adaptado com base em seus dados
                      setSelectedPlatform(platform);
                    }
                    setShowPlatformDropdown(false); // Garanta que esta função está definida e muda o estado corretamente
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.text, borderBottomColor: theme.borderRed },
                    ]}
                  >
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPressOut={() => setShowDropdown(false)}
        >
          <View
            style={[
              styles.dropdown,
              ,
              {
                backgroundColor: theme.modalBackground,
                borderColor: theme.borderRed,
              },
            ]}
          >
            <ScrollView>
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.dropdownItem,
                    { backgroundColor: theme.modalBackground },
                  ]}
                  onPress={() => {
                    setSelectedGenre(genre);
                    setShowDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.text, borderBottomColor: theme.borderRed },
                    ]}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Text style={[styles.movieListTitle, { color: theme.text }]}>
        {selectedGenre.toUpperCase()}
      </Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.borderRed} />
      ) : getFilteredMovies().length > 0 ? (
        <FlatList
          data={getFilteredMovies()}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.movieItem}>
              <TouchableOpacity onPress={() => openModal(item.id)}>
                <View
                  style={[
                    styles.imageShadowContainer,
                    { backgroundColor: theme.modalBackground },
                  ]}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.movieImageRecommend}
                      source={{ uri: item.imageUrl }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text
          style={[styles.movieListTitle, { color: theme.text, marginTop: 50 }]}
        >
          Não há nenhuma recomendação no momento...
        </Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          {isDetailsLoading ? (
            <View
              style={[
                styles.modalContent,
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
                styles.modalContent,
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: BANNER_H + 150,
                  }}
                >
                  <Animated.View
                    style={{
                      backgroundColor: theme.modalThemeMode,
                      height: 50,
                      width: "200%",
                      alignSelf: "center",
                      shadowColor: theme.modalThemeMode,
                      shadowOffset: { width: 0, height: 45 },
                      shadowOpacity: 1,
                      shadowRadius: 5,
                      zIndex: 9999,
                      transform: [
                        {
                          translateY: scrollY.interpolate({
                            inputRange: [-50, 0, 50],
                            outputRange: [-100 / 2, 0, 0], // Previne movimento para cima
                          }),
                        },
                        {
                          scale: scrollY.interpolate({
                            inputRange: [-50, 0],
                            outputRange: [2, 1], // Permite expansão ao puxar para baixo
                            extrapolateRight: "clamp", // Previne que a escala se ajuste além do especificado
                          }),
                        },
                      ],
                    }}
                  >
                    <Animated.View
                      style={{
                        backgroundColor: theme.modalThemeMode,
                        height: 30,
                        width: "200%",
                        alignSelf: "center",
                        shadowColor: theme.modalThemeMode,
                        shadowOffset: { width: 0, height: 40 },
                        shadowOpacity: 1,
                        shadowRadius: 10,
                        zIndex: 9999,
                      }}
                    ></Animated.View>
                  </Animated.View>

                  <Animated.View
                    style={{
                      backgroundColor: theme.modalThemeMode,
                      height: 10,
                      width: "200%",
                      alignSelf: "center",
                      shadowColor: theme.modalThemeMode,
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 1,
                      shadowRadius: 20,
                      zIndex: 9999,
                    }}
                  ></Animated.View>

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
                      <Image
                        style={styles.movieImage}
                        source={{ uri: selectedMovie?.imageUrl }}
                      />
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
                        Descrição:{" "}
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

                    <Text style={{ color: theme.text, marginTop: 30 }}>
                      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        Atores:{" "}
                      </Text>
                      <Text style={styles.modalMovieTitleTextActors}>
                        {selectedMovie?.actors
                          ?.map((actor) => actor.name)
                          .join(", ")}
                      </Text>
                    </Text>

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
                      Deseja adicionar este item à lista?
                    </Text>

                    <View style={styles.modalButtonsContainer}>
                      <View
                        style={[
                          styles.buttonContainer,
                          { backgroundColor: theme.borderRed },
                        ]}
                      >
                        <Button
                          title="Adicionar à lista"
                          onPress={handleAddToList}
                          color={theme.text}
                        />
                      </View>
                      <View
                        style={[
                          styles.buttonContainer,
                          { backgroundColor: theme.modalBackgroundSecondary },
                        ]}
                      >
                        <Button
                          title="Cancelar"
                          onPress={closeModal}
                          color={theme.textButtons}
                        />
                      </View>
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
  container: {
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logo: {
    width: 80,
    height: 80,
    marginVertical: 10,
    marginBottom: 40,
    resizeMode: "contain",
  },
  listRecommend: {
    backgroundColor: "red",
  },
  dropdownButton: {
    width: "90%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2.5,
    borderRadius: 20,
    marginBottom: 20,
  },
  dropdownButtonText: {
    fontSize: 18,
    textAlign: "center",
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dropdown: {
    width: "80%",
    maxHeight: "60%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
  },
  dropdownItem: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0,0,0,0.2)",
  },
  dropdownItemText: {
    textAlign: "center",
    fontSize: 18,
  },
  movieListTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 16,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  movieItem: {
    margin: 10,
    alignItems: "center",
  },
  movieImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
    resizeMode: "cover",
  },
  movieImageRecommend: {
    width: "100%", // Usa 100% do contêiner de sombra
    height: "100%", // Usa 100% do contêiner de sombra
    borderRadius: 10,
    resizeMode: "cover",
  },
  imageShadowContainer: {
    width: 100,
    height: 150,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000", // Cor da sombra
    shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
    shadowOpacity: 1, // Opacidade da sombra
    shadowRadius: 3, // Raio da sombra
    elevation: 5, // Adiciona sombra no Android
  },

  imageContainer: {
    width: "100%", // Usa 100% do contêiner de sombra
    height: "100%", // Usa 100% do contêiner de sombra
    borderRadius: 10, // Arredonda as bordas da imagem
    overflow: "hidden", // Mantém a imagem dentro do contorno arredondado
  },

  movieImageBanner: {
    width: "100%",
    flex: 1,
    resizeMode: "cover",
    marginBottom: 30,
  },

  // Estilos do modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.60)",
  },
  modalContent: {
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
});
