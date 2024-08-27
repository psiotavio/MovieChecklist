import React, { useState, useContext, useRef, useEffect } from "react";
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
  Platform,
  Share,
  Dimensions,
} from "react-native";
import { Button, Chip } from "react-native-paper";
import { useUser } from "../../contexts/UserContext";
import { formatDate } from "date-fns";
import { useTheme } from "../../constants/temas/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome6";
import { FontAwesome } from "@expo/vector-icons";
import { useConfiguration } from "../../contexts/ConfigurationContext";
import CustomModalActor from "../ModalMovie/customModalActor";
import CustomModalMovie from "../ModalMovie/customModalMovie";

import { BannerAd } from "react-native-google-mobile-ads";

//  // ANUNCIOS
let adUnitId: string;

if (Platform.OS === "ios") {
  adUnitId = "ca-app-pub-4303499199669342/6006099901"; // Coloque o ID do iOS aqui
} else if (Platform.OS === "android") {
  adUnitId = "ca-app-pub-4303499199669342/1108657138"; // Coloque o ID do Android aqui
}

const { width, height } = Dimensions.get("window");

const isTablet = width >= 768; // Um critério comum para tablets

const BANNER_H = isTablet ? 400 : 250;

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
  comment: string;
}

const FilterModal = () => {
  const [showModalMovie, setShowModalMovie] = useState(false); // Estado para controlar a visibilidade do modal
  const [showModalActor, setShowModalActor] = useState(false); // Estado para controlar a visibilidade do modal
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [movieDetails, setMovieDetails] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const {
    fetchActorDetails,
    fetchMovieDetails,
    addToWatchList,
    fetchRandomMovie,
  } = useUser(); // Use o contexto de usuário
  const { theme } = useTheme();

  const scrollY = useRef(new Animated.Value(0)).current;

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
      Romance: "Romance",
      RecommendMovie: "I recommend this movie:",
      SelectFilters: "Select Filters",
      Genres: "Genres",
      Platforms: "Platforms",
      SearchMovie: "Search Movie",
      Share: "Share",
      WatchLater: "Watch Later",
      Description: "Description:",
      Actors: "Actors:",
      YouWatchedThisMovie: "You have watched this movie",
      DrawAgain: "Draw Again",
      Cancel: "Cancel",
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
      Romance: "Romance",
      RecommendMovie: "Recomendo esse filme:",
      SelectFilters: "Selecione os Filtros",
      Genres: "Gêneros",
      Platforms: "Plataformas",
      SearchMovie: "Buscar Filme",
      Share: "Compartilhar",
      WatchLater: "Assistir mais tarde",
      Description: "Descrição:",
      Actors: "Atores:",
      YouWatchedThisMovie: "Você assistiu esse filme?",
      DrawAgain: "Sortear Novamente",
      Cancel: "Cancelar",
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
      Romance: "Romance",
      RecommendMovie: "Recomiendo esta película:",
      SelectFilters: "Seleccionar Filtros",
      Genres: "Géneros",
      Platforms: "Plataformas",
      SearchMovie: "Buscar Película",
      Share: "Compartir",
      WatchLater: "Ver Más Tarde",
      Description: "Descripción:",
      Actors: "Actores:",
      YouWatchedThisMovie: "Has visto esta película",
      DrawAgain: "Sortear Nuevamente",
      Cancel: "Cancelar",
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
      Romance: "Romance",
      RecommendMovie: "Je recommande ce film:",
      SelectFilters: "Sélectionner les Filtres",
      Genres: "Genres",
      Platforms: "Plateformes",
      SearchMovie: "Rechercher Film",
      Share: "Partager",
      WatchLater: "Regarder Plus Tard",
      Description: "Description:",
      Actors: "Acteurs:",
      YouWatchedThisMovie: "Vous avez regardé ce film",
      DrawAgain: "Tirer à Nouveau",
      Cancel: "Annuler",
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
      Romance: "Romantik",
      RecommendMovie: "Ich empfehle diesen Film:",
      SelectFilters: "Filter Auswählen",
      Genres: "Genres",
      Platforms: "Plattformen",
      SearchMovie: "Film Suchen",
      Share: "Teilen",
      WatchLater: "Später Ansehen",
      Description: "Beschreibung:",
      Actors: "Schauspieler:",
      YouWatchedThisMovie: "Sie haben diesen Film gesehen",
      DrawAgain: "Erneut Ziehen",
      Cancel: "Abbrechen",
    },
    italian: {
      Action: "Azione",
      Adventure: "Avventura",
      Animation: "Animazione",
      Comedy: "Commedia",
      Drama: "Dramma",
      Family: "Famiglia",
      Fantasy: "Fantasia",
      Horror: "Horror",
      Music: "Musica",
      Mystery: "Mistero",
      ScienceFiction: "Fantascienza",
      All: "Tutti",
      Romance: "Romantico",
      RecommendMovie: "Raccomando questo film:",
      SelectFilters: "Seleziona Filtri",
      Genres: "Generi",
      Platforms: "Piattaforme",
      SearchMovie: "Cerca Film",
      Share: "Condividi",
      WatchLater: "Guarda Più Tardi",
      Description: "Descrizione:",
      Actors: "Attori:",
      YouWatchedThisMovie: "Hai visto questo film",
      DrawAgain: "Sorteggia di Nuovo",
      Cancel: "Annulla",
    },
    chinese: {
      Action: "动作",
      Adventure: "冒险",
      Animation: "动画",
      Comedy: "喜剧",
      Drama: "戏剧",
      Family: "家庭",
      Fantasy: "幻想",
      Horror: "恐怖",
      Music: "音乐",
      Mystery: "神秘",
      ScienceFiction: "科幻",
      All: "所有",
      Romance: "浪漫",
      RecommendMovie: "我推荐这部电影：",
      SelectFilters: "选择过滤器",
      Genres: "类型",
      Platforms: "平台",
      SearchMovie: "搜索电影",
      Share: "分享",
      WatchLater: "稍后观看",
      Description: "描述：",
      Actors: "演员：",
      YouWatchedThisMovie: "你看过这部电影",
      DrawAgain: "再次抽奖",
      Cancel: "取消",
    },
  };

  // Exemplo de uso
  const platforms = {
    "384": "Max",
    "119": "Amazon Prime Video",
    "8": "Netflix",
    "619": "Star Plus",
    "337": "Disney Plus",
    "350": "Apple TV Plus",
  };

  // const generosFiltro = {
  //   "28": "Ação",
  //   "12": "Aventura",
  //   "16": "Animação",
  //   "35": "Comédia",
  //   "18": "Drama",
  //   "10751": "Família",
  //   "14": "Fantasia",
  //   "27": "Terror",
  //   "10402": "Música",
  //   "9648": "Mistério",
  //   "10749": "Romance",
  //   "878": "Ficção científica",
  // };

  const { language } = useConfiguration();

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
    "10749": translation[language].Romance,
    "878": translation[language].ScienceFiction,
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();

    return `${year}`;
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

  const availablePlatformIds = Object.keys(platforms).filter(
    (id) => id !== "null"
  );

  const handleFetchMovie = () => {
    setIsDetailsLoading(true);

    // Escolhe aleatoriamente uma plataforma se houver plataformas selecionadas
    const platformIds =
      selectedPlatforms.length > 0
        ? [
            selectedPlatforms[
              Math.floor(Math.random() * selectedPlatforms.length)
            ],
          ]
        : []; // Retorna um array com um único elemento selecionado aleatoriamente

    // Escolhe aleatoriamente um gênero se houver gêneros selecionados, ou um aleatório se não
    const genreIds =
      selectedGenres.length > 0
        ? [selectedGenres[Math.floor(Math.random() * selectedGenres.length)]]
        : [
            Object.keys(generosFiltro)[
              Math.floor(Math.random() * Object.keys(generosFiltro).length)
            ],
          ];

    fetchRandomMovie({ genres: genreIds, platforms: platformIds })
      .then((movie: Movie | null) => {
        if (movie) {
          fetchMovieDetails(movie.id, 0, " " ,(movieDetails) => {
            setIsDetailsLoading(false); // Termina o loading
            setSelectedMovie(movieDetails);
            console.log(selectedMovie?.actors);
            setMovieDetails(false);
          });
        } else {
          setIsDetailsLoading(false); // Termina o loading se nenhum filme for encontrado
        }
      })
      .catch((error) => {
        console.error("Error fetching movie:", error);
        setIsDetailsLoading(false); // Termina o loading em caso de erro
      });
  };

  const toggleAllPlatforms = () => {
    const allPlatformsSelected =
      selectedPlatforms.length === availablePlatformIds.length;

    if (allPlatformsSelected) {
      // Se todas estiverem selecionadas, desmarque todas
      setSelectedPlatforms([]);
    } else {
      // Caso contrário, selecione todas
      setSelectedPlatforms(availablePlatformIds);
    }
  };

  const handleAddToList = () => {
    if (selectedMovie) {
      const toWatch: Movie = {
        id: selectedMovie.id,
        title: selectedMovie.title,
        date: new Date().toLocaleDateString(),
        rating: 0,
        imageUrl: selectedMovie.imageUrl,
        comment: " ",
        streamingPlatforms: selectedMovie.streamingPlatforms, // Adicionado aqui

        genreId: selectedMovie.genreId,
        alternateImageUrl: selectedMovie.alternateImageUrl, // Nova propriedade para o banner do filme
        description: selectedMovie.description, // Descrição do filme
        actors: selectedMovie.actors, // Novo
      };

      addToWatchList(toWatch);
      setModalVisible(false);
      setSelectedMovie(null);
    }
  };

  const openModalMovie = (movieId: number) => {
    setSelectedMovie(null); // Reseta o filme selecionado
    setIsDetailsLoading(true); // Inicia o loading
    setModalVisible(true); // Abre o modal

    // Chamada para fetchMovieDetails sem a verificação de showModal
    fetchMovieDetails(movieId, 0, " " ,(movieDetails) => {
      setSelectedMovie(movieDetails);
      setIsDetailsLoading(false);
    });
  };

  const handlePressItemModalType = (item: any) => {
    setModalVisible(false); // Feche o modal atual
    setTimeout(() => {
      fetchMovieDetails(item.id, 0, " " ,(movieDetails) => {
        setSelectedMovie(movieDetails);
        setIsDetailsLoading(false); // Carregamento concluído
        openModalMovie(movieDetails.id);
      });
    }, 300); // Adicione um pequeno atraso para garantir que o modal foi fechado
  };

  const handleShare = () => {
    if (!selectedMovie) return; // Certifique-se de que há um filme selecionado

    const message = `> ${translation[language].RecommendMovie}\n\n*${selectedMovie.title}* \n${selectedMovie.description}

    \nLINK: watchfolio.com.br/movie/${selectedMovie.id}/?popup=true`;
    Share.share({
      message,
    }).catch((error) => console.error("Error sharing:", error));
  };

  useEffect(() => {
    console.log(selectedMovie?.title);
  }, [selectedMovie]);

  return (
    <>
      <TouchableOpacity
        key={1}
        style={[styles.fab, { backgroundColor: theme.borderRed }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.fabTextAligner}>
          <Icon name="dice" size={26} color={theme.text} />
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
                {translation[language].SelectFilters}
              </Text>
              <Text style={[styles.subHeader, { color: theme.text }]}>
                {translation[language].Genres}
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
                {translation[language].Platforms}
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
                <Chip
                  key="todos"
                  style={
                    selectedPlatforms.length === availablePlatformIds.length
                      ? { backgroundColor: theme.borderRed }
                      : undefined
                  }
                  rippleColor="rgba(0, 0, 0, 0.3)"
                  selected={
                    selectedPlatforms.length === availablePlatformIds.length
                  }
                  onPress={toggleAllPlatforms}
                >
                  {translation[language].All}
                </Chip>
              </View>

              <View style={{ marginVertical: 40 }}>
                <TouchableOpacity
                  key={2}
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.borderRed },
                  ]}
                  onPress={handleFetchMovie}
                >
                  <Text
                    style={{ color: theme.textButtons, textAlign: "center" }}
                  >
                    {translation[language].SearchMovie}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ads}>
                <View>
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
                          key={5}
                          style={{
                            ...styles.modalButton,
                            marginBottom: 10,
                            backgroundColor: "#4caf50", // Cor verde para diferenciar
                          }}
                          onPress={handleShare}
                        >
                          <Text style={styles.textStyle}>
                            {translation[language].Share}{" "}
                          </Text>
                        </TouchableHighlight>
                        <TouchableOpacity
                          key={3}
                          style={[
                            styles.modalButton,
                            { backgroundColor: theme.borderRed },
                          ]}
                          onPress={handleAddToList}
                        >
                          <Text
                            style={{ color: theme.text, textAlign: "center" }}
                          >
                            {translation[language].WatchLater}
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
                        {translation[language].Description}{" "}
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

                    <View style={{ marginTop: 30 }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {translation[language].Actors}
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
                              setModalVisible(false);
                              setSelectedMovie(null);
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
                      {translation[language].YouWatchedThisMovie}
                    </Text>
                    <View style={{ marginBottom: 50 }}>
                      <View style={styles.modalButtons}>
                        <TouchableHighlight
                          key={6}
                          style={{
                            ...styles.modalButton,
                            backgroundColor: theme.borderRed,
                          }}
                          onPress={handleFetchMovie}
                        >
                          <Text style={styles.textStyle}>
                            {translation[language].DrawAgain}
                          </Text>
                        </TouchableHighlight>

                        <TouchableHighlight
                          key={7}
                          style={{
                            ...styles.modalButton,
                            backgroundColor: theme.modalBackgroundSecondary,
                          }}
                          onPress={() => {
                            setModalVisible(false);
                            setSelectedMovie(null);
                          }}
                        >
                          <Text style={styles.textStyle}>
                            {translation[language].Cancel}
                          </Text>
                        </TouchableHighlight>
                      </View>
                    </View>

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
              </Animated.ScrollView>
            </View>
          )}
        </ScrollView>
      </Modal>

      <CustomModalActor
        showModalActor={showModalActor}
        isDetailsLoading={isDetailsLoading}
        selectedActor={selectedActor!}
        closeModal={() => setShowModalActor(false)}
        openModal={openModalMovie}
      ></CustomModalActor>

      <CustomModalMovie
        showModal={(showModalMovie)}
        isDetailsLoading={isDetailsLoading}
        selectedMovie={selectedMovie!}
        closeModal={() => setShowModalMovie(false)}
        handleShare={handleShare}
        handleAddToList={handleAddToList}
        openModalActor={openModalActor}
        handlePressItemModalType={handlePressItemModalType}
        formatDate={formatDate}
      />
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

  movieImage: {
    width: isTablet ? 150 : 100,
    height: isTablet ? 230 : 150,
    resizeMode: "cover",
    borderRadius: 10,
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
  ads: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginVertical: 15,
    gap: 5,
  },
});
