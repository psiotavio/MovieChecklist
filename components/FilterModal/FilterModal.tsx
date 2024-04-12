import React, { useState, useContext, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Animated,
  TouchableHighlight,
} from "react-native";
import { Button, Chip } from "react-native-paper";
import { useUser } from "../../contexts/UserContext";
import { formatDate } from "date-fns";
import { useTheme } from "../../constants/temas/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome";

const BANNER_H = 250;

type Actor = {
  id: number;
  name: string;
  profilePath?: string;
};

type StreamingPlatform = {
  id: number;
  name: string;
  logoPath?: string;
};

interface Movie {
  id: number;
  title: string;
  rating: number;
  date: string;
  imageUrl?: string;
  streamingPlatforms?: StreamingPlatform[];
  genreId?: string;
  alternateImageUrl?: string;
  description?: string;
  actors?: Actor[];
}

const FilterModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [movieDetails, setMovieDetails] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const {
    movies,
    addMovieReview,
    recommendedMovies,
    removeFromList,
    fetchMovieDetails,
    addToWatchList,
    fetchRandomMovie,
  } = useUser(); // Use o contexto de usuário
  const { theme } = useTheme();

  const scrollY = useRef(new Animated.Value(0)).current;

  // Exemplo de uso
  const platforms = {
    null: "Todos",
    "384": "Max",
    "119": "Amazon Prime Video",
    "8": "Netflix",
    "619": "Star Plus",
    "337": "Disney Plus",
    "350": "Apple TV Plus",
  };

  const generosFiltro = {
    "28": "Ação",
    "12": "Aventura",
    "16": "Animação",
    "35": "Comédia",
    "18": "Drama",
    "10751": "Família",
    "14": "Fantasia",
    "27": "Terror",
    "10402": "Música",
    "9648": "Mistério",
    "10749": "Romance",
    "878": "Ficção científica",
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();

    return `${year}`;
  };

  const handleFetchMovie = () => {
    setIsDetailsLoading(true);


    const platformIds = selectedPlatforms.length ? selectedPlatforms : []; // Map platform names to IDs if necessary

    const genreIds = selectedGenres.length > 0 ? selectedGenres : [Object.keys(generosFiltro)[Math.floor(Math.random() * Object.keys(generosFiltro).length)]];


    fetchRandomMovie({ genres: genreIds, platforms: platformIds })
      .then((movie: Movie | null) => {
        fetchMovieDetails(movie!.id, 0, (movieDetails) => {
          setIsDetailsLoading(false); // Inicia o loading
          setSelectedMovie(movieDetails);
          console.log(selectedMovie?.actors);
          setMovieDetails(false);
        });
      })
      .catch((error) => {
        console.error("Error fetching movie:", error);
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
      setModalVisible(false);
      setSelectedMovie(null);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.borderRed }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.fabTextAligner}>
          <Icon name="plus" size={20} color="white" />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setSelectedMovie(null);
          setModalVisible(!modalVisible);
        }}
        presentationStyle="pageSheet"
      >
        <ScrollView
          style={[
            styles.scrollView,
            { backgroundColor: theme.modalBackground },
          ]}
        >
          {!selectedMovie || isDetailsLoading ? (
            <View style={styles.filterContainer}>
              <Text
                style={[
                  styles.header,
                  { color: theme.text, textAlign: "center" },
                ]}
              >
                Selecione os Filtros
              </Text>
              <Text style={[styles.subHeader, { color: theme.text }]}>
                Gêneros
              </Text>
              <View style={styles.chips}>
                {Object.entries(generosFiltro).map(([key, value]) => (
                  <Chip
                    style={
                      selectedGenres.includes(key)
                        ? { backgroundColor: theme.borderRed }
                        : undefined
                    }
                    rippleColor="rgba(0, 0, 0, 0.3)"
                    key={key}
                    selected={selectedGenres.includes(key)}
                    onPress={() =>
                      setSelectedGenres((prev) =>
                        prev.includes(key)
                          ? prev.filter((g) => g !== key)
                          : [...prev, key]
                      )
                    }
                  >
                    {value}
                  </Chip>
                ))}
              </View>

              <Text style={[styles.subHeader, { color: theme.text }]}>
                Plataformas
              </Text>
              <View style={styles.chips}>
                {Object.entries(platforms).map(([id, name]) => (
                  <Chip
                    style={
                      selectedPlatforms.includes(id)
                        ? { backgroundColor: theme.borderRed }
                        : undefined
                    }
                    rippleColor="rgba(0, 0, 0, 0.3)"
                    key={id}
                    selected={selectedPlatforms.includes(id)}
                    showSelectedOverlay={true}
                    onPress={() =>
                      setSelectedPlatforms((prev) =>
                        prev.includes(id)
                          ? prev.filter((p) => p !== id)
                          : [...prev, id]
                      )
                    }
                  >
                    {name}
                  </Chip>
                ))}
              </View>

              <View style={{marginVertical: 40}}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.borderRed },
                  ]}
                  onPress={handleFetchMovie}
                >
                  <Text
                    style={{ color: theme.textButtons, textAlign: "center" }}
                  >
                    Buscar Filme
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.movieDetailsContainer}>
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: BANNER_H + 50,
                  }}
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
                      <Image
                        style={styles.movieImageDetails}
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

                        <TouchableOpacity
                          style={[
                            styles.modalButton,
                            { backgroundColor: theme.borderRed },
                          ]}
                          onPress={handleAddToList}
                        >
                          <Text
                            style={{ color: theme.text, textAlign: "center" }}
                          >
                            Assistir mais tarde
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
                        Descrição:{" "}
                      </Text>
                      <Text
                        style={[
                          styles.modalText,
                          { color: theme.text, marginBottom: 30 },
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
                          ?.map((actor: { name: any }) => actor.name)
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
                      Você assistiu esse filme?
                    </Text>
                    <View style={{ marginBottom: 50 }}>
                      <View style={styles.modalButtons}>
                        <TouchableHighlight
                          style={{
                            ...styles.modalButton,
                            backgroundColor: theme.borderRed,
                          }}
                          onPress={handleFetchMovie}
                        >
                          <Text style={styles.textStyle}>
                            Sortear novamente
                          </Text>
                        </TouchableHighlight>

                        <TouchableHighlight
                          style={{
                            ...styles.modalButton,
                            backgroundColor: theme.modalBackgroundSecondary,
                          }}
                          onPress={() => {
                            setModalVisible(false);
                            setSelectedMovie(null);
                          }}
                        >
                          <Text style={styles.textStyle}>Cancelar</Text>
                        </TouchableHighlight>
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
        </ScrollView>
      </Modal>
    </>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  fab: {
    width: 70,
    height: 70,
    backgroundColor: "#6200ee",
    borderRadius: 100,

    justifyContent: "center",
    alignItems: "center",
  },
  fabTextAligner: {
    flex: 1,
    justifyContent: "center",
  },
  fabIcon: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
    textAlignVertical: "center",
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  movieDetailsContainer: {
    flex: 1,
  },
  chips: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 5,
    columnGap: 10,
    justifyContent: "center",
  },

  // Estilos do modal
  movieImageDetails: {
    width: 85,
    height: 130,
    resizeMode: "cover",
    borderRadius: 10,
  },
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
    marginBottom: 30,
  },
  modalButton: {
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 8,
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
