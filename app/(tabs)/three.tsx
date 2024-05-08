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
  Share,
  Platform,
  TouchableHighlight,
  Dimensions,
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import logo from "../../assets/images/logo.png";
import { useTheme } from "../../constants/temas/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { set } from "date-fns";
import { useConfiguration } from "../../contexts/ConfigurationContext";

// import {
//   AdEventType,
//   InterstitialAd,
//   TestIds,
//   BannerAd,
// } from "react-native-google-mobile-ads";

const { width, height } = Dimensions.get("window");

const isTablet = width >= 768; // Um critério comum para tablets

const BANNER_H = isTablet ? 400 : 250;

// const anuncio = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
//   requestNonPersonalizedAdsOnly: true,
// });

// let adUnitId: string;

// if (Platform.OS === 'ios') {
//     adUnitId = "ca-app-pub-1771446730721916/1536500762"; // Coloque o ID do iOS aqui
// } else if (Platform.OS === 'android') {
//     adUnitId = "ca-app-pub-1771446730721916/6230272284"; // Coloque o ID do Android aqui
// }

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

  const { language } = useConfiguration();

  const translation = {
    english: {
      Action: "Action",
      Adventure: "Adventure",
      Animation: "Animation",
      Comedy: "Comedy",
      Drama: "Drama",
      Family: "Family",
      Fantasy: "Fantasy",
      Horror: "Horror",
      Music: "Music",
      Mystery: "Mystery",
      ScienceFiction: "Science Fiction",
      All: "All",
      RecommendedForYou: "Recommended for You",
      Description: "Description",
      Share: "Share",
      Actors: "Actors",
      AddPrompt: "Do you want to add this item to the list?",
      AddToList: "Add to List",
      Cancel: "Cancel",
      Todas: "All Platforms",
      NoRecommendations: "There are no recommendations at the moment...",
    },
    portuguese: {
      Action: "Ação",
      Adventure: "Aventura",
      Animation: "Animação",
      Comedy: "Comédia",
      Drama: "Drama",
      Family: "Família",
      Fantasy: "Fantasia",
      Horror: "Terror",
      Music: "Música",
      Mystery: "Mistério",
      ScienceFiction: "Ficção científica",
      All: "Todos",
      RecommendedForYou: "Recomendado para você",
      Description: "Descrição",
      Share: "Compartilhar",
      Actors: "Atores",
      AddPrompt: "Deseja adicionar este item à lista?",
      AddToList: "Adicionar à lista",
      Cancel: "Cancelar",
      Todas: "Todas as Plataformas",
      NoRecommendations: "Não há nenhuma recomendação no momento...",
    },
    spanish: {
      Action: "Acción",
      Adventure: "Aventura",
      Animation: "Animación",
      Comedy: "Comedia",
      Drama: "Drama",
      Family: "Familia",
      Fantasy: "Fantasía",
      Horror: "Terror",
      Music: "Música",
      Mystery: "Misterio",
      ScienceFiction: "Ciencia ficción",
      All: "Todos",
      RecommendedForYou: "Recomendado para ti",
      Description: "Descripción",
      Share: "Compartir",
      Actors: "Actores",
      AddPrompt: "¿Deseas agregar este artículo a la lista?",
      AddToList: "Agregar a la lista",
      Cancel: "Cancelar",
      Todas: "Todas las Plataformas",
      NoRecommendations: "No hay recomendaciones en este momento...",
    },
    french: {
      Action: "Action",
      Adventure: "Aventure",
      Animation: "Animation",
      Comedy: "Comédie",
      Drama: "Drame",
      Family: "Famille",
      Fantasy: "Fantaisie",
      Horror: "Horreur",
      Music: "Musique",
      Mystery: "Mystère",
      ScienceFiction: "Science-fiction",
      All: "Tous",
      RecommendedForYou: "Recommandé pour vous",
      Description: "Description",
      Share: "Partager",
      Actors: "Acteurs",
      AddPrompt: "Voulez-vous ajouter cet article à la liste?",
      AddToList: "Ajouter à la liste",
      Cancel: "Annuler",
      Todas: "Toutes les Plateformes",
      NoRecommendations: "Il n'y a aucune recommandation pour le moment...",
    },
    german: {
      Action: "Aktion",
      Adventure: "Abenteuer",
      Animation: "Animation",
      Comedy: "Komödie",
      Drama: "Drama",
      Family: "Familie",
      Fantasy: "Fantasie",
      Horror: "Horror",
      Music: "Musik",
      Mystery: "Geheimnis",
      ScienceFiction: "Wissenschaftsfiktion",
      All: "Alle",
      RecommendedForYou: "Für dich empfohlen",
      Description: "Beschreibung",
      Share: "Teilen",
      Actors: "Schauspieler",
      AddPrompt: "Möchten Sie diesen Artikel zur Liste hinzufügen?",
      AddToList: "Zur Liste hinzufügen",
      Cancel: "Abbrechen",
      Todas: "Alle Plattformen",
      NoRecommendations: "Es gibt derzeit keine Empfehlungen...",
    },
  };

  const {
    recommendedMovies,
    recommendedByGenre,
    addToWatchList,
    removeFromRecommendedMovies,
    fetchMovieDetails,

    fetchMoviesByGenreAndPage, // Adicione isso
    paginationState, // Adicione isso
  } = useUser(); // Supondo que `addToWatchList` é o método do contexto
  const [selectedGenre, setSelectedGenre] = useState(
    translation[language].RecommendedForYou
  );
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado para controlar a visibilidade do modal
  const [genres, setGenres] = useState([
    translation[language].RecommendedForYou,
  ]);
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

  const [selectedPlatform, setSelectedPlatform] = useState(
    translation[language].All
  );

  const platforms = [
    translation[language].All,
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
    "28": translation[language].Action,
    "12": translation[language].Adventure,
    "16": translation[language].Animation,
    "35": translation[language].Comedy,
    "18": translation[language].Drama,
    "10751": translation[language].Family,
    "14": translation[language].Fantasy,
    "27": translation[language].Horror,
    "10402": translation[language].Music,
    "9648": translation[language].Mystery,
    "878": translation[language].ScienceFiction,
  };

  useEffect(() => {
    if (selectedGenre !== translation[language].RecommendedForYou) {
      const currentGenreId = Object.keys(generosFiltro).find(
        (key) => generosFiltro[key] === selectedGenre
      );
      fetchMoviesByGenreAndPage(currentGenreId!, 1);
    }
  }, [selectedGenre, language]); // Dependências do useEffect

  const getFilteredMovies = () => {
    let allMovies = [];

    if (selectedGenre === translation[language].RecommendedForYou) {
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
    if (selectedPlatform !== translation[language].All) {
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
    setGenres([translation[language].RecommendedForYou, ...genreNames]);
  }, [language]); // Esse useEffect depende apenas de generosFiltro, que é estático, então ele roda uma vez

  useEffect(() => {
    const moviesToCheck =
      selectedGenre === translation[language].RecommendedForYou
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

  useEffect(() => {}, [selectedMovie]);

  const handleShare = () => {
    if (!selectedMovie) return; // Certifique-se de que há um filme selecionado

    const message = `> Recomendo esse filme:\n\n*${selectedMovie.title}* \n${selectedMovie.description}

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

  // COMPARTILHAR FILME IMPLEMENATAR NA V2.0

  // const handleShareMovie = async () => {
  //   try {
  //     // Substitua 'linkDoFilme' pelo link específico para o seu app que abre o modal do filme
  //     const linkDoFilme = `com.psiotavio.MovieChecklist://filme/${selectedMovie?.id}`;
  //     const mensagem = `Assista ${selectedMovie?.title}\n\n${selectedMovie?.description}\n\nAdicione esse filme na sua lista Watchfolio: ${linkDoFilme}`;

  //     await Share.share({
  //       message: mensagem,
  //     });
  //   } catch (error) {
  //     console.error("Erro ao compartilhar o filme: ", error);
  //   }
  // };

  // useEffect(() => {
  //   const handleDeepLink = (event: { url: any; }) => {
  //     const regex = /com.psiotavio.MovieChecklist:\/\/filme\/(\d+)/;
  //     const match = event.url.match(regex);
  //     if (match && match[1]) {
  //       const filmeId = parseInt(match[1], 10);
  //       openModal(filmeId);
  //     }
  //   };

  //   // Escute pela URL inicial caso o app seja aberto por um deep link
  //   Linking.getInitialURL().then((url) => {
  //     if (url) handleDeepLink({ url });
  //   });

  //   // Adiciona um listener para novos deep links enquanto o app está em uso
  //   const subscription = Linking.addEventListener('url', handleDeepLink);

  //   // Remove o listener ao desmontar
  //   return () => subscription.remove();
  // }, []);

  //TESTES
  const handleLoadMore = async () => {
    if (
      selectedGenre != translation[language].RecommendedForYou &&
      selectedPlatform == translation[language].All
    ) {
      const currentGenreId =
        Object.keys(generosFiltro).find(
          (key) => generosFiltro[key] === selectedGenre
        ) || ""; // Isso converte o nome do gênero de volta para seu ID correspondente
     // console.log(currentGenreId);
      const currentPage = paginationState[currentGenreId]?.page || 0;
      await fetchMoviesByGenreAndPage(currentGenreId, currentPage + 1);
    } else if (
      selectedGenre != translation[language].RecommendedForYou &&
      selectedPlatform != translation[language].All
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
          {selectedPlatform === translation[language].All
            ? translation[language].Todas
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
                    if (platform === translation[language].All) {
                      setSelectedPlatform(translation[language].All);
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
          numColumns={isTablet ? 4 : 3}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
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
          {translation[language].NoRecommendations}
        </Text>
      )}

      <Modal
        animationType="slide"
        visible={showModal}
        onRequestClose={closeModal}
        presentationStyle="pageSheet"
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
                            {translation[language].Share}
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
                        {translation[language].Description}:{" "}
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
                        {translation[language].Actors}:
                      </Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.actorsContainer}
                      >
                        {selectedMovie?.actors?.map((actor, index) => (
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
                      {translation[language].AddPrompt}
                    </Text>

                    <View style={styles.modalButtonsContainer}>
                      <TouchableHighlight
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
                          {translation[language].AddToList}
                        </Text>
                      </TouchableHighlight>

                      <TouchableHighlight
                        style={{
                          ...styles.modalButton,
                          backgroundColor: theme.modalBackgroundSecondary,
                        }}
                        onPress={handleAddToList}
                      >
                        <Text
                          style={[
                            styles.textStyle,
                            { color: theme.textButtons },
                          ]}
                        >
                          {translation[language].Cancel}
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
    width: isTablet ? 150 : 100,
    height: isTablet ? 230 : 150,
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

  modalButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 30,
    paddingHorizontal: 35,
  },

  //IPAD
  text: {
    fontSize: isTablet ? 24 : 16,
  },
  image: {
    width: isTablet ? 200 : 100,
    height: isTablet ? 200 : 100,
  },
});
