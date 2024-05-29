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
  Animated,
  Share,
  Platform,
  Dimensions,
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import logoDefault from "../../assets/images/logo.png";
import logoBlue from "../../assets/images/logoBlue.png";
import logoPink from "../../assets/images/logoPink.png";
import logoGreen from "../../assets/images/logoGreen.png";
import logoRed from "../../assets/images/logoRed.png";
import logoOrange from "../../assets/images/logoOrange.png";
import { useTheme } from "../../constants/temas/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConfiguration } from "../../contexts/ConfigurationContext";
import ImageContainer from "../../components/imageContainer/imageContainer";
import CustomModalMovie from "../../components/ModalMovie/customModalMovie";
import CustomModalActor from "../../components/ModalMovie/customModalActor";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768; // Um critério comum para tablets

type Actor = {
  id: number;
  name: string;
  profilePath?: string; // URL para a foto do perfil do ator, se disponível
  biography?: string;
  birthYear?: string;
  movies?: Movie[];
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
}

type StreamingPlatform = {
  id: number;
  name: string;
  logoPath?: string;
};

export default function TabThreeScreen() {
  const {translation, language } = useConfiguration();
  const { theme, themeName } = useTheme();

   // Definindo logos para diferentes temas
   const logos = {
    default: logoDefault,
    dark:  logoDefault,
    light:   logoDefault,
    blue:  logoBlue,
    orange:  logoOrange,
    pink:  logoPink,
    lightpink:  logoPink,
    green: logoGreen,
    deepPurple:  logoDefault,
    red:  logoRed,
  };

  // Selecionar logo com base no tema atual
  const logo = logos[themeName] || logos.default;


  const {
    recommendedMovies,
    recommendedByGenre,
    addToWatchList,
    removeFromRecommendedMovies,
    fetchMovieDetails,
    fetchActorDetails,
    fetchMoviesByGenreAndPage, // Adicione isso
    paginationState, // Adicione isso
  } = useUser(); // Supondo que `addToWatchList` é o método do contexto
  const [selectedGenre, setSelectedGenre] = useState(
    translation.RecommendedForYou
  );
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado para controlar a visibilidade do modal
  const [showModalActor, setShowModalActor] = useState(false); // Estado para controlar a visibilidade do modal
  const [genres, setGenres] = useState([
    translation.RecommendedForYou,
  ]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);

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

  const [selectedPlatform, setSelectedPlatform] = useState(
    translation.All
  );

  const platforms = [
    translation.All,
    "Max",
    "Amazon Prime Video",
    "Netflix",
    "Star Plus",
    "Disney Plus",
    "Apple TV Plus",
  ];

  interface GenreMappings {
    [key: string]: string;
  }

  const generosFiltro: GenreMappings = {
    "28": translation.Action,
    "12": translation.Adventure,
    "16": translation.Animation,
    "35": translation.Comedy,
    "18": translation.Drama,
    "10751": translation.Family,
    "14": translation.Fantasy,
    "27": translation.Horror,
    "10402": translation.Music,
    "9648": translation.Mystery,
    "878": translation.ScienceFiction,
    "10749": translation.Romance, // Adicionando o gênero Romance
  };

  useEffect(() => {
    if (selectedGenre !== translation.RecommendedForYou) {
      const currentGenreId = Object.keys(generosFiltro).find(
        (key) => generosFiltro[key] === selectedGenre
      );
      fetchMoviesByGenreAndPage(currentGenreId!, 1);
    }
  }, [selectedGenre, language]); // Dependências do useEffect

  const getFilteredMovies = () => {
    let allMovies = [];

    if (selectedGenre === translation.RecommendedForYou) {
      // Se for "Recomendado para você", usar a lista geral de recomendados
      allMovies = [...recommendedMovies];
    } else {
      const recommendedBySelectedGenre = recommendedMovies.filter((movie) =>
        movie.genreId?.split(",").some((genreId) => genreId === selectedGenre)
      );

      // Combina filmes recomendados do gênero selecionado com os filmes populares do mesmo gênero
      allMovies = [
        ...recommendedBySelectedGenre,
        ...(recommendedByGenre[selectedGenre] || []),
      ];

      //  allMovies.map((moviesS) => console.log(moviesS.title));
    }

    // Remove duplicatas
    allMovies = Array.from(
      new Map(allMovies.map((movie) => [movie.id, movie])).values()
    );

    // Filtrar por plataforma, se necessário
    if (selectedPlatform !== translation.All) {
      allMovies = allMovies.filter((movie) =>
        movie.streamingPlatforms?.some(
          (platform) => platform.name === selectedPlatform
        )
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
    // Converte o objeto generosFiltro para uma lista de nomes de gêneros
    const genreNames = Object.values(generosFiltro);

    // Inclui "Recomendado para você" como a primeira opção
    setGenres([translation.RecommendedForYou, ...genreNames]);
  }, [language]); // Esse useEffect depende apenas de generosFiltro, que é estático, então ele roda uma vez

  useEffect(() => {
    const moviesToCheck =
      selectedGenre === translation.RecommendedForYou
        ? recommendedMovies
        : recommendedByGenre[selectedGenre];
    setIsLoading(!moviesToCheck);
  }, [recommendedMovies]);

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

  useEffect(() => {}, [selectedMovie]);

  useEffect(() => {
    // Atualize os gêneros quando a linguagem mudar
    const genreNames = Object.values(generosFiltro);
    setGenres([translation.RecommendedForYou, ...genreNames]);

    // Atualize o gênero selecionado e a plataforma
    setSelectedGenre(translation.RecommendedForYou);
    setSelectedPlatform(translation.All);
  }, [language]); // Dependências do useEffect

  const handleShare = () => {
    if (!selectedMovie) return; // Certifique-se de que há um filme selecionado

    const message = `> ${translation.RecommendMovie} \n\n*${selectedMovie.title}* \n${selectedMovie.description}

    \nLINK: watchfolio.com.br/movie/${selectedMovie.id}/?popup=true`;
    Share.share({
      message,
    }).catch((error) => console.error("Error sharing:", error));
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

        streamingPlatforms: selectedMovie.streamingPlatforms, // Adicionado aqui

        genreId: selectedMovie.genreId,
        alternateImageUrl: selectedMovie.alternateImageUrl, // Nova propriedade para o banner do filme
        description: selectedMovie.description, // Descrição do filme
        actors: selectedMovie.actors, // Novo
      };
      removeFromRecommendedMovies(selectedMovie.id);
      addToWatchList(toWatch);
      closeModal();
      setSelectedMovie(null);
    }
  };


  const handleLoadMore = async () => {
    if (
      selectedGenre != translation.RecommendedForYou &&
      selectedPlatform == translation.All
    ) {
      const currentGenreId =
        Object.keys(generosFiltro).find(
          (key) => generosFiltro[key] === selectedGenre
        ) || ""; // Isso converte o nome do gênero de volta para seu ID correspondente
      // console.log(currentGenreId);
      const currentPage = paginationState[currentGenreId]?.page || 0;
      await fetchMoviesByGenreAndPage(currentGenreId, currentPage + 1);
    } else if (
      selectedGenre != translation.RecommendedForYou &&
      selectedPlatform != translation.All
    ) {
      const currentGenreId =
        Object.keys(generosFiltro).find(
          (key) => generosFiltro[key] === selectedGenre
        ) || ""; // Isso converte o nome do gênero de volta para seu ID correspondente
      // console.log(currentGenreId);
      const currentPage = paginationState[currentGenreId]?.page || 0;

      setTimeout(() => {
        fetchMoviesByGenreAndPage(currentGenreId, currentPage + 1);
      }, 3000);
    }
  };

  const handlePressItemModalType = (item: any) => {
    setShowModal(false); // Feche o modal atual
    setTimeout(() => {
      fetchMovieDetails(item.id, 0, (movieDetails) => {
        setSelectedMovie(movieDetails);
        setIsDetailsLoading(false); // Carregamento concluído
        openModal(movieDetails.id);
      });
    }, 300); // Adicione um pequeno atraso para garantir que o modal foi fechado
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setShowModal(false);
  };
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
          {selectedPlatform === translation.All
            ? translation.Todas
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
                    if (platform === translation.All) {
                      setSelectedPlatform(translation.All);
                    } else {
                      setSelectedPlatform(platform);
                    }
                    setShowPlatformDropdown(false); 
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
          numColumns={isTablet ? 4 : 3}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          initialNumToRender={6} // Ajuste conforme necessário
          maxToRenderPerBatch={2} // Ajuste conforme necessário
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <View style={styles.movieItem}>
              <TouchableOpacity onPress={() => openModal(item.id)}>
                <ImageContainer uri={item.imageUrl!} type={1} />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text
          style={[styles.movieListTitle, { color: theme.text, marginTop: 50 }]}
        >
          {translation.NoRecommendations}
        </Text>
      )}
      <CustomModalMovie
        showModal={showModal}
        isDetailsLoading={isDetailsLoading}
        selectedMovie={selectedMovie!}
        closeModal={closeModal}
        handleShare={handleShare}
        handleAddToList={handleAddToList}
        openModalActor={openModalActor}
        handlePressItemModalType={handlePressItemModalType}
        formatDate={formatDate}
      />
      <CustomModalActor
        showModalActor={showModalActor}
        isDetailsLoading={isDetailsLoading}
        selectedActor={selectedActor!}
        closeModal={() => setShowModalActor(false)}
        openModal={openModal}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
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
  movieImageRecommend: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  imageShadowContainer: {
    width: isTablet ? 150 : 100,
    height: isTablet ? 230 : 150,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },
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
  actorsContainer: {
    width: "100%",
  },
  actorCard: {
    padding: 10,
    alignItems: "center",
  },
  modalButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 30,
    paddingHorizontal: 35,
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
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
});
